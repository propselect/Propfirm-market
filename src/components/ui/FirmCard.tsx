import React from 'react';
import { PropFirm } from '../../types';
import { ExternalLink, ChevronRight, Layers, Percent, Zap, ThumbsUp, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRatingColor, getRatingLabel, getDynamicRating } from '../../lib/theme';
import { motion } from 'motion/react';
import { db, auth } from '../../lib/firebase';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc, getDocs, collectionGroup } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { handleFirestoreError, OperationType } from '../../lib/firebase-errors';

interface FirmCardProps {
  firm: PropFirm;
  index: number;
  key?: any;
}

export default function FirmCard({ firm, index }: FirmCardProps) {
  const [user] = useAuthState(auth);
  const [votes, setVotes] = React.useState<number>(0);
  const [hasVoted, setHasVoted] = React.useState<boolean>(false);
  const [isVoting, setIsVoting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [avgRating, setAvgRating] = React.useState<number>(0);

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    const q = query(collection(db, 'votes'), where('firmId', '==', firm.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVotes(snapshot.size);
      if (user) {
        const userVote = snapshot.docs.find(doc => doc.id === `${user.uid}_${firm.id}`);
        setHasVoted(!!userVote);
      }
    });

    return () => unsubscribe();
  }, [firm.id, user]);

  React.useEffect(() => {
    const reviewsQ = query(collectionGroup(db, 'reviews'), where('firmId', '==', firm.id));
    const unsubscribeReviews = onSnapshot(reviewsQ, (snapshot) => {
      const docs = snapshot.docs;
      if (docs.length > 0) {
        const total = docs.reduce((acc, d) => acc + (d.data().rating || 0), 0);
        setAvgRating(total / docs.length);
      } else {
        setAvgRating(0);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `reviews_group/${firm.id}`);
    });

    return () => unsubscribeReviews();
  }, [firm.id]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
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
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Voting failed:', error);
      alert('Encryption protocol failure: Vote could not be registered.');
    } finally {
      setIsVoting(false);
    }
  };

  const dynamicRating = getDynamicRating(avgRating, votes);
  const ratingColor = getRatingColor(dynamicRating);

  // Calculate a "Prop Score" out of 10.0
  const scoreFactor = (avgRating * 1.6) + (Math.min(votes / 10, 2));
  const displayScore = (avgRating === 0 && votes === 0) ? "0.0" : Math.min(scoreFactor, 10.0).toFixed(1);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative flex flex-col md:flex-row md:items-center bg-zinc-900 border-l-[6px] p-6 rounded-r-xl transition-all duration-300 hover:bg-zinc-800 ${ratingColor}`}
    >
      <div className="w-16 h-16 bg-zinc-950 rounded-xl flex items-center justify-center p-2 border border-zinc-800 mb-4 md:mb-0 md:mr-6 shrink-0 group-hover:border-emerald-500/50 transition-colors overflow-hidden">
        {firm.logoUrl ? (
          <img 
            src={firm.logoUrl} 
            alt={firm.name} 
            className="max-w-full max-h-full object-contain transition-all opacity-100 group-hover:scale-110" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firm.name)}&background=020617&color=10b981&bold=true&format=svg`;
            }}
          />
        ) : (
          <span className="text-2xl font-black text-zinc-800 uppercase italic">{firm.name[0]}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="text-2xl font-black uppercase tracking-tighter text-white">{firm.name}</div>
        <div className="text-[10px] font-bold uppercase mt-1 tracking-widest opacity-80">
          {getRatingLabel(dynamicRating)}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
           <div className="flex items-center gap-1.5">
             <Layers size={12} className="text-emerald-500/50" />
             <span className="opacity-60">Cap:</span> {firm.startingBalance}
           </div>
           <div className="flex items-center gap-1.5">
             <Percent size={12} className="text-emerald-500/50" />
             <span className="opacity-60">Split:</span> {firm.profitSplit}
           </div>
           <div className="flex items-center gap-1.5">
             <Zap size={12} className="text-emerald-500/50" />
             <span className="opacity-60">Lev:</span> {firm.maxLeverage}
           </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mr-6 py-4 md:py-0">
        <div className="text-center">
          <div className="text-2xl font-black tracking-tighter text-white">{displayScore}</div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Score</div>
        </div>
        
        <div className="h-10 w-[1px] bg-zinc-800 hidden md:block"></div>

        <button 
          onClick={handleVote}
          disabled={isVoting}
          className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${hasVoted ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          <ThumbsUp size={20} className={hasVoted ? 'fill-emerald-500/20' : ''} />
          <span className="text-[10px] font-black tracking-tighter">{votes}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {firm.discountCode && (
          <button 
            onClick={(e) => copyToClipboard(e, firm.discountCode!)}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all group/code"
            title="Copy Discount Code"
          >
            <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copied' : `Code: ${firm.discountCode}`}</span>
            {copied ? <Check size={12} /> : <Copy size={12} className="opacity-50 group-hover/code:opacity-100" />}
          </button>
        )}
        <a 
          href={firm.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-zinc-950 p-4 rounded-full border border-zinc-800 text-zinc-500 hover:text-emerald-500 hover:border-emerald-500 transition-all hover:scale-110"
          onClick={(e) => e.stopPropagation()}
          title="Visit Official Website"
        >
          <ExternalLink size={18} />
        </a>
        <Link 
          to={`/firms/${firm.slug}`}
          className="bg-zinc-950 p-4 rounded-full border border-zinc-800 text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all group-hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
}
