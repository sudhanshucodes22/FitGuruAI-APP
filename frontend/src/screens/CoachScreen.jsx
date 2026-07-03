import React, { useState, useEffect, useRef } from 'react';

export default function CoachScreen({ onNavigate, showToast, authHeaders }) {
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState([6, 6, 6, 6, 6, 6, 6]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Waveform animation
  useEffect(() => {
    let interval;
    if (isListening || isThinking) {
      interval = setInterval(() => {
        setWaveformHeights(
          Array.from({ length: 7 }, () => Math.floor(Math.random() * 26) + 6)
        );
      }, 150);
    } else {
      setWaveformHeights([6, 6, 6, 6, 6, 6, 6]);
    }
    return () => clearInterval(interval);
  }, [isListening, isThinking]);

  // Init speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        showToast('COACH VOICE UPLINK ACTIVE');
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          showToast('TRANSCRIBED SUCCESSFULLY');
        }
      };

      rec.onerror = () => {
        showToast('Voice transmission error', 'error');
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [showToast]);

  // Fetch initial profile & chats
  useEffect(() => {
    async function init() {
      try {
        const profileRes = await fetch('/api/auth/profile', { headers: authHeaders });
        if (!profileRes.ok) throw new Error('Unauthorized');
        const profileData = await profileRes.json();
        setProfile(profileData);

        const historyRes = await fetch('/api/coach/history', { headers: authHeaders });
        if (historyRes.ok) {
          const chats = await historyRes.json();
          if (chats.length === 0) {
            setMessages([
              {
                id: 'welcome-msg',
                sender: 'coach',
                text: `Welcome back, ${profileData.username}! Ask me anything about your workout protocols, meal macros, or rest cycles.`,
                timestamp: new Date().toISOString(),
              },
            ]);
          } else {
            setMessages(chats);
          }
        }
      } catch (err) {
        showToast('Telemetry sync failed', 'error');
        localStorage.removeItem('token');
        onNavigate('auth');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [authHeaders, onNavigate, showToast]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || isThinking) return;

    setInputText('');
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setIsThinking(false);

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'coach-' + Date.now(),
            sender: 'coach',
            text: data.text,
            timestamp: data.timestamp,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'coach',
            text: `// JARVIS // CONNECTION_ERROR: Failed to establish secure uplink. Reason: ${data.error || 'Server error'}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'coach',
          text: '// JARVIS // OFFLINE: Transmission failed. Check telemetry stream connection.',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser', 'error');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-sm">
          <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
          <span className="font-label-caps text-xs text-primary/70 tracking-widest uppercase">CONNECTING SIGNAL</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full flex flex-col justify-between select-none bg-black relative">
      {/* Scrollable Chat Message Area */}
      <div className="scroll-area flex-grow px-gutter pt-md space-y-md overflow-y-auto pb-[180px]">
        {/* Intro */}
        <section className="flex flex-col items-center text-center space-y-sm pb-sm border-b border-white/5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary/40 to-transparent animate-pulse">
              <img 
                className="w-full h-full rounded-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB19t161uaT8feGpCk1WnR1e1CTRl1YnAAGlfex3h0FApwiXIUUD_yRO7o6HKbGli4GMqiub-LsSaQ8rGaHQMOk1HzVG416zGMnP5W0LdcgsNwX7Y4FDxg5Kqcd_FhtGy15AhUTQEyUs-A74czc4MYU0saWl_WjyEFbvBCNgClNShBailjcw_0xGytPmZqeLs0ASNpfEo9f_iRD1gRmt94nz6LxgdYjqeeoUt5lSpDVFmLRRviNdhCNLnekRoohOCwBuo9DYbY3g" 
                alt="trainer avatar" 
              />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-black font-bold">bolt</span>
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold text-xs text-primary">"Ready to crush your goals today, {profile?.username}?"</h2>
            <p className="text-[9px] text-on-surface-variant">Neural connection stable. Streak lock: {profile?.streak || 0} Days.</p>
          </div>
        </section>

        {/* Message bubbles */}
        <div className="flex flex-col gap-sm">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={msg.id} className={`flex flex-col gap-0.5 max-w-[85%] ${isUser ? 'items-end self-end' : 'items-start self-start'}`}>
                {!isUser && (
                  <div className="flex items-center gap-xs mb-0.5">
                    <span className="material-symbols-outlined text-[9px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <span className="text-[8px] text-primary font-mono tracking-wider uppercase">JARVIS_V4</span>
                  </div>
                )}
                <div className={`glass-card border rounded-2xl px-sm py-xs text-[11px] leading-relaxed whitespace-pre-line ${
                  isUser 
                    ? 'bg-primary/10 border-primary/20 text-white rounded-tr-none shadow-[0_0_10px_rgba(57,255,20,0.05)]' 
                    : 'bg-white/5 border-white/10 text-on-surface rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[7px] text-on-surface-variant/40 font-mono mt-0.5 px-xs">{timeStr}</span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isThinking && (
            <div className="flex flex-col items-start gap-0.5 max-w-[80%] self-start">
              <div className="flex items-center gap-xs mb-0.5">
                <span className="material-symbols-outlined text-[9px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <span className="text-[8px] text-primary font-mono tracking-wider uppercase">JARVIS_V4</span>
              </div>
              <div className="glass-card bg-white/5 border border-white/10 text-on-surface rounded-2xl rounded-tl-none px-sm py-xs text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Input & Waveforms */}
      <div className="absolute bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-white/10 px-gutter pt-sm pb-gutter z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {/* Waveform Visualization */}
        <div className="flex items-center justify-center gap-1 h-8 mb-xs">
          {waveformHeights.map((h, i) => (
            <div 
              key={i} 
              className="w-1 bg-primary rounded-full transition-all duration-150" 
              style={{
                height: `${h}px`,
                opacity: isListening || isThinking ? 1 : 0.25,
                boxShadow: isListening || isThinking ? '0 0 8px #39ff14' : 'none'
              }}
            ></div>
          ))}
        </div>

        {/* Text Input Panel */}
        <form onSubmit={handleSend} className="flex items-center gap-xs">
          <div className={`flex-grow glass-card rounded-full px-sm py-1.5 flex items-center gap-xs border transition-all duration-300 ${
            isListening ? 'border-primary shadow-[0_0_10px_rgba(57,255,20,0.25)]' : 'border-white/10'
          }`}>
            <button 
              type="button"
              onClick={toggleListening}
              className={`flex items-center justify-center hover:text-primary active:scale-95 transition-transform shrink-0 ${
                isListening ? 'text-primary' : 'text-on-surface-variant'
              }`}
              title="Voice Input"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isListening ? 'settings_voice' : 'mic'}
              </span>
            </button>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening... Speak now.' : 'Ask your coach anything...'}
              className="bg-transparent border-none focus:ring-0 text-xs text-on-surface w-full p-0 placeholder:text-on-surface-variant/40"
              disabled={isListening}
            />
          </div>
          <button 
            type="submit"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black active:scale-90 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-sm font-bold">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
