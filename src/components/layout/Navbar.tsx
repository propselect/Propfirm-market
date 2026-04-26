import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import Logo from '../ui/Logo';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Firms', path: '/firms' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Education', path: '/education' },
    ...(user ? [
      { name: 'My Audits', path: '/my-audits' },
      { name: 'Admin', path: '/admin' }
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-20">
          <Link to="/">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-[10px] font-black uppercase tracking-widest">{user.displayName || user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white">Login</Link>
                <Link to="/signup" className="bg-white text-black text-xs font-black uppercase tracking-tight px-6 py-3 rounded-lg hover:bg-emerald-400 transition-colors">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
                {user ? (
                  <button onClick={handleLogout} className="text-left px-3 py-2 text-slate-400 flex items-center gap-2">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="px-3 py-2 text-slate-300">Login</Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)} className="mx-3 bg-emerald-600 text-white px-5 py-3 rounded-xl text-center">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
