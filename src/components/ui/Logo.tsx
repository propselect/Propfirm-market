import React from 'react';
import { ShieldCheck, TrendingUp } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 16, text: 'text-sm', sub: 'text-[6px]' },
    md: { icon: 24, text: 'text-xl', sub: 'text-[7px]' },
    lg: { icon: 40, text: 'text-4xl', sub: 'text-[10px]' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <div className={`
        relative bg-emerald-500 rounded-xl 
        flex items-center justify-center rotate-3 
        group-hover:rotate-0 transition-transform duration-500
        shadow-lg shadow-emerald-500/20
        ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-16 h-16'}
      `}>
        <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
        <TrendingUp className="text-black relative z-10" size={currentSize.icon} strokeWidth={3} />
        <ShieldCheck 
          className="absolute -top-1 -right-1 text-white bg-black rounded-full p-0.5 border border-emerald-500" 
          size={currentSize.icon / 2} 
        />
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-black italic uppercase tracking-tighter text-white ${currentSize.text}`}>
              PropCheck
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className={`font-black uppercase tracking-[0.3em] text-emerald-500/80 ${currentSize.sub}`}>
            Audit Terminal v4.0
          </span>
        </div>
      )}
    </div>
  );
}
