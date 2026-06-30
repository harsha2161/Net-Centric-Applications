const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0]?.value;
      const name = profile.displayName;
      const profilePicture = profile.photos && profile.photos[0]?.value;

      if (!email) {
        return done(new Error('Google account must have an email associated with it'), null);
      }

      const googleUser = {
        googleId: profile.id,
        name,
        email,
        profilePicture: profilePicture || ''
      };

      return done(null, googleUser);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
