import React, { useState, useEffect } from 'react';

export default function PhoneWrapper({ currentScreen, onNavigate, children }) {
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'scanner', label: 'Meals', icon: 'restaurant' },
    { id: 'tracker', label: 'Tracker', icon: 'grid_view' },
    { id: 'coach', label: 'AI Chat', icon: 'forum' },
    { id: 'rewards', label: 'Badges', icon: 'trophy' },
    { id: 'exercises', label: 'Workouts', icon: 'fitness_center' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  const mainTabs = tabs.map(t => t.id);
  const showNav = mainTabs.includes(currentScreen);

  return (
    <div className="iphone-container">
      <div className="iphone-border"></div>
      <div className="iphone-reflection"></div>
      <div className="dynamic-island">
        <div className="camera-lens"></div>
      </div>
      <div className="home-indicator"></div>
      
      <div className="iphone-screen">
        {/* iOS Status Bar */}
        <div className="status-bar">
          <span className="status-bar-time leading-none">{time}</span>
          <div className="status-bar-icons">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600" }}>signal_cellular_alt</span>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600" }}>wifi</span>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600" }}>battery_5_bar</span>
          </div>
        </div>

        {/* Content area */}
        {children}

        {/* Bottom Navigation Bar */}
        {showNav && (
          <nav className="absolute bottom-0 left-0 w-full bg-background/95 border-t border-white/10 flex justify-around items-center px-1 pb-3 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]" style={{ height: '84px' }}>
            {tabs.map((tab) => {
              const isActive = currentScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    isActive ? 'text-[#39ff14]' : 'text-[#8e8e93] hover:text-[#39ff14] opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className={`w-11 h-11 flex items-center justify-center mb-0.5 ${
                    isActive ? 'rounded-xl border border-[#39ff14] bg-[#39ff14]/10 shadow-[0_0_10px_rgba(57,255,20,0.3)]' : ''
                  }`}>
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {tab.icon}
                    </span>
                  </div>
                  <span className={`font-label-caps text-[8px] uppercase tracking-wider ${isActive ? 'font-bold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
