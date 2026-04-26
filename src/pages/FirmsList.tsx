import React from 'react';
import { INITIAL_FIRMS } from '../constants';
import FirmCard from '../components/ui/FirmCard';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function FirmsList() {
  const [search, setSearch] = React.useState('');

  const filteredFirms = INITIAL_FIRMS.filter(firm => {
    const matchesSearch = firm.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16">
      <div className="mb-20">
        <h1 className="text-6xl font-black text-white mb-6 tracking-tighter italic uppercase leading-none">Prop Firm<br />Directory.</h1>
        <p className="text-zinc-500 max-w-xl text-sm font-bold uppercase tracking-widest leading-relaxed">Real-time surveillance of authenticated prop firms. We evaluate execution quality and payout reliability with zero latency.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 mb-16">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
          <input 
            type="text" 
            placeholder="FILTER_BY_NAME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-5 pl-14 pr-6 text-white font-black text-xs tracking-widest focus:outline-none focus:border-emerald-500 transition-colors uppercase"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-4 max-w-5xl">
        {filteredFirms.length > 0 ? (
          filteredFirms.map((firm, i) => (
            <FirmCard key={firm.id} firm={firm} index={i} />
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest italic">NULL_RESULT: NO_MATCHES_FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}
