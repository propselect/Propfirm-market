import React from 'react';
import { db, auth } from '../lib/firebase';
import { collectionGroup, query, where, onSnapshot, doc, deleteDoc, orderBy, getDocs, collection } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Review } from '../types';
import { INITIAL_FIRMS } from '../constants';
import { Trash2, MessageSquare, Star, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';

const FIRM_ID_MAP: Record<string, string> = {
  '1': 'ftmo',
  '2': 'the5ers',
  '3': 'topstep',
  '4': 'myforexfunds',
  '5': 'lux-trading'
};

export default function MyReviews() {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deletingIds, setDeletingIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!user) return;

    // Use collectionGroup to find all reviews by this user across all firms
    const q = query(
      collectionGroup(db, 'reviews'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const reviewData = docSnap.data();
        const fullPath = docSnap.ref.path;
        const pathFirmId = docSnap.ref.parent.parent?.id || '';
        const mappedId = FIRM_ID_MAP[pathFirmId] || pathFirmId;
        const fallbackFirm = INITIAL_FIRMS.find(f => f.id === mappedId || f.slug === mappedId || f.id === pathFirmId);
        
        return {
          id: docSnap.id,
          fullPath,
          ...reviewData,
          firmId: mappedId,
          firmName: reviewData.firmName || fallbackFirm?.name || 'Unknown Node',
          logoUrl: fallbackFirm?.logoUrl
        };
      });
      
      // In-memory sort by createdAt desc
      const sortedData = (data as any[]).sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setReviews(sortedData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching my reviews:", error);
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'collection_group/reviews');
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (review: any) => {
    if (!user) {
      alert('Authentication required.');
      return;
    }

    setDeletingIds(prev => [...prev, review.id]);
    const path = review.fullPath || `firms/${review.firmId}/reviews/${review.id}`;
    
    try {
      console.log(`Initiating purge for: ${path}`);
      
      // Ensure path doesn't have leading slash
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      const reviewRef = doc(db, cleanPath);
      
      await deleteDoc(reviewRef);
      console.log('Secure purge completed succesfully.');
    } catch (err: any) {
      console.error('Purge failed for path:', path, err);
      // Detailed error logging to help identify why it's failing
      const errorMessage = err?.message || 'Unknown error';
      alert(`Withdrawal Failed: ${errorMessage}. System security rejected the purge request.`);
      handleFirestoreError(err, OperationType.DELETE, path);
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== review.id));
    }
  };

  const [isDeletingAll, setIsDeletingAll] = React.useState(false);
  const handleMassPurge = async () => {
    if (!user) return;
    if (!confirm('GLOBAL PURGE INITIATED: This will erase EVERY SINGLE audit log in the entire database. This operation is restricted to Super Admins. PROCEED?')) return;

    setIsDeletingAll(true);
    try {
      const allReviewsSnapshot = await getDocs(collectionGroup(db, 'reviews'));
      const deletePromises = allReviewsSnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      alert(`SUCCESS: ${allReviewsSnapshot.size} audit logs have been purged from the global ledger.`);
    } catch (err: any) {
      alert(`ERROR: Global purge failed. ${err.message}`);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const [isPurging, setIsPurging] = React.useState(false);
  const [purgeProgress, setPurgeProgress] = React.useState('');

  const handlePurgeIdentity = async () => {
    if (!user) return;
    
    const confirmMessage = 'FATAL SECURITY OVERRIDE: Initiating total wipe of your identity and all public audit logs. This cannot be undone. All transmissions linked to your Node_ID will be permanently erased. Proceed?';
    if (!confirm(confirmMessage)) return;

    setIsPurging(true);
    setPurgeProgress('Initializing purge sequence...');

    try {
      // 1. Find and delete all reviews across all firms
      setPurgeProgress('Locating all submitted audit logs...');
      const reviewsQuery = query(
        collectionGroup(db, 'reviews'),
        where('userId', '==', user.uid)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      if (!reviewsSnapshot.empty) {
        setPurgeProgress(`Purging ${reviewsSnapshot.size} audit logs from public ledger...`);
        const deletePromises = reviewsSnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);
      }

      // 2. Find and delete all reports
      setPurgeProgress('Scanning for incident reports...');
      const reportsQuery = query(
        collection(db, 'reports'),
        where('userId', '==', user.uid)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      if (!reportsSnapshot.empty) {
        const reportPromises = reportsSnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(reportPromises);
      }

      // 2.5 Find and delete all votes
      setPurgeProgress('Stripping interaction votes...');
      const votesQuery = query(
        collection(db, 'votes'),
        where('userId', '==', user.uid)
      );
      const votesSnapshot = await getDocs(votesQuery);
      if (!votesSnapshot.empty) {
        const votePromises = votesSnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(votePromises);
      }

      // 3. Delete user profile
      setPurgeProgress('Erasing user profile index...');
      await deleteDoc(doc(db, 'users', user.uid));

      // 4. Delete the Auth account
      setPurgeProgress('Decommissioning authentication credentials...');
      await user.delete();

      setPurgeProgress('Identity fully purged. Redirecting...');
      alert('SYSTEM NOTIFICATION: Your identity and all associated meta-data have been successfully purged from the PropEDGE network.');
      window.location.href = '/';
    } catch (err: any) {
      console.error('Critical purge failure:', err);
      if (err.code === 'auth/requires-recent-login') {
        alert('SECURITY PROTOCOL: Purge halted. This operation requires a fresh authentication token. Please log out and log back in before attempting to purge your identity.');
      } else {
        alert(`PURGE ERROR: ${err.message || 'Unknown system error'}. Tactical manual override may be required.`);
        handleFirestoreError(err, OperationType.DELETE, 'IDENTITY_PURGE');
      }
    } finally {
      setIsPurging(false);
      setPurgeProgress('');
    }
  };

  const isSuperAdmin = user?.email === 'tafareabdulmalik@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center pt-20">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Syncing User Logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Logo size="lg" className="mb-6" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-1">
              Centralized management for all your submitted firm logs.
            </p>
            {isSuperAdmin && (
              <button 
                onClick={handleMassPurge}
                disabled={isDeletingAll}
                className="mt-6 bg-rose-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 transition-all flex items-center gap-2"
              >
                {isDeletingAll ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Global Purge: All Public Audits
              </button>
            )}
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node_ID: {user?.uid.slice(0, 8)}...</span>
          </div>
        </header>

        {reviews.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-[2.5rem] p-20 text-center">
            <MessageSquare className="text-zinc-800 mx-auto mb-6" size={64} />
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-4">No active logs detected</h2>
            <p className="text-zinc-600 mb-8 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
              Your audit trail is empty. Start providing feedback on prop firms to build your credibility.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/firms"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all text-xs"
              >
                Explore Firms <ArrowRight size={16} />
              </Link>
              <button 
                onClick={() => auth.signOut()}
                className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-400 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-700 hover:text-white transition-all text-xs"
              >
                Leave Terminal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid gap-6">
              <AnimatePresence mode="popLayout">
                {reviews.map((review: any, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6 text-left">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center p-2 border border-zinc-800 group-hover:border-emerald-500/30 transition-colors overflow-hidden shrink-0">
                          {review.logoUrl ? (
                            <img 
                              src={review.logoUrl} 
                              alt="" 
                              className="w-full h-full object-contain brightness-90 group-hover:brightness-110 transition-all" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=ftmo.com&sz=128';
                              }}
                            />
                          ) : (
                            <MessageSquare className="text-zinc-800" size={24} />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1 block">Source Node</span>
                          <h3 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
                            {review.firmName || 'Unknown Firm'} 
                            <Link 
                              to={`/firms/${review.firmId}`}
                              className="p-1 hover:text-emerald-400 transition-colors"
                            >
                              <ArrowRight size={14} />
                            </Link>
                          </h3>
                          <p className="text-zinc-600 text-[10px] font-mono mt-1">
                            LOGD_TIME: {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleString() : 'PENDING'}
                          </p>
                        </div>
                      </div>
                      <div className="flex bg-zinc-950 p-2 rounded-lg gap-0.5 border border-zinc-800/50">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={12} 
                            className={star <= review.rating ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-800'} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-zinc-300 text-sm font-bold uppercase tracking-widest leading-relaxed mb-8 bg-zinc-950/30 p-6 rounded-2xl border border-zinc-800/20 italic">
                      "{review.comment}"
                    </p>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleDelete(review)}
                        disabled={deletingIds.includes(review.id)}
                        className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingIds.includes(review.id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {deletingIds.includes(review.id) ? 'WITHDRAWING...' : 'Withdraw Review'}
                      </button>
                      <Link
                        to={`/firms/${review.firmId}`}
                        className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        View Firm Page
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Danger Zone */}
            <div className="mt-20 pt-20 border-t border-zinc-900 px-2 lg:px-0">
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-rose-500 mb-2">Terminal Termination</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-sm">
                    {isPurging 
                      ? <span className="text-rose-400 animate-pulse">{purgeProgress}</span>
                      : 'Purging your identity will erase all audit logs, profile data, and credentials permanently.'
                    }
                  </p>
                </div>
                <button 
                  onClick={handlePurgeIdentity}
                  disabled={isPurging}
                  className="w-full md:w-auto bg-rose-600 text-white font-black px-8 py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isPurging && <Loader2 size={16} className="animate-spin" />}
                  {isPurging ? 'PURGING...' : 'Purge Identity'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
