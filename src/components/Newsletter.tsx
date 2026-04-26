import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      // In production, we'd check for duplicates, but for this demo 
      // we'll focus on the simple 'addDoc' to keep the rules simple.
      await addDoc(collection(db, 'subscribers'), {
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: 'footer_signup'
      });

      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('Newsletter signup error:', err);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-12 max-w-4xl mx-auto overflow-hidden relative group">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <Mail className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Newsletter Signup</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Stay ahead of the market.</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Get weekly insights on top-performing prop firms, risk alerts, and exclusive industry data straight to your inbox.
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-emerald-500 font-bold text-sm">You're on the list!</p>
                <p className="text-emerald-500/70 text-[10px] uppercase font-bold tracking-wider mt-1">Check your inbox for confirmation</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-[10px] font-bold text-emerald-500/50 hover:text-emerald-500 uppercase tracking-widest transition-colors"
                >
                  Sign up another email
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Receive Updates</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                {status === 'error' && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center mt-2">
                    {errorMessage}
                  </p>
                )}
                <p className="text-slate-600 text-[10px] text-center uppercase font-bold tracking-wider opacity-50">
                  Zero spam. Strictly intelligence. Unsubscribe anytime.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
