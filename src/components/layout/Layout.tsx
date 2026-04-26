import React from 'react';
import Navbar from "./Navbar";
import Newsletter from "../Newsletter";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />
      <main className="pt-16 pb-20">
        {children}
      </main>
      
      <footer className="border-t border-slate-900 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <Newsletter />
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-900/50 pt-12">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-white tracking-tight uppercase">Prop<span className="text-emerald-500 italic">EDGE.COM</span></span>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-xs">Connecting elite traders with high-performance capital tools and verified analytics.</p>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Risk Disclosure</a>
          </div>
          <div className="text-slate-600 text-xs">
            © 2026 PropEdge Analytics. All rights reserved. Registered for financial review services.
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}
