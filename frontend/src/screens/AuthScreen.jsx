import React, { useState } from 'react';

export default function AuthScreen({ onNavigate, showToast, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      showToast('Username & password required', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed', 'error');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        showToast('Account Created Successfully', 'success');
        onLoginSuccess(data.token);
        setTimeout(() => onNavigate('dashboard'), 1000);
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      showToast('Username & password required', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Login failed', 'error');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        showToast('Access Granted: System Synced', 'success');
        onLoginSuccess(data.token);
        setTimeout(() => onNavigate('dashboard'), 1000);
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center p-gutter bg-black select-none">
      <header className="mb-lg text-center">
        <div className="inline-block p-xs rounded-xl bg-primary/10 mb-xs">
          <span className="font-display text-xl font-bold tracking-tighter text-primary text-glow">FITGURU</span>
        </div>
        <h1 className="font-display text-xl font-bold text-white tracking-wide">Ascend Your Limits</h1>
        <p className="text-[10px] text-on-surface-variant mt-0.5">The technical engine for elite physical performance.</p>
      </header>

      <div className="w-full glass-card rounded-2xl p-md flex flex-col gap-sm">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-sm">
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              placeholder="ENTER USERNAME" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 px-sm bg-black/40 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/30 font-mono text-[11px] transition-all uppercase"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider">Security Code</label>
            <input 
              type="password" 
              placeholder="ENTER PASSWORD" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-sm bg-black/40 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/30 font-mono text-[11px] transition-all"
            />
          </div>

          <div className="flex flex-col gap-xs mt-sm">
            <button 
              type="button" 
              onClick={handleRegister}
              disabled={loading}
              className="group relative w-full h-11 bg-primary text-black font-bold text-xs rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50"
            >
              <span className="relative z-10 font-bold uppercase tracking-wider">CREATE ACCOUNT</span>
            </button>
            <button 
              type="button" 
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center disabled:opacity-50"
            >
              SIGN IN
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-md text-center max-w-[280px] mx-auto">
        <p className="font-label-caps text-[8px] text-on-surface-variant/60 leading-relaxed font-body">
          By joining, you consent to our <a className="text-primary hover:underline transition-all" href="#training">Training Protocols</a> and <a className="text-primary hover:underline transition-all" href="#privacy">Data Encryption Policy</a>.
        </p>
      </footer>
    </div>
  );
}
