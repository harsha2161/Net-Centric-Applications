import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import { loginWithGoogleIdToken } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setErrorMsg(decodeURIComponent(err));
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
        initializeGoogleSignIn();
      };
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '630315576296-6tg1bknfkv7dkn9sgk1n7pb3k988ccnl.apps.googleusercontent.com',
        callback: handleGoogleAuthCallback
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'filled_blue', size: 'large', width: 384, text: 'signin_with', shape: 'pill' }
      );
    }
  };

  const handleGoogleAuthCallback = async (response) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await loginWithGoogleIdToken(response.credential);
      login(data.token, data.user);
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
      console.error('Google Auth Error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Authentication failed');
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
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to access your projects and discover new talent.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-zinc-400">Verifying credentials...</p>
            </div>
          ) : (
            <div className="w-full flex justify-center mb-6 relative z-20">
              <div id="google-signin-button"></div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-zinc-400">
            Have an invite?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Register with invite token
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
