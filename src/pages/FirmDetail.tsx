import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_FIRMS } from '../constants';
import { CheckCircle2, XCircle, ExternalLink, ArrowLeft, Trophy, Shield, Globe, Loader2, AlertTriangle, ThumbsUp, Copy, Check } from 'lucide-react';
import { getRatingColor, getRatingLabel, getDynamicRating } from '../lib/theme';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot, doc, setDoc, deleteDoc, collectionGroup, serverTimestamp } from 'firebase/firestore';
import { PropFirm } from '../types';
import ReviewSection from '../components/ReviewSection';
import ReportFirmModal from '../components/ReportFirmModal';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function FirmDetail() {
  const { slug } = useParams();
  const [user] = useAuthState(auth);
  const [firm, setFirm] = React.useState<PropFirm | null>(INITIAL_FIRMS.find(f => f.slug === slug) || null);
  const [loading, setLoading] = React.useState(!firm);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [votes, setVotes] = React.useState<number>(0);
  const [hasVoted, setHasVoted] = React.useState<boolean>(false);
  const [isVoting, setIsVoting] = React.useState(false);
  const [avgRating, setAvgRating] = React.useState<number>(0);

  React.useEffect(() => {
    async function fetchFirm() {
      if (!slug) return;
      const q = query(collection(db, 'firms'), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setFirm({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PropFirm);
      }
      setLoading(false);
    }
    fetchFirm();
  }, [slug]);

  React.useEffect(() => {
    if (!firm?.id) return;
    const q = query(collection(db, 'votes'), where('firmId', '==', firm.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVotes(snapshot.size);
      if (user) {
        const userVote = snapshot.docs.find(d => d.id === `${user.uid}_${firm.id}`);
        setHasVoted(!!userVote);
      }
    });

    return () => unsubscribe();
  }, [firm?.id, user]);

  React.useEffect(() => {
    if (!firm?.id) return;
    const reviewsQ = query(collection(db, 'firms', firm.id, 'reviews'));
    const unsubscribe = onSnapshot(reviewsQ, (snapshot) => {
      const docs = snapshot.docs;
      if (docs.length > 0) {
        const total = docs.reduce((acc, d) => acc + (d.data().rating || 0), 0);
        setAvgRating(total / docs.length);
      } else {
        setAvgRating(0);
      }
    }, (error) => {
      console.error('Review snapshot failed:', error);
      handleFirestoreError(error, OperationType.LIST, `firms/${firm.id}/reviews`);
    });

    return () => unsubscribe();
  }, [firm?.id]);

  const handleVote = async () => {
    if (!user || !firm) {
      alert('Authentication required to cast your vote.');
      return;
    }

    setIsVoting(true);
    const voteId = `${user.uid}_${firm.id}`;
    const voteRef = doc(db, 'votes', voteId);

    try {
      if (hasVoted) {
        await deleteDoc(voteRef);
      } else {
        await setDoc(voteRef, {
          userId: user.uid,
          firmId: firm.id,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Voting failed:', error);
      alert('Encryption protocol failure: Vote could not be registered.');
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Syncing Database Nodes...</span>
        </div>
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 italic uppercase tracking-tighter">Node Not Found</h1>
        <Link to="/firms" className="text-emerald-500 hover:underline font-black uppercase tracking-widest text-xs">Return to Central Hub</Link>
      </div>
    );
  }

  const dynamicRating = getDynamicRating(avgRating, votes);
  const ratingColor = getRatingColor(dynamicRating);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 bg-zinc-950">
      <Link to="/firms" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={16} /> Restore Directory View
      </Link>

      <div className="grid lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 pb-16 border-b border-zinc-800">
            <div className="flex items-center gap-8">
              <div className="w-28 h-28 bg-zinc-900 border-2 border-zinc-800 rounded-[2rem] flex items-center justify-center p-6 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {firm.logoUrl ? (
                  <img 
                    src={firm.logoUrl} 
                    alt={firm.name} 
                    className="max-w-full max-h-full object-contain filter brightness-110 relative z-10 transition-transform group-hover:scale-110" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firm.name)}&background=020617&color=10b981&bold=true&format=svg`;
                    }}
                  />
                ) : (
                  <span className="text-5xl font-black text-zinc-700 uppercase italic leading-none relative z-10">{firm.name[0]}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">{firm.name}</h1>
                  <Shield size={32} className="text-emerald-500 animate-pulse hidden md:block" />
                </div>
                <div className="flex items-center gap-4">
                  <div className={`px-5 py-2 rounded-xl border-2 text-[10px] font-black tracking-[0.2em] inline-flex items-center gap-2 uppercase shadow-lg ${ratingColor}`}>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" /> {getRatingLabel(dynamicRating)} Audit Status
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-widest border border-zinc-800 px-4 py-2 rounded-xl">
                    <Globe size={14} /> LIVE_NODE_01
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {firm.discountCode && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between gap-4 mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Max Discount Code</span>
                    <span className="text-lg font-black text-white tracking-tighter leading-none">{firm.discountCode}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(firm.discountCode!)}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                    title="Copy Code"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <a 
                  href={firm.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white text-black font-black px-10 py-5 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-emerald-400 uppercase tracking-tighter"
                >
                  Access Terminal <ExternalLink size={20} />
                </a>
                <button 
                  onClick={handleVote}
                  disabled={isVoting}
                  className={`px-6 py-5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 ${hasVoted ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <ThumbsUp size={20} className={hasVoted ? 'fill-emerald-500/20' : ''} />
                  <span className="text-[10px] font-black tracking-widest">{votes}</span>
                </button>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="text-zinc-600 hover:text-rose-500 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <AlertTriangle size={14} /> Report Irregularity
              </button>
            </div>
          </header>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-emerald-500 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <CheckCircle2 size={16} /> Liquidity Pros
              </h3>
              <ul className="space-y-4">
                {firm.pros.map((pro, i) => (
                  <li key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-zinc-300 text-sm font-bold tracking-tight mb-2">
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-rose-500 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <XCircle size={16} /> Known Latency Issues
              </h3>
              <ul className="space-y-4">
                {firm.cons.map((con, i) => (
                  <li key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-zinc-300 text-sm font-bold tracking-tight mb-2">
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Specs */}
        <aside>
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-10 sticky top-32">
            <h3 className="text-white font-black text-xl uppercase italic mb-8 flex items-center gap-3 tracking-tighter">
              <Trophy size={20} className="text-emerald-500" /> Platform Specs
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Max Balance', val: firm.startingBalance },
                { label: 'Max Leverage', val: firm.maxLeverage },
                { label: 'Profit Split', val: firm.profitSplit },
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-zinc-800 last:border-0 grow">
                  <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{spec.label}</span>
                  <span className="text-white font-mono font-black text-sm uppercase tracking-tighter">{spec.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-zinc-800">
              <button className="w-full bg-zinc-950 border border-zinc-800 border-b-4 hover:border-emerald-500/50 text-zinc-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-xl transition-all">
                Submit Public Feed Audit
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Review Section */}
      <ReviewSection firmId={firm.id} />

      <ReportFirmModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        firmId={firm.id}
        firmName={firm.name}
      />
    </div>
  );
}
