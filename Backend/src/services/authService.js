const User = require('../models/User');
const { generateInviteToken, verifyInviteToken, generateUserToken } = require('../utils/inviteGenerator');

class AuthService {
  async generateInviteLink(role = 'Student', email = '', frontendUrl = 'http://localhost:5173') {
    const validRoles = ['Student', 'Recruiter', 'Admin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    if (!email) {
      throw new Error('Email is required to send an invitation');
    }
    const token = generateInviteToken(role, email);
    const inviteLink = `${frontendUrl}/register?inviteToken=${token}`;

    // Create the Invitation record in the DB
    const Invitation = require('../models/Invitation');
    const invitation = await Invitation.create({
      email,
      role,
      token,
      status: 'Pending'
    });

    // Send email using mailer
    const { sendInvitationEmail } = require('../utils/mailer');
    let emailResult = {};
    try {
      emailResult = await sendInvitationEmail(email, role, inviteLink);
    } catch (err) {
      console.error('Failed to send nodemailer email, but invitation logged in DB:', err);
    }

    return { 
      token, 
      inviteLink, 
      role, 
      email, 
      invitation,
      previewUrl: emailResult.previewUrl 
    };
  }

  validateInvite(token) {
    if (!token) throw new Error('Invitation token is required');
    const decoded = verifyInviteToken(token);
    if (!decoded) throw new Error('Invalid or expired invitation token');
    return decoded;
  }

  async processUserRegistration({ googleId, name, email, profilePicture, inviteToken, mockRole }) {
    let user = await User.findOne({ email });
    if (user) {
      // If inviteToken is passed but user already exists, they are trying to register with a used account
      if (inviteToken) {
        throw new Error('This Google account is already registered. Please log in or use a different Google account to register.');
      }
      if (mockRole) {
        user.role = mockRole;
      }
      user.googleId = googleId || user.googleId;
      user.isVerified = true;
      await user.save();
      return { user, authToken: generateUserToken(user) };
    }

    // New user registration: requires inviteToken validation or mockRole in dev
    let role = 'Student';
    if (inviteToken) {
      const decodedInvite = this.validateInvite(inviteToken);
      role = decodedInvite.role || 'Student';
      const Invitation = require('../models/Invitation');
      await Invitation.findOneAndUpdate({ token: inviteToken }, { status: 'Completed' });
    } else if (mockRole) {
      role = mockRole;
    } else {
      throw new Error('Account not found. You must be invited by an Administrator to register.');
    }

    user = await User.create({
      googleId,
      name,
      email,
      profilePicture,
      role,
      isVerified: true
    });

    return { user, authToken: generateUserToken(user) };
  }

  async generateBulkInvites(invitationsList, frontendUrl = 'http://localhost:5173') {
    if (!Array.isArray(invitationsList)) {
      throw new Error('Invitations list must be an array');
    }

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const invite of invitationsList) {
      const { email, role } = invite;
      try {
        const res = await this.generateInviteLink(role || 'Student', email, frontendUrl);
        results.push({
          email,
          role,
          success: true,
          previewUrl: res.previewUrl,
          inviteLink: res.inviteLink
        });
        successCount++;
      } catch (err) {
        results.push({
          email,
          role,
          success: false,
          error: err.message
        });
        failedCount++;
      }
    }

    return {
      successCount,
      failedCount,
      results
    };
  }
}

module.exports = new AuthService();
