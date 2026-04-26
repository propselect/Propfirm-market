import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReportFirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  firmName: string;
  firmId: string;
}

export default function ReportFirmModal({ isOpen, onClose, firmName, firmId }: ReportFirmModalProps) {
  const [reason, setReason] = React.useState('Scam / Fraud');
  const [details, setDetails] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userEmail: user.email,
        firmId,
        firmName,
        reason,
        details,
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setDetails('');
      }, 2000);
    } catch (err) {
      console.error('Report failed:', err);
      alert('Report submission failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 sm:p-10 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="text-emerald-500" size={40} />
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Report Logged.</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Incident terminal update confirmed.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-rose-500/10 rounded-xl">
                    <AlertTriangle className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Flag Critical.</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Reporting: {firmName}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Violation Category</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:border-rose-500 outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option>Scam / Fraud</option>
                      <option>Withdrawal Issues</option>
                      <option>Rule Ambiguity</option>
                      <option>Bad Support</option>
                      <option>Incorrect Data</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Incident Evidence / Details</label>
                    <textarea
                      required
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={4}
                      placeholder="Upload IDs or describe the situation in detail..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:border-rose-500 outline-none transition-colors placeholder:text-zinc-700 font-bold"
                    />
                  </div>

                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex gap-4">
                    <ShieldAlert className="text-zinc-600 shrink-0" size={18} />
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                      All reports are legally binding. Malicious reports will result in permanent account suspension.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-rose-600 text-white font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500 transition-all disabled:opacity-50 tracking-widest shadow-lg shadow-rose-900/20"
                  >
                    {isSubmitting ? 'Transmitting Data...' : 'Deploy Incident Report'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
