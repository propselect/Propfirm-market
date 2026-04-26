import React from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Chrome } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [experience, setExperience] = React.useState('intermediate');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      // Save User Profile to Firestore (Real Trader profile)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        experienceLevel: experience,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Attempt backend confirmation (optional/non-blocking)
      try {
        await fetch('/api/signup-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name, experience }),
        });
      } catch (err) {
        console.error("Email API failed:", err);
      }

      navigate('/firms');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Manual entry is currently restricted in the system console. Please use "Initialize with Google" for priority clearance.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Ensure user document exists
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      navigate('/firms');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-zinc-950 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter italic uppercase leading-none">Join the<br />Network.</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Initialize your trader profile.</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full bg-zinc-800 text-white font-black uppercase py-4 rounded-xl transition-all border border-zinc-700 flex items-center justify-center gap-3 group tracking-widest text-[10px] hover:bg-zinc-700 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5 text-emerald-500" />
                Initialize with Google
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900 px-4 text-zinc-600 font-bold tracking-tighter uppercase italic text-[9px]">Manual Protocol</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
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
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Experience Level</label>
              <div className="flex gap-2">
                {['novice', 'intermediate', 'elite'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperience(lvl)}
                    className={`flex-1 py-3 text-[9px] font-black uppercase rounded-lg border transition-all ${experience === lvl ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                  >
                    {lvl}
                  </button>
                ))}
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
        </div>

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
