import React, { useState, useEffect } from 'react';

export default function WelcomeScreen({ onNavigate }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;
    setCoords({ x, y });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-gutter">
      {/* Background with Parallax */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-100 ease-out"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAY0sXe4Axuya8Z5TCkSkkj23k-MhM_ZWmAZKuuQLqn1YTctVN9LQMnX_kywzMIF2s65tRQOd-2Nd99HNr-Rp8pam9i2xPsYf5MgTcUIsC2u0PjGittHd86Ws6tCD-i0Ve-Lom1RCB8LzwpNn4q6crs_T5_OVi0A92unPPOnk9GcEJehgRZwL_9j6yQT4R6rdwFqVDtjN5vYj2NMv7JSoiCKj_dkw1esvmLGqFveQNWUWZBuwUVU9GIt6e3HKm4EbSe9rXdFCxfFA')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(1.15) translate(${coords.x}px, ${coords.y}px)`,
          opacity: 0.6
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 z-10" />

      {/* Header */}
      <header className="relative z-20 flex justify-between items-start pt-sm">
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-extrabold tracking-tighter text-primary leading-none text-glow">FITGURU</h1>
          <div className="h-[1px] w-8 bg-primary/40 mt-1"></div>
        </div>
        <div className="glass-card px-xs py-0.5 rounded-lg flex items-center gap-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-caps text-[9px] tracking-widest text-primary uppercase">SYSTEM ACTIVE</span>
        </div>
      </header>

      {/* Center content */}
      <div className="relative z-20 flex flex-col justify-end flex-grow pb-gutter space-y-md">
        <div>
          <span className="font-label-caps text-[9px] text-on-surface-variant tracking-[0.25em] uppercase block">
            Performance Protocol Alpha
          </span>
        </div>
        <h2 className="font-display text-4xl font-extrabold italic uppercase leading-[0.95] text-white">
          EVOLVE<br />
          <span className="text-primary text-glow">BEYOND</span><br />
          LIMITS
        </h2>
        <p className="text-xs text-on-surface-variant leading-relaxed max-w-[280px]">
          The world's most advanced AI fitness companion for <span className="text-white font-semibold">elite performance</span>. Personalized intelligence for those who refuse to settle.
        </p>
        
        <div className="flex gap-md items-center pt-xs">
          <div className="flex flex-col">
            <span className="font-mono text-primary text-[16px] font-bold">100%</span>
            <span className="font-label-caps text-[8px] text-on-surface-variant uppercase">Biometric Integration</span>
          </div>
          <div className="w-[1px] h-6 bg-white/15"></div>
          <div className="flex flex-col">
            <span className="font-mono text-primary text-[16px] font-bold">AI-Driven</span>
            <span className="font-label-caps text-[8px] text-on-surface-variant uppercase">Real-time Coaching</span>
          </div>
        </div>
      </div>

      {/* Footer / Call to action */}
      <footer className="relative z-20 flex flex-col items-center gap-sm pb-md">
        <button 
          onClick={() => onNavigate('auth')}
          className="group relative overflow-hidden bg-primary-container border border-primary/20 text-primary py-sm font-semibold transition-all duration-300 active:scale-95 neon-glow flex items-center justify-center gap-xs w-full rounded-xl bg-primary/10 hover:bg-primary/20"
        >
          <span className="relative z-10 uppercase tracking-wider text-xs">Get Started</span>
          <span className="material-symbols-outlined relative z-10 text-sm transition-transform group-hover:translate-x-0.5">
            arrow_forward
          </span>
        </button>
        <div 
          onClick={() => onNavigate('auth')}
          className="flex items-center gap-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer pt-xs"
        >
          <span className="font-label-caps text-[9px] tracking-widest uppercase">Discover Elite Ecosystem</span>
          <span className="material-symbols-outlined text-[12px]">expand_more</span>
        </div>
      </footer>
    </div>
  );
}
