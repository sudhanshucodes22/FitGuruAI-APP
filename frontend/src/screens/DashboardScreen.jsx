import React, { useState, useEffect, useRef } from 'react';

export default function DashboardScreen({ onNavigate, showToast, authHeaders, onLogout, weightUnit, onToggleWeightUnit }) {
  const [profile, setProfile] = useState(null);
  const [habits, setHabits] = useState(null);
  const [briefing, setBriefing] = useState('Initializing quantum performance briefing...');
  const [loading, setLoading] = useState(true);
  
  // Search & Settings states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetReps, setTargetReps] = useState(10);

  const settingsModalRef = useRef(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1. Fetch Profile
        const profileRes = await fetch('/api/auth/profile', { headers: authHeaders });
        if (!profileRes.ok) throw new Error('Unauthorized');
        const profileData = await profileRes.json();
        setProfile(profileData);
        setTargetReps(profileData.targetReps || 10);

        // 2. Fetch today's habits
        const habitsRes = await fetch('/api/habits/today', { headers: authHeaders });
        const habitsData = habitsRes.ok ? await habitsRes.json() : {};
        setHabits(habitsData);

        // 3. Fetch Coach Briefing
        const briefingRes = await fetch('/api/coach/briefing', { headers: authHeaders });
        const briefingData = briefingRes.ok ? await briefingRes.json() : {};
        setBriefing(briefingData.briefing || 'Welcome back, Athlete. Prepare for training.');
      } catch (err) {
        console.error('Dashboard load failed:', err);
        showToast('Session expired. Re-authenticating.', 'error');
        onLogout();
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [authHeaders, onLogout, showToast]);

  // Save target daily reps from settings
  const handleSaveReps = async () => {
    const val = Number(targetReps);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid target reps number', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetReps: val })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        showToast('DAILY TARGET UPDATED');
      } else {
        showToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
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

  const readinessScore = habits?.readinessScore || 50;
  const calProgress = habits?.calorieProgress || 0;
  const calPercent = Math.min(100, (calProgress / 2400) * 100);

  const waterMl = habits?.waterMl || 0;
  const waterL = (waterMl / 1000).toFixed(1);
  const waterPercent = Math.min(100, (waterMl / 3500) * 100);

  const steps = habits?.steps || 0;
  const stepsPercent = Math.min(100, (steps / 10000) * 100);

  // Helper to filter items based on search query
  const matchesSearch = (textArray) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return textArray.some(text => String(text).toLowerCase().includes(query));
  };

  const showHero = matchesSearch(['daily performance', 'good day', profile?.username, 'peak performance', 'athlete']);
  const showReadiness = matchesSearch(['readiness', 'system diagnostics', 'readiness score', 'peak physical sync']);
  const showInsights = matchesSearch(['protein target', 'anabolic cap', 'protein', 'momentum status', 'streak boost', 'consistency']);
  const showDinner = matchesSearch(['log your dinner', 'ai scanner ready', 'dinner', 'meal scan']);
  const showStats = matchesSearch(['calories', 'cal', 'hydration', 'water', 'ml', 'steps', 'footprint', 'streak', 'active days']);
  const showBriefing = matchesSearch(['ai coach briefing', 'briefing', briefing]);

  const isLbsActive = weightUnit === 'LBS';

  return (
    <div className="relative flex-grow flex flex-col h-full bg-[#050505] text-[#e2e2e2] select-none">
      {/* Top Header */}
      <header className="w-full flex-shrink-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-gutter py-sm relative" style={{ height: '56px' }}>
        <div className={`flex justify-between items-center w-full transition-all duration-300 ${searchOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center gap-xs">
            <div 
              onClick={() => onNavigate('profile')}
              className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 cursor-pointer active:scale-95 transition-transform"
            >
              <img 
                className="w-full h-full object-cover" 
                src={profile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdjqIqXnxjCrYrNz7P8akBINlTPV2xHFBejV9w5gf526H5BxCiJFmxjo8bhFiCj9YCSPNik3zNX95DVaPMGm1RpEB-6KCKgQerwBfccGTA7fL4YbAzd4hApqgnNnr8VYA5izalJbOCVv6SY1vqpnBllDEf0BcrsEl4R54XAZYEFONc6mxStTAZEmGVkNtFXku7KDetkmytfnIHXUKFq4zxC31G0QTLSm14zzwEYtyp2eIYJvT2b8ocXahy9OnhysuO2OzfWdWL-g'} 
                alt="avatar" 
              />
            </div>
            <h1 className="font-display font-bold text-sm tracking-tighter text-primary">FITGURU</h1>
          </div>
          <div className="flex items-center gap-sm">
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-xs hover:bg-white/5 rounded-full transition-all duration-300"
            >
              <span className="material-symbols-outlined text-primary text-xl">search</span>
            </button>
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-xs hover:bg-white/5 rounded-full transition-all duration-300"
            >
              <span className="material-symbols-outlined text-primary text-xl">settings</span>
            </button>
          </div>
        </div>

        {/* Slide-out Search Bar */}
        <div className={`absolute inset-x-gutter top-1/2 -translate-y-1/2 flex items-center bg-black border border-white/10 rounded-full px-sm py-1 gap-xs z-30 transition-all duration-300 w-[90%] mx-auto ${
          searchOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
        }`}>
          <span className="material-symbols-outlined text-on-surface-variant text-md">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-xs text-on-surface w-full p-0 placeholder:text-on-surface-variant/50 focus:outline-none" 
            placeholder="Search Dashboard..."
          />
          <button 
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }} 
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
          </button>
        </div>
      </header>

      {/* Content area */}
      <main className="scroll-area flex-grow w-full px-gutter pt-md space-y-md pb-[96px]">
        {/* Hero card */}
        {showHero && (
          <section className="relative rounded-xl overflow-hidden min-h-[140px] flex items-end p-sm border border-white/5">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10"></div>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcOA1UsQGDC8_JJLfVDaSa4jnp0j7e_Nx1Txqx1AFBh_9X38jOFNqUDAO7MdMhABnKLwB-aVNwJXFczFX5F7zWpMMl9WcV0JW7rF_9m4YBi9K3f1f6YH6hqVGQ1XteDcz3ugPi-BP1HVO7_U2bI1FCE1btHGfa0A6IpANOtd5QoPQI0A0J_2zFDH3vcb18PFqrSxEWigrFrK7p8M_-0Y24KWru3HPfoRTV_86NhPKKiQgKtGPsZ_EHTF_iGo7CbTk9VSSO2jwpYw" 
                alt="gym background" 
              />
            </div>
            <div className="relative z-20 space-y-0.5">
              <span className="font-label-caps text-[7px] text-primary tracking-widest uppercase block">Daily Performance</span>
              <h2 className="font-display text-xs font-bold text-white">Good Day, {profile?.username || 'Athlete'} 💪</h2>
              <p className="text-[9px] text-on-surface-variant max-w-[260px] leading-relaxed">
                Your peak performance window is active. AI suggests a high-intensity session based on your recovery score.
              </p>
            </div>
          </section>
        )}

        {/* Readiness Circular Progress */}
        {showReadiness && (
          <div className="glass-card rounded-xl p-md flex flex-col items-center justify-center space-y-xs text-center border border-white/10">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" fill="transparent" r="62" stroke="#1A1A1A" strokeWidth="6"></circle>
                <circle 
                  className="transition-all duration-1000 ease-out" 
                  cx="72" 
                  cy="72" 
                  fill="transparent" 
                  r="62" 
                  stroke="#39FF14" 
                  strokeWidth="6"
                  strokeDasharray="390"
                  strokeDashoffset={390 - (390 * readinessScore) / 100}
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-2xl font-extrabold text-white text-glow leading-none">{readinessScore}</span>
                <span className="font-label-caps text-[7px] text-primary uppercase tracking-wider mt-1">READINESS</span>
              </div>
            </div>
            <div>
              <h3 className="font-display font-semibold text-xs text-white">System Diagnostics</h3>
              <p className="text-on-surface-variant text-[9px] mt-0.5">You are in peak physical sync today.</p>
            </div>
          </div>
        )}

        {/* AI Insight Cards */}
        {showInsights && (
          <div className="grid grid-cols-2 gap-sm">
            <div className="glass-card p-xs rounded-xl flex flex-col justify-between border-l-2 border-error/50 min-h-[80px]">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-error text-xs">restaurant</span>
                <span className="font-mono text-[7px] text-error">Anabolic Cap</span>
              </div>
              <div className="mt-xs">
                <p className="text-[9px] font-bold text-white leading-tight">Protein Target</p>
                <p className="text-on-surface-variant text-[7px] mt-0.5 leading-tight">Keep meal intake high to retain muscle density.</p>
              </div>
            </div>

            <div className="glass-card p-xs rounded-xl flex flex-col justify-between border-l-2 border-primary/50 min-h-[80px]">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary text-xs">trending_up</span>
                <span className="font-mono text-[7px] text-primary">Streak Boost</span>
              </div>
              <div className="mt-xs">
                <p className="text-[9px] font-bold text-white leading-tight">Momentum Status</p>
                <p className="text-on-surface-variant text-[7px] mt-0.5 leading-tight">Consistency remains stable. Keep the daily streak alive.</p>
              </div>
            </div>
          </div>
        )}

        {/* Meal Logging Quick Action */}
        {showDinner && (
          <div 
            onClick={() => onNavigate('scanner')}
            className="glass-card p-xs rounded-xl flex items-center gap-sm group cursor-pointer hover:bg-white/5 border border-white/10"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4B7zkUBaQMdnoZpvhi7MHA-tytBGUkUtUpCUqJ4Vuc7rOkvoD34O9B9UE9sjd0Obg0k1yZk_hAUYySRhDIV9TRamJyET3E8T8M9NV5swuFTEyjiVWXfiZxBuJ-YXKKuzJmHm_CGJwjq14PYrP9gMZQUHmman3yy90I_C-P-JkJAerMfxeSptiSlPPw_EmNEUWvM0Ka1p9ggxNgWCcqFSd0LJwpZoovZM9djnqnxQWAPhKq_O9LteS7ErXypWUgpznVUoPrKtaAA" 
                alt="meal scan preview" 
              />
            </div>
            <div className="flex-grow">
              <span className="font-label-caps text-[7px] text-primary mb-0.5 block">AI SCANNER READY</span>
              <h4 className="font-display font-semibold text-xs text-white group-hover:text-primary transition-colors">Log your dinner</h4>
              <p className="text-on-surface-variant text-[8px] mt-0.5">Capture a photo to log macros instantly.</p>
            </div>
            <span className="material-symbols-outlined text-primary text-md">chevron_right</span>
          </div>
        )}

        {/* Stats Cards Grid */}
        {showStats && (
          <section className="grid grid-cols-2 gap-sm">
            <div className="glass-card p-xs rounded-xl space-y-0.5 border border-white/5">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                <span className="font-label-caps text-[8px]">CALORIES</span>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="font-display font-bold text-white text-xs">{calProgress}</span>
                <span className="text-[8px] text-on-surface-variant">/ 2,400</span>
              </div>
              <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${calPercent}%` }}></div>
              </div>
            </div>

            <div className="glass-card p-xs rounded-xl space-y-0.5 border border-white/5">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[10px]">local_drink</span>
                <span className="font-label-caps text-[8px]">HYDRATION</span>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="font-display font-bold text-white text-xs">{waterL}L</span>
                <span className="text-[8px] text-on-surface-variant">/ 3.5L</span>
              </div>
              <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${waterPercent}%` }}></div>
              </div>
            </div>

            <div className="glass-card p-xs rounded-xl space-y-0.5 border border-white/5">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[10px]">footprint</span>
                <span className="font-label-caps text-[8px]">STEPS</span>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="font-display font-bold text-white text-xs">{steps.toLocaleString()}</span>
                <span className="text-[8px] text-on-surface-variant">/ 10k</span>
              </div>
              <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${stepsPercent}%` }}></div>
              </div>
            </div>

            <div className="glass-card p-xs rounded-xl space-y-0.5 border border-white/5">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
                <span className="font-label-caps text-[8px]">STREAK</span>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="font-display font-bold text-white text-xs">{profile?.streak || 0}</span>
                <span className="text-[8px] text-on-surface-variant">Days Active</span>
              </div>
              <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </section>
        )}

        {/* AI Briefing Card */}
        {showBriefing && (
          <section className="glass-card p-xs rounded-xl border border-primary/20 space-y-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-xs">psychology</span>
                <h3 className="font-display font-semibold text-xs text-white">AI Coach Briefing</h3>
              </div>
              <span className="font-mono text-[7px] text-primary">SECURE PROTOCOL</span>
            </div>
            <p className="text-[9px] text-on-surface-variant leading-relaxed">{briefing}</p>
            <button 
              onClick={() => onNavigate('coach')}
              className="w-full py-1.5 bg-primary text-black font-semibold text-xs rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-xs"
            >
              <span>Open Coach Terminal</span>
              <span className="material-symbols-outlined text-xs">terminal</span>
            </button>
          </section>
        )}
      </main>

      {/* Settings Modal Overlay */}
      <div className={`absolute inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-gutter transition-all duration-300 ${
        settingsOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div 
          ref={settingsModalRef}
          className="glass-card w-full max-w-xs rounded-2xl border border-white/10 p-sm space-y-md relative overflow-hidden shadow-2xl"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-xs">
            <h3 className="font-label-caps text-[9px] text-primary tracking-widest">SETTINGS PROTOCOL</h3>
            <button 
              onClick={() => setSettingsOpen(false)} 
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-md">close</span>
            </button>
          </div>
          
          {/* Target Daily Reps Input */}
          <div className="space-y-xs">
            <label className="font-label-caps text-[8px] text-on-surface-variant uppercase tracking-wider block">Target Daily Reps</label>
            <div className="flex gap-xs">
              <input 
                type="number" 
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                className="bg-black border border-white/10 focus:border-primary/50 focus:ring-0 rounded-lg text-xs text-on-surface w-full px-sm py-1 focus:outline-none" 
                min="1"
              />
              <button 
                onClick={handleSaveReps} 
                className="bg-primary px-sm py-1 rounded-lg text-on-primary font-label-caps text-[8px] active:scale-95 transition-transform"
              >
                SAVE
              </button>
            </div>
          </div>
          
          {/* Weight Unit Selection */}
          <div className="space-y-xs">
            <label className="font-label-caps text-[8px] text-on-surface-variant uppercase tracking-wider block">Metric Units</label>
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg p-xs">
              <span className="text-[10px] text-on-surface">Use Pounds (LBS)</span>
              <button 
                onClick={onToggleWeightUnit}
                className={`w-10 h-5 bg-white/10 rounded-full p-[2px] transition-colors relative flex items-center ${isLbsActive ? 'lbs-active bg-primary/20 border border-primary/40' : ''}`}
              >
                <span 
                  className={`w-4 h-4 bg-on-surface-variant rounded-full transition-transform shadow ${
                    isLbsActive ? 'translate-x-5 bg-primary' : ''
                  }`} 
                ></span>
              </button>
            </div>
          </div>
          
          {/* Log Out */}
          <div className="border-t border-white/5 pt-sm">
            <button 
              onClick={() => {
                setSettingsOpen(false);
                onLogout();
              }} 
              className="w-full py-2 bg-error/10 hover:bg-error/20 border border-error/30 text-error font-label-caps text-[9px] rounded-xl active:scale-95 transition-all text-center uppercase tracking-wider font-semibold"
            >
              LOG OUT SYSTEM
            </button>
          </div>
        </div>
      </div>

      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[100px]"></div>
        <div className="scanline absolute inset-0 opacity-[0.03]"></div>
      </div>
    </div>
  );
}
