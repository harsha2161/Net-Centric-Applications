import { Menu, X, BookOpen, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const handleLogoutClick = () => {
    setIsConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsConfirmOpen(false);
    navigate('/');
    setTimeout(() => {
      logout();
    }, 0);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        className="fixed top-0 w-full z-50 glass px-6 py-4"
      >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="bg-indigo-500/20 p-2 rounded-xl">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            UniShowcase
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
          {!token && (
            <Link to="/projects" className="text-sm text-zinc-400 hover:text-white transition-colors animate-fade-in">Browse Projects</Link>
          )}
          {user?.role === 'Admin' && (
            <Link to="/admin" className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors">
              <Shield className="w-4 h-4 animate-pulse" /> Admin Dashboard
            </Link>
          )}
          {user?.role === 'Recruiter' && (
            <Link to="/recruiter" className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors">
              <BookOpen className="w-4 h-4" /> Recruiter Dashboard
            </Link>
          )}
          {user?.role === 'Student' && (
            <Link to="/studentsdashbourd" className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors">
              <BookOpen className="w-4 h-4" /> Student Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {token ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">
                Hi, <strong className="text-zinc-200">{user?.name}</strong> ({user?.role})
              </span>
              <button 
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-350 transition-colors cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-red-950 px-3 py-1.5 rounded-full"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                Register / Join
              </Link>
            </>
          )}
        </div>

        <button 
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full glass border-t border-zinc-800/50 py-4 px-6 flex flex-col space-y-4"
        >
          {!token && (
            <Link to="/projects" className="text-sm text-zinc-400" onClick={() => setIsOpen(false)}>Browse Projects</Link>
          )}
          {user?.role === 'Admin' && (
            <Link to="/admin" className="text-sm text-indigo-400 font-medium flex items-center gap-1.5" onClick={() => setIsOpen(false)}>
              <Shield className="w-4 h-4" /> Admin Dashboard
            </Link>
          )}
          {user?.role === 'Recruiter' && (
            <Link to="/recruiter" className="text-sm text-emerald-400 font-medium flex items-center gap-1.5" onClick={() => setIsOpen(false)}>
              <BookOpen className="w-4 h-4" /> Recruiter Dashboard
            </Link>
          )}
          {user?.role === 'Student' && (
            <Link to="/studentsdashbourd" className="text-sm text-cyan-400 font-medium flex items-center gap-1.5" onClick={() => setIsOpen(false)}>
              <BookOpen className="w-4 h-4" /> Student Dashboard
            </Link>
          )}
          <hr className="border-zinc-800" />
          {token ? (
            <div className="flex flex-col space-y-3">
              <span className="text-sm text-zinc-400">Logged in as {user?.name} ({user?.role})</span>
              <button 
                onClick={() => {
                  handleLogoutClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-red-400 text-left"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-zinc-300 text-left" onClick={() => setIsOpen(false)}>Log in</Link>
              <Link to="/register" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg text-center" onClick={() => setIsOpen(false)}>
                Register / Join
              </Link>
            </>
          )}
        </motion.div>
      )}
      </motion.nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <LogOut className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Sign Out?</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Are you sure you want to log out of your session? You will need to sign in again to access your dashboard.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors cursor-pointer"
                >
                  Yes, Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
