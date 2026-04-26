import React from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { PropFirm } from '../types';
import { INITIAL_FIRMS } from '../constants';
import FirmCard from '../components/ui/FirmCard';
import { TrendingUp, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';

export default function Home() {
  const [firms, setFirms] = React.useState<PropFirm[]>(INITIAL_FIRMS);

  // In a real app, we'd fetch from Firestore
  // useEffect(() => {
  //   const q = query(collection(db, 'firms'), orderBy('createdAt', 'desc'), limit(6));
  //   return onSnapshot(q, (snapshot) => {
  //     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropFirm));
  //     if (data.length > 0) setFirms(data);
  //   });
  // }, []);

  const features = [
    { icon: <ShieldCheck className="text-emerald-500" />, title: "Verified Payouts", desc: "Every firm on our list has a strictly verified payout history." },
    { icon: <Zap className="text-emerald-500" />, title: "Real-time Spreads", desc: "Live comparison of execution spreads across different platforms." },
    { icon: <BarChart3 className="text-emerald-500" />, title: "Trader Analytics", desc: "Advanced tools to track your edge across multiple prop accounts." },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar Section */}
      <div className="w-full lg:w-[450px] border-r border-zinc-800 p-10 flex flex-col justify-between bg-zinc-950">
        <div>
          <Logo className="mb-10" />
          <motion.h1 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl font-black leading-[0.85] uppercase mb-6 tracking-tighter italic text-white"
          >
            TRADE CAPITAL.<br />
            <span className="text-emerald-500">JOIN THE<br />NETWORK.</span>
          </motion.h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium max-w-sm">
            Instant tracking of liquidity, payout reliability, and trader feedback in real-time. No more dark pools.
          </p>

          <div className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <h2 className="text-xl font-black text-white italic mb-2 tracking-tighter">Market Entry</h2>
            <Link to="/signup" className="block w-full bg-white text-black font-black uppercase py-4 rounded-xl hover:bg-emerald-400 transition-colors tracking-tight text-center">
              Initialize Account
            </Link>
            <div className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">
              Verification Required For Full Analytics access.
            </div>
          </div>
        </div>

        <div className="mt-12 text-[10px] text-zinc-700 font-mono font-bold uppercase tracking-widest flex flex-col gap-1">
          <div>ORG: PropEDGE.COM // SYS_STATUS: ACTIVE</div>
          <div>FEED: 12ms // LIVE_ALERTS: 14</div>
          <div>VERIFIED_USERS: 124,092</div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="flex-1 p-10 bg-zinc-950 overflow-y-auto">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Current Market Rankings</h2>
          <div className="flex gap-6">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-[10px] font-bold uppercase tracking-widest">Good</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-[10px] font-bold uppercase tracking-widest">Fair</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span><span className="text-[10px] font-bold uppercase tracking-widest">Bad</span></div>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          {firms.map((firm, i) => (
            <FirmCard key={firm.id} firm={firm} index={i} />
          ))}
        </div>

        <div className="mt-12 pt-12 border-t border-zinc-800 flex justify-between items-center bg-zinc-950">
           <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-zinc-300 italic uppercase tracking-tighter">Verified Audit Data</span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Last Sync: 2 minutes ago</span>
           </div>
           <Link to="/firms" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 border-b border-emerald-500/30 pb-1">Explore Full Database →</Link>
        </div>
      </div>
    </div>
  );
}
