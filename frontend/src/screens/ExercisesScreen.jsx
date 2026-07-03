import React from 'react';

export default function ExercisesScreen({ onNavigate, onStartWorkout }) {
  const exercises = [
    {
      id: 'bench',
      name: 'Bench Press',
      type: 'Push',
      difficulty: 'Intermediate',
      target: 'Pectorals / Triceps',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkAjdCmPTl7NmPRiO6gGqNBYxH4XVEKuNq7yJEuMVAY8csqmqZ9-GOyYNOV1UZyTueB49Aj71ZssBoeuzBeSpvtAeKURkIx8nZp4SiCsP_hiz4QFXrDIfURV-4B1G9NZJ9C3jzUd-rYr_ebJmHdCQlNdEul_fvboHgpNXBx1OwJDo5Qhh4hjwkRBsyIMlG96y-M-uLABLtXNHUHLX6oyCEsX0ExvUfnGz-5nnIhBDMSyP12umxoQhcki-alO_LL0VMFbeSFnu-OA',
    },
    {
      id: 'squat',
      name: 'Barbell Squat',
      type: 'Legs',
      difficulty: 'Advanced',
      target: 'Quadriceps / Glutes',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0ZXmGKGlG9conGMAq0FWHaTJ2KrqVhRpHBCoVkenvpCwULpT9MJ9kVnHhi9r64MpA2TgVCHgA87DYC0T6bRxzqBpVHNDe1MCT_246yIH7M9-Gmeozd986vheToEZwy4Tb090ZRQuC_eJ53fCFz3kTT81ym55M3x0IDMfsFzEVKXyg4GdC2EMyYdnF92eLcPCXBGRafQa5pvqI7Pu_T1pgKMLpbwYiUuiAU8mUQkFyd5qbUbMTREbDypvBGdqbXHa3oPyQZwnczw',
    },
    {
      id: 'deadlift',
      name: 'Deadlift',
      type: 'Pull',
      difficulty: 'Advanced',
      target: 'Hamstrings / Back',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcOA1UsQGDC8_JJLfVDaSa4jnp0j7e_Nx1Txqx1AFBh_9X38jOFNqUDAO7MdMhABnKLwB-aVNwJXFczFX5F7zWpMMl9WcV0JW7rF_9m4YBi9K3f1f6YH6hqVGQ1XteDcz3ugPi-BP1HVO7_U2bI1FCE1btHGfa0A6IpANOtd5QoPQI0A0J_2zFDH3vcb18PFqrSxEWigrFrK7p8M_-0Y24KWru3HPfoRTV_86NhPKKiQgKtGPsZ_EHTF_iGo7CbTk9VSSO2jwpYw',
    },
    {
      id: 'overhead',
      name: 'Overhead Press',
      type: 'Push',
      difficulty: 'Intermediate',
      target: 'Deltoids / Core',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY0sXe4Axuya8Z5TCkSkkj23k-MhM_ZWmAZKuuQLqn1YTctVN9LQMnX_kywzMIF2s65tRQOd-2Nd99HNr-Rp8pam9i2xPsYf5MgTcUIsC2u0PjGittHd86Ws6tCD-i0Ve-Lom1RCB8LzwpNn4q6crs_T5_OVi0A92unPPOnk9GcEJehgRZwL_9j6yQT4R6rdwFqVDtjN5vYj2NMv7JSoiCKj_dkw1esvmLGqFveQNWUWZBuwUVU9GIt6e3HKm4EbSe9rXdFCxfFA',
    },
  ];

  return (
    <div className="scroll-area flex-grow w-full px-gutter pt-md space-y-md select-none bg-black pb-[96px]">
      <header className="flex justify-between items-center z-20 pb-sm">
        <div className="flex items-center gap-xs">
          <h1 className="font-display text-lg font-bold tracking-tighter text-primary">FITGURU COACH</h1>
        </div>
        <button 
          onClick={() => onNavigate('profile')}
          className="p-xs hover:bg-white/5 rounded-full text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </header>

      {/* Focus banner */}
      <section className="relative rounded-xl overflow-hidden min-h-[160px] flex items-end p-sm border border-primary/20 bg-primary/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0ZXmGKGlG9conGMAq0FWHaTJ2KrqVhRpHBCoVkenvpCwULpT9MJ9kVnHhi9r64MpA2TgVCHgA87DYC0T6bRxzqBpVHNDe1MCT_246yIH7M9-Gmeozd986vheToEZwy4Tb090ZRQuC_eJ53fCFz3kTT81ym55M3x0IDMfsFzEVKXyg4GdC2EMyYdnF92eLcPCXBGRafQa5pvqI7Pu_T1pgKMLpbwYiUuiAU8mUQkFyd5qbUbMTREbDypvBGdqbXHa3oPyQZwnczw" 
            alt="focus background" 
          />
        </div>
        <div className="relative z-20 space-y-0.5">
          <div className="flex items-center gap-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-caps text-[8px] text-primary uppercase">Active Focus</span>
          </div>
          <h2 className="font-display font-bold text-sm text-white">Today's Focus: Form Correction</h2>
          <p className="text-[9px] text-on-surface-variant max-w-[260px] leading-relaxed">
            AI vision tracking is calibrated for your core stabilizers today. Let's optimize mechanics.
          </p>
          <button 
            onClick={() => onStartWorkout('Barbell Squat')}
            className="mt-xs bg-primary text-black font-bold text-[9px] px-sm py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-xs w-fit"
          >
            <span>START CALIBRATION</span>
            <span className="material-symbols-outlined text-[10px] font-bold">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Routine Grid */}
      <section className="space-y-sm">
        <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">Core Movements</h3>
        <div className="grid grid-cols-2 gap-sm">
          {exercises.map((ex) => (
            <div key={ex.id} className="glass-card rounded-xl overflow-hidden flex flex-col border border-white/5 group">
              <div className="h-28 relative overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={ex.img} alt={ex.name} />
                <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 rounded text-[7px] font-mono text-primary/80 border border-white/10">
                  V.RECON
                </div>
              </div>
              <div className="p-xs flex flex-col justify-between flex-grow space-y-sm">
                <div>
                  <h4 className="font-display font-semibold text-xs text-white leading-tight">{ex.name}</h4>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className="text-[7px] font-mono text-on-surface-variant border border-white/10 rounded px-1">{ex.type}</span>
                    <span className="text-[7px] font-mono text-primary/80 border border-primary/20 rounded px-1">{ex.difficulty}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onStartWorkout(ex.name)}
                  className="w-full py-1 bg-primary text-black rounded-lg font-bold text-[9px] active:scale-95 transition-transform flex items-center justify-center gap-xs"
                >
                  <span>START AI SCAN</span>
                  <span className="material-symbols-outlined text-[10px] font-bold">videocam</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
