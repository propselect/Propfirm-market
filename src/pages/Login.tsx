import React from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/firms');
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter italic uppercase">Welcome<br />Back.</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Secure link establishing...</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
              AUTH_FAILURE: {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Terminal Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-12 py-4 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-tight"
                placeholder="trader@forex.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Access Key</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-12 py-4 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase py-5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group tracking-tighter hover:bg-emerald-400"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Initiate Link <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest">
          New User Path?{' '}
          <Link to="/signup" className="text-emerald-500 hover:underline">
            Register Terminal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
