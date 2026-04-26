import React from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Review } from '../types';
import { INITIAL_FIRMS } from '../constants';
import { MessageSquare, Star, Trash2, ShieldAlert, Send, Edit2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';

interface ReviewSectionProps {
  firmId: string;
}

export default function ReviewSection({ firmId }: ReviewSectionProps) {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [comment, setComment] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editComment, setEditComment] = React.useState('');
  const [editRating, setEditRating] = React.useState(5);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const userReview = React.useMemo(() => 
    user ? reviews.find(r => r.userId === user.uid) : null
  , [user, reviews]);

  React.useEffect(() => {
    const q = query(
      collection(db, 'firms', firmId, 'reviews'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(docSnap => ({ 
        id: docSnap.id, 
        fullPath: docSnap.ref.path,
        ...docSnap.data() 
      } as Review)));
    });

    return () => unsubscribe();
  }, [firmId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    // Safety check: ensure only one review per user
    if (userReview) {
      alert('You have already submitted an audit for this firm. Please edit your existing log.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the firm name for the audit log metadata
      const firmData = INITIAL_FIRMS.find(f => f.id === firmId || f.slug === firmId);
      const displayFirmName = firmData?.name || 'Unknown Node';

      await addDoc(collection(db, 'firms', firmId, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        firmId: firmId,
        firmName: displayFirmName,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setComment('');
      setRating(5);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingId || !editComment.trim()) return;

    setIsSubmitting(true);
    const path = `firms/${firmId}/reviews/${editingId}`;
    try {
      const reviewRef = doc(db, 'firms', firmId, 'reviews', editingId);
      await setDoc(reviewRef, {
        comment: editComment.trim(),
        rating: editRating,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setEditingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!user) {
      alert('Authentication required for this operation.');
      return;
    }
    
    const reviewToDelete = reviews.find(r => r.id === reviewId);
    
    // Fallback path construction if fullPath is missing for some reason
    const path = reviewToDelete?.fullPath || `firms/${firmId}/reviews/${reviewId}`;
    
    // Ensure path doesn't have leading slash which doc() handles automatically
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    setDeletingId(reviewId);
    try {
      console.log(`Initialising secure purge for ${cleanPath} (raw path: ${path})...`);
      const reviewRef = doc(db, cleanPath);
      
      await deleteDoc(reviewRef);
      console.log('Secure purge completed successfully.');
      
      if (editingId === reviewId) {
        setEditingId(null);
      }
    } catch (err: any) {
      console.error('Purge failed for path:', path, err);
      handleFirestoreError(err, OperationType.DELETE, path);
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (review: Review) => {
    setEditingId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const firmData = INITIAL_FIRMS.find(f => f.id === firmId || f.slug === firmId);

  return (
    <div className="mt-20 border-t border-zinc-800 pt-20">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            {firmData?.logoUrl ? (
              <img src={firmData.logoUrl} alt="" className="w-8 h-8 object-contain" />
            ) : (
              <MessageSquare className="text-emerald-500" size={24} />
            )}
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Public Audits.</h2>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Community Intelligence Feed ({reviews.length})</p>
          </div>
        </div>
        
        {firmData?.logoUrl && (
          <div className="hidden md:flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl group cursor-help">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Node_Log:</span>
            <img src={firmData.logoUrl} alt={firmData.name} className="h-6 w-auto grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
        {/* Review Form */}
        <div className="lg:col-span-1">
          {user ? (
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl sticky top-32">
              {userReview && !editingId ? (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <h3 className="text-emerald-500 font-black uppercase italic tracking-tighter mb-2 text-xl">Audit Detected</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      You have already submitted an audit for this firm. You can edit or remove your existing log.
                    </p>
                  </div>
                  <button
                    onClick={() => startEditing(userReview)}
                    className="w-full bg-white text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all tracking-widest"
                  >
                    Modify Existing Audit <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(userReview.id)}
                    disabled={isSubmitting || deletingId === userReview.id}
                    className="w-full bg-zinc-800 text-rose-500 font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all tracking-widest text-[10px] disabled:opacity-50"
                  >
                    {deletingId === userReview.id ? (
                      <><Loader2 className="animate-spin" size={14} /> Processing...</>
                    ) : (
                      <>Withdraw Log <Trash2 size={14} /></>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-black uppercase italic tracking-tighter mb-6 text-xl">
                    {editingId ? 'Edit Audit Log' : 'Sign New Audit'}
                  </h3>
                  <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Rating Calibration</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => editingId ? setEditRating(num) : setRating(num)}
                            className={`flex-1 py-3 rounded-lg font-black transition-all ${
                              (editingId ? editRating : rating) >= num ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-600'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Transmission Content</label>
                      <textarea
                        required
                        value={editingId ? editComment : comment}
                        onChange={(e) => editingId ? setEditComment(e.target.value) : setComment(e.target.value)}
                        rows={4}
                        placeholder="Describe your execution experience..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500 outline-none transition-colors placeholder:text-zinc-700 font-bold"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-white text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50 tracking-widest"
                      >
                        {isSubmitting ? 'Transmitting...' : (
                          <>
                            {editingId ? 'Update Log' : 'Deploy Audit'} <Send size={18} />
                          </>
                        )}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-6 bg-zinc-800 text-zinc-400 font-black uppercase rounded-xl hover:text-white transition-colors text-[10px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed p-10 rounded-3xl text-center flex flex-col items-center justify-center gap-6">
              <ShieldAlert size={48} className="text-zinc-800" />
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Unauthorized access.<br />Identity verification required to deploy audit logs.
              </p>
              <a href="/login" className="bg-zinc-800 text-white font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-all">
                Access Terminal
              </a>
            </div>
          )}
        </div>

        {/* Review List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="py-20 text-center border border-zinc-900 rounded-3xl grow">
              <p className="text-zinc-600 text-sm font-black uppercase tracking-widest italic">No public logs detected for this node.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-zinc-900 border p-8 rounded-3xl group relative overflow-hidden transition-colors ${editingId === review.id ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-zinc-800'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-black text-emerald-500 uppercase italic text-xs border border-zinc-700">
                          {review.userName[0]}
                        </div>
                        <div>
                          <p className="text-white font-black uppercase italic tracking-tighter">{review.userName}</p>
                          <p className="text-zinc-600 text-[10px] font-mono">
                            {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < review.rating ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-800'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed font-bold tracking-tight">
                      {review.comment}
                    </p>

                    {(user?.uid === review.userId) && (
                      <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-zinc-950/50 backdrop-blur-sm p-2 rounded-xl border border-zinc-800">
                        <button
                          onClick={() => startEditing(review)}
                          disabled={isSubmitting}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-500 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                          title="Edit Review"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
        <button
          onClick={() => handleDelete(review.id)}
          disabled={isSubmitting || deletingId === review.id}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-500 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          title="Permanently Delete Review"
        >
          {deletingId === review.id ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          {deletingId === review.id ? 'Purging...' : 'Delete Publicly'}
        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
