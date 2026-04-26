import React from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      // Save User Profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        createdAt: serverTimestamp(),
      });
      
      // Call our backend to send confirmation email
      try {
        await fetch('/api/signup-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name }),
        });
      } catch (err) {
        console.error("Email API failed, but signup succeeded:", err);
      }

      navigate('/firms');
    } catch (err: any) {
      setError(err.message);
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
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter italic uppercase">Join the<br />Network.</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Initialize your trader profile.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
              SYSTEM_ERROR: {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Identity Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-12 py-4 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-tight"
                placeholder="TRADER_ALPHA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Transmission Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-12 py-4 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors tracking-tight"
                placeholder="trader@forex.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Secure Password</label>
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
                Confirm Registry <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <div className="text-[10px] text-center text-zinc-600 italic uppercase tracking-tighter mt-4 leading-tight">
            A confirmation email will be dispatched to your inbox immediately upon registration.
          </div>
        </form>

        <div className="mt-10 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest">
          Active Registry?{' '}
          <Link to="/login" className="text-emerald-500 hover:underline">
            Restore Connection
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
