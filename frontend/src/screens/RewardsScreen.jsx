import React, { useState, useEffect } from 'react';

export default function RewardsScreen({ onNavigate, showToast, authHeaders }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/profile', { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        showToast('Telemetry rank offline', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [authHeaders]);

  const handleClaim = () => {
    if (claimed) {
      showToast('REWARD ALREADY SYNCED', 'error');
      return;
    }
    setClaimed(true);
    showToast('CLAIM SYNCED: +150 XP AWARDED', 'success');
    if (profile) {
      setProfile((prev) => ({
        ...prev,
        xp: prev.xp + 150,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-sm">
          <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
          <span className="font-label-caps text-xs text-primary/70 tracking-widest uppercase">LOADING PROTOCOLS</span>
        </div>
      </div>
    );
  }

  // Calculate XP percent
  const xpVal = profile?.xp || 2450;
  const xpMax = 5000;
  const xpPercent = Math.min(100, (xpVal / xpMax) * 100);

  return (
    <div className="scroll-area flex-grow w-full px-gutter pt-md space-y-md select-none bg-black pb-[96px]">
      <header className="flex justify-between items-center z-20 pb-sm">
        <div className="flex items-center gap-xs">
          <h1 className="font-display text-lg font-bold tracking-tighter text-white">
            FIT<span className="text-primary">GURU</span> REWARDS
          </h1>
        </div>
        <button 
          onClick={() => onNavigate('profile')}
          className="p-xs hover:bg-white/5 rounded-full text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">account_circle</span>
        </button>
      </header>

      {/* Profile XP Level Status Card */}
      <section className="glass-card rounded-xl p-sm border border-white/5 relative overflow-hidden">
        <div className="flex flex-col mb-sm relative z-10">
          <div className="flex items-center gap-xs">
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
            <p className="font-label-caps text-[8px] text-primary uppercase tracking-widest">Performance Index</p>
          </div>
          <h2 className="font-display text-sm font-extrabold text-white mt-1">
            LEVEL {profile?.level || 1} <span className="text-primary/70 font-normal ml-1">ELITE ATHLETE</span>
          </h2>
        </div>
        <div className="flex justify-between items-center font-mono text-[9px] text-on-surface-variant">
          <span>{xpVal.toLocaleString()} / {xpMax} XP</span>
          <div className="w-24 h-1 bg-white/15 rounded-full overflow-hidden mx-1 flex-grow">
            <div className="h-full bg-primary" style={{ width: `${xpPercent}%` }}></div>
          </div>
          <span className="shrink-0">{xpMax - xpVal} XP TO ASCENSION</span>
        </div>
      </section>

      {/* Path to mastery completion circle */}
      <section className="grid grid-cols-2 gap-sm">
        <div className="glass-card p-xs rounded-xl flex flex-col justify-center border border-white/5">
          <span className="font-label-caps text-[8px] text-on-surface-variant uppercase">Daily Streak</span>
          <div className="flex items-baseline gap-xs mt-1">
            <span className="font-display font-bold text-lg text-white">{profile?.streak || 0}</span>
            <span className="text-[8px] text-primary">DAYS</span>
          </div>
        </div>
        <div className="glass-card p-xs rounded-xl flex flex-col justify-center border border-white/5">
          <span className="font-label-caps text-[8px] text-on-surface-variant uppercase">Network Rank</span>
          <div className="flex items-baseline gap-xs mt-1">
            <span className="font-display font-bold text-lg text-primary">TOP 2%</span>
          </div>
        </div>
      </section>

      {/* Featured Reward card */}
      <section className="relative rounded-xl overflow-hidden glass-card border border-white/10 p-sm text-center">
        <div 
          className="absolute inset-0 z-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAH8xojimzmKYaP7-mIAw2beTTWTXDynhDavn-HgfFY8QP-mU4ANLpfsQkBjGHKFIPUxvjEaV_DA0cgnni2v4a8H-snQY8tdzZhz_FAwfG2GODltw4G8lMBvXcAJMXt-0__6k5eJ7upCIuZjTNtKxIKSemt89EycXVmbvtkUmTFx9PS8J2HUgtiX2OBP5mfRGl8saaOlwxcd0I6MEKLk1VdnAZVJjs0r-14WKnTj6i0nmTU9exqlooCSu21JsOjqZegtOdT4mPdow')] bg-cover bg-center opacity-10"
        />
        <div className="relative z-10 space-y-sm py-xs">
          <span className="font-label-caps text-[8px] text-primary tracking-widest uppercase font-bold">Reward Available</span>
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse"></div>
            <img 
              className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB73wkytjVVtsGJ-DIEnDPTvuKfpVIFM5n0E98JxYpyU7j-sPcR9tvUW9F717t6E-GSgS-NoP5s7PcI1YvQly6ghrpJY3pH2mXICXwx1xsThMzST-Aho01rwP_uUVOkPjNPYZK9jO_v0-9iAhTHQ09Ls97Avqwyv1egKIxRJoBGr7K0kk_eVWKrkuwKa1ki-7gBUiehBGZPNggLYKOt2ji1z45vm6Jv6U3vSgxcRaHJTEjyRj1CEiJineSaWTnjndwD7kVMaybTrw" 
              alt="trophy" 
            />
          </div>
          <h2 className="font-display font-bold text-xs text-white">CENTURION STREAK</h2>
          <p className="text-[9px] text-on-surface-variant max-w-[200px] mx-auto">Logged over 10 consecutive training sessions. Click below to claim bonus XP.</p>
          <button 
            onClick={handleClaim}
            className={`font-label-caps text-[9px] px-sm py-1.5 rounded-full font-bold uppercase tracking-widest transition-all ${
              claimed 
                ? 'bg-white/10 text-on-surface-variant border border-white/10 cursor-not-allowed' 
                : 'bg-primary text-black hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.3)]'
            }`}
          >
            {claimed ? 'Claimed' : 'Claim Reward'}
          </button>
        </div>
      </section>

      {/* Badge Archive Grid */}
      <section className="space-y-sm">
        <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">Badge collection</h3>

        {/* Diamond Tier */}
        <div className="space-y-xs">
          <div className="flex items-center gap-xs">
            <span className="font-label-caps text-[8px] text-primary uppercase font-bold">Diamond Tier</span>
            <div className="h-[1px] flex-grow bg-primary/20"></div>
          </div>
          <div className="grid grid-cols-4 gap-xs text-center">
            <div className="flex flex-col items-center gap-xs">
              <div className="w-12 h-12 bg-white/5 rounded-xl border border-primary/20 flex items-center justify-center relative p-1">
                <img 
                  className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB73wkytjVVtsGJ-DIEnDPTvuKfpVIFM5n0E98JxYpyU7j-sPcR9tvUW9F717t6E-GSgS-NoP5s7PcI1YvQly6ghrpJY3pH2mXICXwx1xsThMzST-Aho01rwP_uUVOkPjNPYZK9jO_v0-9iAhTHQ09Ls97Avqwyv1egKIxRJoBGr7K0kk_eVWKrkuwKa1ki-7gBUiehBGZPNggLYKOt2ji1z45vm6Jv6U3vSgxcRaHJTEjyRj1CEiJineSaWTnjndwD7kVMaybTrw" 
                  alt="Legend Badge" 
                />
              </div>
              <span className="font-label-caps text-[7px] text-white uppercase tracking-wider truncate w-14">Legend</span>
            </div>
            {['Titan', 'Zenith', 'Ascent'].map((name, idx) => (
              <div key={idx} className="flex flex-col items-center gap-xs opacity-35 grayscale">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/30 text-lg">lock</span>
                </div>
                <span className="font-label-caps text-[7px] text-on-surface-variant uppercase tracking-wider truncate w-14">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platinum Tier */}
        <div className="space-y-xs">
          <div className="flex items-center gap-xs">
            <span className="font-label-caps text-[8px] text-primary uppercase font-bold">Platinum Tier</span>
            <div className="h-[1px] flex-grow bg-primary/20"></div>
          </div>
          <div className="grid grid-cols-4 gap-xs text-center">
            {['Warrior', 'Unyielding'].map((name, idx) => (
              <div key={idx} className="flex flex-col items-center gap-xs">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-primary/10 flex items-center justify-center p-1">
                  <img 
                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(57,255,20,0.2)]" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLsvFF9P1wRLiL_50uUjYBSZeEoXlnOv0n-b4FnSXNlSwqR0uPHxIUTNgBSIWN3GnBNRc034w2GJz5UOQfcs7GYUlMmi31gNoDTV-qthKMBwryiCZb1JSv1Rid6p4haf4p7OgIMNg_ZFCgnShuYH8_otBdN82kk3nt1jKSS3AdGv6TwtqIQujyBY1hm6Yhx73HdOfG_qjTgYfshFsoNhgBTC37zwFZLfYz0IeSU_pVbvPr8e9hH2bg2IxQ" 
                    alt="platinum badge" 
                  />
                </div>
                <span className="font-label-caps text-[7px] text-white uppercase tracking-wider truncate w-14">{name}</span>
              </div>
            ))}
            {['Hyper', 'Overclock'].map((name, idx) => (
              <div key={idx} className="flex flex-col items-center gap-xs opacity-35 grayscale">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/30 text-lg">lock</span>
                </div>
                <span className="font-label-caps text-[7px] text-on-surface-variant uppercase tracking-wider truncate w-14">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
