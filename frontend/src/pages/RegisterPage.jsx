import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import { loginWithGoogleIdToken } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const tokenInputRef = useRef(tokenInput);

  useEffect(() => {
    tokenInputRef.current = tokenInput;
  }, [tokenInput]);

  // Extract inviteToken from query string if available, store in session, and hide from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('inviteToken');
    if (token) {
      sessionStorage.setItem('inviteToken', token);
      setTokenInput(token);
      tokenInputRef.current = token;
      // Clean query parameters from address bar to hide inviteToken
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedToken = sessionStorage.getItem('inviteToken');
      if (savedToken) {
        setTokenInput(savedToken);
        tokenInputRef.current = savedToken;
      }
    }

    // Load Google Identity Services client script
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        initializeGoogleSignUp();
      };
    } else {
      initializeGoogleSignUp();
    }
  }, []);

  const initializeGoogleSignUp = () => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '630315576296-6tg1bknfkv7dkn9sgk1n7pb3k988ccnl.apps.googleusercontent.com',
        callback: handleGoogleAuthCallback
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-signup-button'),
        { theme: 'filled_blue', size: 'large', width: 384, text: 'signup_with', shape: 'pill' }
      );
    }
  };

  const handleGoogleAuthCallback = async (response) => {
    setIsLoading(true);
    setErrorMsg('');
    const currentToken = tokenInputRef.current || sessionStorage.getItem('inviteToken') || '';
    if (!currentToken) {
      setErrorMsg('University invite token is required before registering with Google. Please paste it above.');
      setIsLoading(false);
      return;
    }
    try {
      const data = await loginWithGoogleIdToken(response.credential, currentToken);
      login(data.token, data.user);
      
      // Clear token from sessionStorage on successful registration
      sessionStorage.removeItem('inviteToken');

      if (data.user?.role === 'Admin') {
        navigate('/admin');
      } else if (data.user?.role === 'Student') {
        navigate('/studentsdashbourd');
      } else if (data.user?.role === 'Recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/projects');
      }
    } catch (err) {
      console.error('Google Auth Registration Error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 cursor-pointer group">
          <div className="bg-indigo-500/20 p-2 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            UniShowcase
          </span>
        </Link>

        <Card>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Join the Portal</h1>
            <p className="text-zinc-400">Exclusive access for university members. Register using your invite token.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                University Invite Token <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Paste invite token here..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  required
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm text-zinc-400">Registering account...</p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center space-y-3 pt-4">
                <div className="w-full flex justify-center relative z-20">
                  <div id="google-signup-button"></div>
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  Fill in your invite token first, then continue with Google to complete registration.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Log in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
