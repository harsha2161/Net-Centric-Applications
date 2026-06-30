import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Authenticates the user with Google ID Token.
 * @param {string} idToken - The Google ID Token
 * @param {string} [inviteToken] - The optional invite token
 * @returns {Promise<object>} Authenticated user and JWT token
 */
export const loginWithGoogleIdToken = async (idToken, inviteToken = '') => {
  const res = await axios.post(`${backendUrl}/api/auth/google`, {
    idToken,
    inviteToken
  });
  return res.data;
};

/**
 * Logs in with a developer mock account.
 * @param {string} role - The target role ('Admin' | 'Student' | 'Recruiter')
 * @returns {Promise<object>} Authenticated user and token
 */
export const loginWithMockAccount = async (role) => {
  let email = 'student@university.edu';
  let name = 'Alice Student';
  if (role === 'Admin') {
    email = 'admin@university.edu';
    name = 'System Admin';
  } else if (role === 'Recruiter') {
    email = 'recruiter@techcorp.com';
    name = 'Bob Recruiter';
  }

  const res = await axios.get(`${backendUrl}/api/auth/google/callback`, {
    params: {
      mockEmail: email,
      mockName: name,
      mockRole: role,
      mockGoogleId: `mock-google-${role.toLowerCase()}`
    }
  });

  return res.data;
};

/**
 * Registers with a developer mock account.
 * @param {string} tokenInput 
 * @param {string} nameInput 
 * @param {string} emailInput 
 * @returns {Promise<object>}
 */
export const registerWithMockAccount = async (tokenInput, nameInput, emailInput) => {
  const res = await axios.get(`${backendUrl}/api/auth/google/callback`, {
    params: {
      inviteToken: tokenInput,
      mockEmail: emailInput,
      mockName: nameInput,
      mockGoogleId: `mock-google-reg-${Date.now()}`
    }
  });
  return res.data;
};
