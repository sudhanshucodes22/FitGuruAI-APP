import React, { useState, useEffect } from 'react';

export default function TrackerScreen({ onNavigate, showToast, authHeaders }) {
  const [profile, setProfile] = useState(null);
  const [habitsState, setHabitsState] = useState({
    waterMl: 0,
    sleepHrs: 0,
    steps: 0,
    dietCompleted: false,
    workoutCompleted: false,
    readinessScore: 50,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await fetch('/api/auth/profile', { headers: authHeaders });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        const habitsRes = await fetch('/api/habits/today', { headers: authHeaders });
        if (habitsRes.ok) {
          const habitsData = await habitsRes.json();
          setHabitsState(habitsData);
        }
      } catch (err) {
        showToast('Failed to sync biometric tracker', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [authHeaders, showToast]);

  const saveHabitsUpdate = async (fields) => {
    try {
      const res = await fetch('/api/habits/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        setHabitsState(data.habits);
        if (data.xpGained > 0) {
          showToast(`+${data.xpGained} XP GAINED`, 'success');
        }
      } else {
        showToast(data.error || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  const changeWater = (amount) => {
    const newVal = Math.max(0, habitsState.waterMl + amount);
    saveHabitsUpdate({ waterMl: newVal });
  };

  const toggleWaterCard = () => {
    const newVal = habitsState.waterMl >= 3000 ? 0 : 3000;
    saveHabitsUpdate({ waterMl: newVal });
  };

  const changeSleep = (amount) => {
    const newVal = Math.max(0, habitsState.sleepHrs + amount);
    saveHabitsUpdate({ sleepHrs: newVal });
  };

  const toggleSleepCard = () => {
    const newVal = habitsState.sleepHrs >= 8 ? 0 : 8;
    saveHabitsUpdate({ sleepHrs: newVal });
  };

  const changeSteps = (amount) => {
    const newVal = Math.max(0, habitsState.steps + amount);
    saveHabitsUpdate({ steps: newVal });
  };

  const toggleStepsCard = () => {
    const newVal = habitsState.steps >= 10000 ? 0 : 10000;
    saveHabitsUpdate({ steps: newVal });
  };

  const toggleDiet = () => {
    saveHabitsUpdate({ dietCompleted: !habitsState.dietCompleted });
  };

  const toggleWorkout = () => {
    saveHabitsUpdate({ workoutCompleted: !habitsState.workoutCompleted });
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

  const readinessVal = habitsState.readinessScore || 50;
  const circumference = 282.7;
  const dashOffset = circumference - (circumference * readinessVal) / 100;

  let completedCount = 0;
  if (habitsState.waterMl >= 3000) completedCount++;
  if (habitsState.sleepHrs >= 8) completedCount++;
  if (habitsState.steps >= 10000) completedCount++;
  if (habitsState.dietCompleted) completedCount++;
  if (habitsState.workoutCompleted) completedCount++;

  let insightsText = 'STABILITY PROTOCOL: Steady consistency levels. Keep sleep cycles lock-aligned to trigger anabolic synthesis.';
  if (readinessVal >= 80) {
    insightsText = 'BIOMETRICS OPTIMIZED: Readiness is elite. Today is highly favorable for hitting peak squat reps. Maintain hydration pacing.';
  } else if (readinessVal < 50) {
    insightsText = 'RECOVERY ALIGNMENT REQUIRED: Biometric scores are below base levels. Recommend priority hydration and targeting caseins to rebuild muscle fibers.';
  }

  return (
    <div className="scroll-area flex-grow w-full px-gutter pt-md space-y-md select-none bg-black pb-[96px]">
      {/* Top Header */}
      <header className="flex justify-between items-center z-20 pb-sm">
        <div className="flex items-center gap-xs">
          <div 
            onClick={() => onNavigate('profile')}
            className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 cursor-pointer active:scale-95 transition-transform"
          >
            <img className="w-full h-full object-cover" src={profile?.avatar} alt="avatar" />
          </div>
          <h1 className="font-display text-lg font-bold tracking-tighter text-primary">FITGURU</h1>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            showToast('SYSTEM SHUTDOWN: LOGGED OUT');
            onNavigate('auth');
          }}
          className="p-xs hover:bg-white/5 rounded-full text-on-surface-variant hover:text-primary transition-colors"
          title="Logout"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
        </button>
      </header>

      {/* Hero Section: Consistency Score */}
      <section className="grid grid-cols-1 gap-sm">
        <div className="glass-card rounded-xl p-md flex items-center justify-between gap-sm border border-white/10">
          <div className="flex flex-col justify-center flex-grow">
            <h2 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Readiness Score</h2>
            <span className="font-display text-3xl text-primary font-bold text-glow">{readinessVal}%</span>
            <span className="font-mono text-[8px] text-on-surface-variant mt-0.5 block">Dynamic live calculation</span>
            <p className="mt-sm text-[10px] text-on-surface-variant">Perform daily disciplines to maximize score.</p>
          </div>
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="45" stroke="#1A1A1A" strokeWidth="8"></circle>
              <circle 
                className="transition-all duration-1000 ease-out" 
                cx="50" 
                cy="50" 
                fill="transparent" 
                r="45" 
                stroke="#39FF14" 
                strokeWidth="8"
                strokeDasharray="282.7"
                strokeDashoffset={dashOffset}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-semibold text-xs text-primary">{readinessVal}%</span>
            </div>
          </div>
        </div>

        {/* Streak Info */}
        <div className="glass-card rounded-xl p-sm flex justify-between items-center border border-white/5">
          <div>
            <h2 className="font-display font-bold text-sm text-primary">{profile?.streak || 0} Day Streak</h2>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Don't break the chain, Athlete.</p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
        </div>
      </section>

      {/* Habit Checklist */}
      <section className="space-y-sm">
        <div className="flex justify-between items-end">
          <h2 className="font-display font-bold text-xs text-white uppercase tracking-wider">Daily Disciplines</h2>
          <span className="font-mono text-[10px] text-on-surface-variant">{completedCount} of 5 Completed</span>
        </div>

        <div className="flex flex-col gap-xs">
          {/* Hydration */}
          <div 
            onClick={toggleWaterCard}
            className={`glass-card p-xs rounded-xl flex items-center gap-xs relative cursor-pointer border ${
              habitsState.waterMl >= 3000 ? 'border-primary/20 bg-primary/5' : 'border-white/5'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-md">water_drop</span>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline mb-0.5" onClick={e => e.stopPropagation()}>
                <h3 className="font-semibold text-[11px] text-on-surface truncate">Hydration</h3>
                <div className="flex items-center gap-xs font-mono text-[9px] text-on-surface-variant">
                  <button onClick={() => changeWater(-250)} className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 font-bold">-</button>
                  <span>{habitsState.waterMl}ml</span> / 3000ml
                  <button onClick={() => changeWater(250)} className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 font-bold">+</button>
                </div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (habitsState.waterMl / 3000) * 100)}%` }}></div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              habitsState.waterMl >= 3000 ? 'bg-primary border-primary' : 'border-white/10'
            }`}>
              {habitsState.waterMl >= 3000 && <span className="material-symbols-outlined text-black font-bold text-[10px]">check</span>}
            </div>
          </div>

          {/* Sleep */}
          <div 
            onClick={toggleSleepCard}
            className={`glass-card p-xs rounded-xl flex items-center gap-xs relative cursor-pointer border ${
              habitsState.sleepHrs >= 8 ? 'border-primary/20 bg-primary/5' : 'border-white/5'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-md">bedtime</span>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline mb-0.5" onClick={e => e.stopPropagation()}>
                <h3 className="font-semibold text-[11px] text-on-surface truncate">Rest Period</h3>
                <div className="flex items-center gap-xs font-mono text-[9px] text-on-surface-variant">
                  <button onClick={() => changeSleep(-0.5)} className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 font-bold">-</button>
                  <span>{habitsState.sleepHrs}h</span> / 8h
                  <button onClick={() => changeSleep(0.5)} className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 font-bold">+</button>
                </div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (habitsState.sleepHrs / 8) * 100)}%` }}></div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              habitsState.sleepHrs >= 8 ? 'bg-primary border-primary' : 'border-white/10'
            }`}>
              {habitsState.sleepHrs >= 8 && <span className="material-symbols-outlined text-black font-bold text-[10px]">check</span>}
            </div>
          </div>

          {/* Steps */}
          <div 
            onClick={toggleStepsCard}
            className={`glass-card p-xs rounded-xl flex items-center gap-xs relative cursor-pointer border ${
              habitsState.steps >= 10000 ? 'border-primary/20 bg-primary/5' : 'border-white/5'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-md">footprint</span>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline mb-0.5" onClick={e => e.stopPropagation()}>
                <h3 className="font-semibold text-[11px] text-on-surface truncate">Steps Goal</h3>
                <div className="flex items-center gap-xs font-mono text-[9px] text-on-surface-variant">
                  <button onClick={() => changeSteps(-1000)} className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 font-bold">-</button>
                  <span>{habitsState.steps.toLocaleString()}</span> / 10k
                  <button onClick={() => changeSteps(1000)} className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 font-bold">+</button>
                </div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (habitsState.steps / 10000) * 100)}%` }}></div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              habitsState.steps >= 10000 ? 'bg-primary border-primary' : 'border-white/10'
            }`}>
              {habitsState.steps >= 10000 && <span className="material-symbols-outlined text-black font-bold text-[10px]">check</span>}
            </div>
          </div>

          {/* Clean Diet */}
          <div 
            onClick={toggleDiet}
            className={`glass-card p-xs rounded-xl flex items-center gap-xs relative cursor-pointer border ${
              habitsState.dietCompleted ? 'border-primary/20 bg-primary/5' : 'border-white/5'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-md">restaurant</span>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-semibold text-[11px] text-on-surface truncate">Clean Nutrition Plan</h3>
                <span className="font-mono text-[9px] text-on-surface-variant">
                  {habitsState.dietCompleted ? 'Achieved' : 'Pending'}
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: habitsState.dietCompleted ? '100%' : '0%' }}></div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              habitsState.dietCompleted ? 'bg-primary border-primary' : 'border-white/10'
            }`}>
              {habitsState.dietCompleted && <span className="material-symbols-outlined text-black font-bold text-[10px]">check</span>}
            </div>
          </div>

          {/* Workout */}
          <div 
            onClick={toggleWorkout}
            className={`glass-card p-xs rounded-xl flex items-center gap-xs relative cursor-pointer border ${
              habitsState.workoutCompleted ? 'border-primary/20 bg-primary/5' : 'border-white/5'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-md">fitness_center</span>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-semibold text-[11px] text-on-surface truncate">Elite Training Session</h3>
                <span className="font-mono text-[9px] text-on-surface-variant">
                  {habitsState.workoutCompleted ? 'Achieved' : 'Pending'}
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: habitsState.workoutCompleted ? '100%' : '0%' }}></div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              habitsState.workoutCompleted ? 'bg-primary border-primary' : 'border-white/10'
            }`}>
              {habitsState.workoutCompleted && <span className="material-symbols-outlined text-black font-bold text-[10px]">check</span>}
            </div>
          </div>
        </div>
      </section>

      {/* AI Analysis */}
      <section className="glass-card p-sm rounded-xl border border-primary/20 space-y-xs">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          <h3 className="font-display font-semibold text-xs text-white">AI Coach Insights</h3>
        </div>
        <p className="text-[10px] text-on-surface-variant leading-relaxed">{insightsText}</p>
        <button 
          onClick={() => onNavigate('coach')}
          className="mt-xs bg-primary text-black font-bold text-[10px] px-sm py-1.5 rounded-lg active:scale-95 transition-transform"
        >
          Consult Coach
        </button>
      </section>
    </div>
  );
}
