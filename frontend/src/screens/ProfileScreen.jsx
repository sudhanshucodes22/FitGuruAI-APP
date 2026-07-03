import React, { useState, useEffect, useRef } from 'react';

export default function ProfileScreen({ onNavigate, showToast, authHeaders, onLogout, weightUnit, onToggleWeightUnit }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetReps, setTargetReps] = useState(10);
  
  const isLbsActive = weightUnit === 'LBS';
  const [tiltStyle, setTiltStyle] = useState({});
  const [forging, setForging] = useState(false);

  // Refs for modal dismiss
  const settingsModalRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/profile', { headers: authHeaders });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setProfile(data);
        setTargetReps(data.targetReps || 10);
      } catch (err) {
        console.error('Profile load failed:', err);
        showToast('Session expired. Re-authenticating.', 'error');
        onLogout();
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [authHeaders, onLogout, showToast]);

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

  // Handle 3D Avatar Tilt
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)'
    });
  };

  // Update PR helper
  const handleUpdatePR = async (field, label) => {
    const currentVal = profile ? (profile[field] || '') : '';
    const newVal = prompt(`Enter new Personal Record for ${label}:`, currentVal);
    if (newVal === null) return;
    
    const trimmed = newVal.trim();
    if (!trimmed) return;

    if (field !== 'prMile') {
      if (isNaN(trimmed) || Number(trimmed) <= 0) {
        showToast('Please enter a valid positive number', 'error');
        return;
      }
    }

    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [field]: field === 'prMile' ? trimmed : Number(trimmed)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        showToast('PR DATABASE UPDATED');
      } else {
        showToast(data.error || 'PR update failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  // Avatar Selection Sync
  const handleSelectAvatar = async (url) => {
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatar: url })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        showToast('AVATAR SYNCED SUCCESSFULLY');
      }
    } catch (err) {
      showToast('Avatar update failed', 'error');
    }
  };

  // Forge avatar simulation
  const handleForgeAvatar = async () => {
    setForging(true);
    const generatedAvatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7NheTY4Pu9lD4sT2jljOnPrFuRSiNGIufnN6BIxwn9aXTAQFkgHUwxlcWI2C2izErMCAV3NN0joHbGu3r9AakyX9wIWEIK2yBeG3wZT4WioVx36HawhwlH72spUO5jIKvleqg3GIPN2Vfljv3EyTrnGGiyUNSDRCTTYY0RrAIIGx4r54HHC4_LGbMsZhwx4_t-L2WnbzY8O1BterfN0SA5HSqfnAuD7q-pppzcqCq8uwnCYMtpVbWgCE4gxEi8OvtjQ8J5eZ1vw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBje8Fo8eTJkMAYumqWw1gLD9y70cezcwpR5s6KAHn6uJt3EyDoF4jU1TNwqYYMtqZRNoLeP4A2oDL1XTddop_rH5-TY4uy39Ohpo0pR9IUY-qyJ9RIw6uhzezmaMifHk2VHFD54WhTKSByiJclgOOlg2M7m9CNvqTaJewtXwXJ_9u86Jd8XYDRYywzwp6MTD-aD4aHRYJH-RjD2VRyRWHImwleYt2YnO14ZI_gGrQmpXKWTzEikXE_bWpnnU95Hle4JlBAf7J6Fg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXDd__ZcgWUrUrpWNIn5n-d6INhvpetE4B-CNtjDvo4SIOtstpUTQhOD0fq2sjvE67AvxR6aknST2IV45GieH_96gSICGCcQUreUOtxB7H4J9M1YgebK1p-6XVA1TkgXq4Q8vq-GKDYXTzQf00VTf2c_djnbi7Ige-eEYsZYnVp9yFd0rruiQe5Ab4WT1VYfoW1sOOqvgxS9psNMXntmevd43dm1evGLRICVGC24qfCxrVvn23bCr1CwdX3kqPO-1mdJZ5gfDoJg'
    ];
    const randomAvatar = generatedAvatars[Math.floor(Math.random() * generatedAvatars.length)];

    setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/profile/update', {
          method: 'POST',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ avatar: randomAvatar })
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data.user);
          showToast('NEW ATHLETE SYNTHESIZED!');
        }
      } catch (err) {
        showToast('Synthesis upload failed', 'error');
      } finally {
        setForging(false);
      }
    }, 2000);
  };

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

  // Calculate PR values based on LBS toggle
  const squat = Number(profile?.prSquat || 185);
  const bench = Number(profile?.prBench || 125);
  const deadlift = Number(profile?.prDeadlift || 220);
  const overhead = Number(profile?.prOverhead || 85);
  const mile = profile?.prMile || '5:42';

  const multiplier = isLbsActive ? 2.20462 : 1;
  const unitLabel = isLbsActive ? 'LBS' : 'KG';

  const squatVal = Math.round(squat * multiplier);
  const benchVal = Math.round(bench * multiplier);
  const deadliftVal = Math.round(deadlift * multiplier);
  const overheadVal = Math.round(overhead * multiplier);
  const prTotalVal = Math.round((squat + bench + deadlift + overhead) * multiplier);

  // Avatar presets for Selection Forge Grid
  const avatarPresets = [
    {
      id: 'warrior',
      label: 'WARRIOR',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7NheTY4Pu9lD4sT2jljOnPrFuRSiNGIufnN6BIxwn9aXTAQFkgHUwxlcWI2C2izErMCAV3NN0joHbGu3r9AakyX9wIWEIK2yBeG3wZT4WioVx36HawhwlH72spUO5jIKvleqg3GIPN2Vfljv3EyTrnGGiyUNSDRCTTYY0RrAIIGx4r54HHC4_LGbMsZhwx4_t-L2WnbzY8O1BterfN0SA5HSqfnAuD7q-pppzcqCq8uwnCYMtpVbWgCE4gxEi8OvtjQ8J5eZ1vw'
    },
    {
      id: 'active',
      label: 'CYBER',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUNBV-dQS-REdRAB23eBJcDl6V5-y2pdbh1C6IYI9DHI6yIN_6MjqkgtPaALTwjbKtbQ2TlyoIiFvfv1Zl3Ft33MneKWuedfmgq07GW9XVtbBCZyC8QEaMNCLvMh0wzoSNePNuZZRDuvvgBnkKeQ0PbbXiR3Adw3aA_qMnkz46P9MXWUNagIs5smYW2x1dDaJ9vzbWc5avLYBOmXzGmiuqe6zRShmEEmyLUgEyOunSni5WrPpFMdpn8PCQ6qfTLY6oq6cb7Secrw'
    },
    {
      id: 'nebula',
      label: 'NEBULA',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBje8Fo8eTJkMAYumqWw1gLD9y70cezcwpR5s6KAHn6uJt3EyDoF4jU1TNwqYYMtqZRNoLeP4A2oDL1XTddop_rH5-TY4uy39Ohpo0pR9IUY-qyJ9RIw6uhzezmaMifHk2VHFD54WhTKSByiJclgOOlg2M7m9CNvqTaJewtXwXJ_9u86Jd8XYDRYywzwp6MTD-aD4aHRYJH-RjD2VRyRWHImwleYt2YnO14ZI_gGrQmpXKWTzEikXE_bWpnnU95Hle4JlBAf7J6Fg'
    },
    {
      id: 'mecha',
      label: 'MECHA',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXDd__ZcgWUrUrpWNIn5n-d6INhvpetE4B-CNtjDvo4SIOtstpUTQhOD0fq2sjvE67AvxR6aknST2IV45GieH_96gSICGCcQUreUOtxB7H4J9M1YgebK1p-6XVA1TkgXq4Q8vq-GKDYXTzQf00VTf2c_djnbi7Ige-eEYsZYnVp9yFd0rruiQe5Ab4WT1VYfoW1sOOqvgxS9psNMXntmevd43dm1evGLRICVGC24qfCxrVvn23bCr1CwdX3kqPO-1mdJZ5gfDoJg'
    }
  ];

  // Filter PR cards
  const prCards = [
    { id: 'prSquat', label: 'Back Squat', value: squatVal, unit: unitLabel, sub: 'MAJOR LIFT', displayLabel: 'Back Squat' },
    { id: 'prBench', label: 'Bench Press', value: benchVal, unit: unitLabel, sub: 'BENCH PRESS', displayLabel: 'Bench Press' },
    { id: 'prDeadlift', label: 'Deadlift', value: deadliftVal, unit: unitLabel, sub: 'DEADLIFT', displayLabel: 'Deadlift' },
    { id: 'prOverhead', label: 'Overhead', value: overheadVal, unit: unitLabel, sub: 'OVERHEAD', displayLabel: 'Overhead Press' },
    { id: 'prMile', label: 'Mile Run', value: mile, unit: 'MIN', sub: 'MILE RUN', displayLabel: 'Mile Run' }
  ];

  const filteredPRs = prCards.filter(card => 
    card.displayLabel.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="relative flex-grow flex flex-col h-full bg-[#050505] text-[#e2e2e2] select-none">
      {/* Top AppBar */}
      <header className="w-full flex-shrink-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-gutter py-sm relative" style={{ height: '56px' }}>
        <div className={`flex justify-between items-center w-full transition-all duration-300 ${searchOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="p-xs hover:bg-white/5 rounded-full transition-all duration-300 ease-out active:scale-95 text-on-surface-variant hover:text-primary mr-1 flex-shrink-0" 
            title="Go Back"
          >
            <span className="material-symbols-outlined text-xl leading-none">arrow_back</span>
          </button>
          
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-primary/20">
              <img 
                className="w-full h-full object-cover" 
                src={profile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdjqIqXnxjCrYrNz7P8akBINlTPV2xHFBejV9w5gf526H5BxCiJFmxjo8bhFiCj9YCSPNik3zNX95DVaPMGm1RpEB-6KCKgQerwBfccGTA7fL4YbAzd4hApqgnNnr8VYA5izalJbOCVv6SY1vqpnBllDEf0BcrsEl4R54XAZYEFONc6mxStTAZEmGVkNtFXku7KDetkmytfnIHXUKFq4zxC31G0QTLSm14zzwEYtyp2eIYJvT2b8ocXahy9OnhysuO2OzfWdWL-g'} 
                alt="avatar mini"
              />
            </div>
            <span className="font-display font-bold text-sm tracking-tighter text-primary">FITGURU</span>
          </div>

          <div className="flex items-center gap-sm">
            <button onClick={() => setSearchOpen(true)} className="p-xs hover:bg-white/5 rounded-full transition-all duration-300">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary text-xl">search</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="p-xs hover:bg-white/5 rounded-full transition-all duration-300">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary text-xl">settings</span>
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
            placeholder="Search Personal Records..."
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

      {/* Main Content Area */}
      <main className="scroll-area flex-grow w-full px-gutter space-y-md pb-[96px]">
        
        {/* Profile Header */}
        <section className="flex flex-col gap-sm pt-md">
          <div className="relative w-full group flex justify-center">
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="avatar-3d-card w-[200px] aspect-[4/5] rounded-xl overflow-hidden glass-card elite-border relative p-base cursor-pointer shadow-xl shadow-black/50"
            >
              <div className="avatar-inner h-full w-full relative" style={tiltStyle}>
                <img 
                  id="main-avatar-img" 
                  className="w-full h-full object-cover rounded-lg" 
                  src={profile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyDC4vg_D6NLuiAfkYEWWMDgUu1wnbgd5adylEHYuRpRzWtDD6fILpIoJuGG_Uaaw-AGCrBPs-evXlbf1KzeK6qc3DWDaiDjxtimh1tMDkGNaBqFW2uIIm-BK-MbIh2cyDi4ORPe34vgymYZmGRRCUtcolID2xW82s5eI9hPKuXhtmGznKpZBh8E47MpZq44GVd6d5GqB_qnJPwI-dDOzI_f6tmSJO28TwiQSaZexzZvmI4AuwGcbFU0YYPdFTO-kmt3AlttUV5Q'} 
                  alt="Avatar"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-xs left-xs">
                  <div className="bg-primary/10 backdrop-blur-md border border-primary/30 px-xs py-0.5 rounded-full inline-flex items-center gap-[2px]">
                    <span className="material-symbols-outlined text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <span className="font-label-caps text-[8px] text-primary">ELITE STATUS</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* XP Badge */}
            <div className="absolute bottom-0 translate-y-1/3 right-[20%] w-12 h-12 bg-black border border-primary/40 rounded-full flex flex-col items-center justify-center neon-glow shadow-primary/20 z-10">
              <span className="font-label-caps text-[8px] text-on-surface-variant leading-none">LVL</span>
              <span className="font-display text-sm font-bold text-primary leading-none mt-[2px]">{profile?.level || 42}</span>
            </div>
          </div>

          <div className="text-center pt-xs">
            <h2 className="font-display text-lg font-bold text-primary tracking-tight">{profile?.username || 'Alex Sterling'}</h2>
            <p className="text-[10px] text-on-surface-variant flex items-center justify-center gap-xs mt-0.5">
              Pro Athlete <span className="w-1 h-1 bg-surface-container-highest rounded-full"></span> {profile?.streak || 7}-Day Streak
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-xs">
            <div className="glass-card p-xs rounded-xl flex flex-col justify-center items-center text-center">
              <span className="font-label-caps text-[8px] text-on-surface-variant">REPS</span>
              <div className="flex items-center gap-[2px] mt-xs">
                <span className="font-display text-xs font-bold text-on-surface">{(profile?.repsCompleted || 0).toLocaleString()}</span>
                <span className="material-symbols-outlined text-primary text-[10px]">trending_up</span>
              </div>
            </div>
            <div className="glass-card p-xs rounded-xl flex flex-col justify-center items-center text-center">
              <span className="font-label-caps text-[8px] text-on-surface-variant">BADGES</span>
              <div className="flex items-center gap-[2px] mt-xs">
                <span className="font-display text-xs font-bold text-on-surface">84</span>
                <span className="material-symbols-outlined text-primary text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
            </div>
            <div className="glass-card p-xs rounded-xl flex flex-col justify-center items-center text-center">
              <span className="font-label-caps text-[8px] text-on-surface-variant">PR TOTAL</span>
              <div className="flex items-baseline gap-[1px] mt-xs">
                <span className="font-display text-xs font-bold text-on-surface">{prTotalVal}</span>
                <span className="font-mono text-[7px] text-on-surface-variant">{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* Bio / Bio-metric HUD */}
          <div className="glass-card p-sm rounded-xl border-l-2 border-primary/50 bg-primary/5 space-y-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-label-caps text-[9px] text-primary tracking-widest">BIOMETRIC STATUS</h3>
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
            </div>
            <p className="font-mono text-[9px] text-on-surface leading-normal opacity-80">
              Body Fat: 8.4% // Recovery Score: 92% // VO2 Max: 58 <br />
              Focusing on explosive power and metabolic conditioning for the upcoming training cycle.
            </p>
          </div>
        </section>

        {/* Evolution/Transformation Gallery */}
        <section className="space-y-sm">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-display font-semibold text-xs text-on-surface">Evolution</h3>
              <p className="text-[9px] text-on-surface-variant">Visualizing 24 months of discipline.</p>
            </div>
            <button className="text-primary font-label-caps text-[8px] hover:underline uppercase">VIEW ALL</button>
          </div>
          
          <div className="grid grid-cols-1 gap-sm">
            <div className="relative group cursor-pointer overflow-hidden rounded-xl glass-card aspect-video">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 h-full relative">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlQIBTVOVGRN9p5Sb7SHIkaBJrpWmahWJjCL1_wd_Em-HlPtawktQOUSWKThnaYeraERhapGv7lgAbG6RUpWGMer20eX4RLxp6eJlqp878lrJnXD3fSLqL8fnRs7W9-bBmW4I_EE_gv83RC0p4jqg8o3uCIFY8RiA9pRiJ5tBeHaECd7M-cc98BwsKTs8QD03-u-BK6M5c7NIPFaJyCK1DykqADsZWlOqsLUvjykuv7q5A9nq7vA-HaZwbAHa6nfJjydrUsBFtrg" 
                    alt="before transformation"
                  />
                  <div className="absolute top-xs left-xs bg-black/60 backdrop-blur-sm px-xs py-0.5 font-label-caps text-[7px] text-white rounded">JAN 2022</div>
                </div>
                <div className="w-1/2 h-full relative border-l border-primary/30">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYdexa-SlBu8AzJHRmi_FWbvArLqNFwAiLAwHrxRoaYtnk1DQ0vsPlGrDLHdairiWIMZw5XYKkCGURq0zU8k8hWrOyaWY8SJnnlSaD1yU2c0K1fhZd7X6j8S_JKOwVICa_BNn5LzMDfuoqDKzzj9FWQqcwK0Dlff3DSZFaiTtvJSfBWLjpQJxWyq65t_GfDwkPznqYPdQn1PtLFoACqrM8UpeEwXhfM3QuE6Eza7lIqllwjQadPb15XUKu80bOSeyzxsYpOAYP6g" 
                    alt="current transformation"
                  />
                  <div className="absolute top-xs right-xs bg-primary/20 backdrop-blur-sm border border-primary/50 px-xs py-0.5 font-label-caps text-[7px] text-primary rounded">CURRENT</div>
                </div>
              </div>
            </div>

            {/* Year Goal Circle progress */}
            <div className="glass-card p-sm rounded-xl flex items-center justify-between border border-white/5">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" fill="none" r="32" stroke="#1a1a1a" strokeWidth="4"></circle>
                  <circle 
                    className="drop-shadow-[0_0_4px_rgba(57,255,20,0.5)]" 
                    cx="40" 
                    cy="40" 
                    fill="none" 
                    r="32" 
                    stroke="#39FF14" 
                    strokeDasharray="201" 
                    strokeDashoffset="48" 
                    strokeLinecap="round" 
                    strokeWidth="4"
                  ></circle>
                </svg>
                <div className="absolute text-center">
                  <span className="font-display text-sm font-extrabold text-primary">76%</span>
                </div>
              </div>
              <div className="flex-grow pl-sm text-left">
                <p className="text-[10px] text-on-surface font-semibold">Next Milestone: <span className="text-primary font-bold">Elite Alpha Rank</span></p>
                <p className="font-mono text-[8px] text-on-surface-variant uppercase mt-1">estimated completion: oct 24</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Avatar Forge */}
        <section className="space-y-sm">
          <div>
            <h3 className="font-display font-semibold text-xs text-on-surface">AI Avatar Forge</h3>
            <p className="text-[9px] text-on-surface-variant">Evolve your digital presence through neural synthesis.</p>
          </div>
          <div className="grid grid-cols-3 gap-xs">
            {/* Forge Button Card */}
            <button 
              onClick={handleForgeAvatar}
              disabled={forging}
              className="glass-card aspect-square rounded-xl flex flex-col items-center justify-center gap-xs border-dashed border-primary/30 group hover:bg-primary/5 transition-all w-full"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-primary text-xl">
                  {forging ? 'autorenew' : 'add'}
                </span>
              </div>
              <span className="font-label-caps text-[8px] text-primary uppercase text-center leading-tight">
                {forging ? 'SYNTHESIZING...' : 'FORGE NEW'}
              </span>
            </button>

            {/* Avatar presets */}
            {avatarPresets.map((av) => {
              const isActive = profile?.avatar === av.src;
              return (
                <div 
                  key={av.id}
                  onClick={() => handleSelectAvatar(av.src)}
                  className={`glass-card rounded-xl overflow-hidden group cursor-pointer relative aspect-square transition-all ${
                    isActive ? 'border-2 border-primary/50 shadow-md shadow-primary/20' : ''
                  }`}
                >
                  <img 
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isActive ? '' : 'grayscale hover:grayscale-0'
                    }`} 
                    src={av.src} 
                    alt={av.label} 
                  />
                  {isActive && (
                    <div className="absolute top-xs right-xs z-10">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    </div>
                  )}
                  <div className={`absolute bottom-0 inset-x-0 p-[2px] text-center backdrop-blur-sm ${
                    isActive ? 'bg-primary/80' : 'bg-black/60'
                  }`}>
                    <span className={`font-label-caps text-[8px] ${
                      isActive ? 'text-on-primary font-bold' : 'text-white'
                    }`}>
                      {isActive ? 'ACTIVE' : av.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Personal Records Bento Grid */}
        <section className="space-y-sm">
          <div>
            <h3 className="font-display font-semibold text-xs text-on-surface">Personal Records</h3>
            <p className="text-[9px] text-on-surface-variant">Current limits to be broken.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-xs">
            {/* Major lift card (Squat) */}
            {filteredPRs.map((card) => {
              const isMajor = card.id === 'prSquat';
              if (isMajor) {
                return (
                  <div 
                    key={card.id}
                    className="col-span-2 glass-card rounded-xl p-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <span className="font-label-caps text-[8px] text-primary tracking-widest">{card.sub}</span>
                      <h4 className="font-display text-2xl font-bold text-on-surface mt-1">
                        {card.value}
                        <span className="text-[10px] text-on-surface-variant ml-1">{card.unit}</span>
                      </h4>
                      <p className="text-[10px] text-on-surface font-medium">{card.displayLabel}</p>
                    </div>
                    <div className="relative z-10 flex justify-between items-end border-t border-white/5 pt-sm mt-xs">
                      <div className="space-y-[1px]">
                        <p className="font-label-caps text-[7px] text-on-surface-variant uppercase">LAST UPDATED</p>
                        <p className="font-mono text-[7px] text-on-surface">12 AUG 2023</p>
                      </div>
                      <button 
                        onClick={() => handleUpdatePR(card.id, `${card.displayLabel} (${card.unit})`)} 
                        className="bg-primary px-sm py-1 rounded text-on-primary font-label-caps text-[8px] active:scale-95 transition-transform"
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>
                );
              }

              // Minor cards
              return (
                <div 
                  key={card.id}
                  onClick={() => handleUpdatePR(card.id, `${card.displayLabel} (${card.unit})`)}
                  className="pr-card glass-card rounded-xl p-sm flex flex-col justify-between min-h-[75px] cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-caps text-[8px] text-on-surface-variant">{card.sub}</span>
                    <span className="material-symbols-outlined text-primary text-xs">
                      {card.id === 'prBench' ? 'fitness_center' : card.id === 'prDeadlift' ? 'bolt' : card.id === 'prOverhead' ? 'vertical_align_top' : 'speed'}
                    </span>
                  </div>
                  <div className="mt-xs">
                    <span className="font-display text-sm font-bold text-on-surface">{card.value}</span>
                    <span className="font-mono text-[7px] text-on-surface-variant ml-1">{card.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
