import React, { useState, useEffect, useRef } from 'react';

export default function CameraScreen({ onNavigate, showToast, authHeaders, exerciseName }) {
  const [reps, setReps] = useState(0);
  const [hudActive, setHudActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [logs, setLogs] = useState(['INIT SYSTEMS: CALIBRATING MATRIX', 'SECURE TELEMETRY LINK CONNECTED']);
  const [statusText, setStatusText] = useState('WEBCAM: SIMULATED');
  const [coachingFeedback, setCoachingFeedback] = useState('ALIGN BODY IN CAMERA FRAME');
  const [feedbackAlert, setFeedbackAlert] = useState(false);

  const canvasRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const requestRef = useRef(null);

  const addLogLine = (line) => {
    setLogs((prev) => [line, ...prev.slice(0, 4)]);
  };

  // Canvas drawing and simulated rep animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const repDuration = 3500;
    let lastLoggedRep = -1;

    // Load template image of athlete
    const athleteImg = new Image();
    athleteImg.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcOA1UsQGDC8_JJLfVDaSa4jnp0j7e_Nx1Txqx1AFBh_9X38jOFNqUDAO7MdMhABnKLwB-aVNwJXFczFX5F7zWpMMl9WcV0JW7rF_9m4YBi9K3f1f6YH6hqVGQ1XteDcz3ugPi-BP1HVO7_U2bI1FCE1btHGfa0A6IpANOtd5QoPQI0A0J_2zFDH3vcb18PFqrSxEWigrFrK7p8M_-0Y24KWru3HPfoRTV_86NhPKKiQgKtGPsZ_EHTF_iGo7CbTk9VSSO2jwpYw';

    const drawSkeletonNode = (pt, label = '') => {
      // Glow circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(57, 255, 20, 0.25)';
      ctx.fill();

      // Inner circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#39FF14';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.75;
      ctx.stroke();

      if (label) {
        ctx.font = '8px monospace';
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(pt.x - tw / 2 - 2, pt.y - 18, tw + 4, 11);
        ctx.fillStyle = '#39FF14';
        ctx.fillText(label, pt.x - tw / 2, pt.y - 10);
      }
    };

    const drawSkeletonBone = (p1, p2) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.35)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.strokeStyle = '#39FF14';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const render = (timestamp) => {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw athlete background
      ctx.globalAlpha = 0.55;
      ctx.drawImage(athleteImg, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;

      // Simulated motion mathematics
      const progress = (timestamp % repDuration) / repDuration;
      const factor = (1 - Math.cos(progress * 2 * Math.PI)) / 2;

      // Simulated rep counter sync
      const currentRep = Math.floor(timestamp / repDuration) % 12 + 1;
      if (currentRep !== lastLoggedRep) {
        lastLoggedRep = currentRep;
        setReps(currentRep);
        addLogLine(`REP ${currentRep} DETECTED: POSTURE SECURE`);
      }

      // Draw skeleton
      const cyCenter = canvas.height * 0.45 + factor * 40;
      const cySides = canvas.height * 0.47 + factor * 30;

      const shoulderL = { x: canvas.width * 0.35, y: canvas.height * 0.38 };
      const shoulderR = { x: canvas.width * 0.65, y: canvas.height * 0.38 };
      const elbowL = { x: canvas.width * 0.35, y: cySides };
      const elbowR = { x: canvas.width * 0.65, y: cySides };
      const wristL = { x: canvas.width * 0.35, y: cySides + 40 };
      const wristR = { x: canvas.width * 0.65, y: cySides + 40 };
      const chest = { x: canvas.width * 0.5, y: cyCenter };
      const hip = { x: canvas.width * 0.5, y: canvas.height * 0.68 };

      drawSkeletonBone(shoulderL, elbowL);
      drawSkeletonBone(shoulderR, elbowR);
      drawSkeletonBone(shoulderL, shoulderR);
      drawSkeletonBone(chest, hip);

      // Simulated elbow angles
      const angleL = 142.4 - factor * 60 + Math.sin(timestamp / 300) * 1;
      const angleR = 145.1 - factor * 62 + Math.cos(timestamp / 300) * 1;

      drawSkeletonNode(elbowL, `ELBOW_L: ${angleL.toFixed(0)}°`);
      drawSkeletonNode(elbowR, `ELBOW_R: ${angleR.toFixed(0)}°`);
      drawSkeletonNode(chest);

      // Simulated feedback update
      if (factor > 0.75) {
        setCoachingFeedback('KEEP FEET FLAT. ARCH BACK SLIGHTLY.');
        setFeedbackAlert(true);
      } else if (factor < 0.25) {
        setCoachingFeedback('FORM OPTIMAL. KEEP STEADY TEMPO.');
        setFeedbackAlert(false);
      } else {
        setCoachingFeedback('ELBOWS BENDING WELL. PRESS UP SMOOTHLY.');
        setFeedbackAlert(false);
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleEndSession = async () => {
    const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (reps === 0 || durationSec < 2) {
      onNavigate('exercises');
      return;
    }

    addLogLine('UPLOADING ATHLETIC SESSION LOG...');
    try {
      const res = await fetch('/api/workouts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          exercise: exerciseName || 'Bench Press',
          reps: reps,
          durationSec: durationSec,
          averageAngle: 142,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`SESSION LOGGED: +${data.xpGained} XP`, 'success');
        setTimeout(() => onNavigate('exercises'), 1000);
      } else {
        onNavigate('exercises');
      }
    } catch (err) {
      onNavigate('exercises');
    }
  };

  const handleRecalibrate = () => {
    addLogLine('CALIBRATING POSTURE GRID...');
    showToast('RE-CALIBRATING TARGET LOCK');
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      {/* 2D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-10"></canvas>
      <div className="scanline absolute inset-0 opacity-[0.05] pointer-events-none z-20"></div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full px-gutter py-md z-40 flex justify-between items-start">
        <div className="flex flex-col gap-xs font-mono text-[8px] text-primary/70">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[10px] text-primary animate-pulse">radar</span>
            <span className="font-bold tracking-wider">TARGET LOCK</span>
          </div>
          <div className="flex flex-col opacity-80">
            <span>SYS.RECON: ACTIVE</span>
            <span>FPS: 60.00</span>
            <span>{statusText}</span>
          </div>
        </div>

        {/* HUD control bar */}
        <div className="flex items-center gap-xs">
          <button 
            onClick={() => setHudActive(prev => !prev)}
            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
              hudActive ? 'text-primary border-primary bg-primary/10' : 'text-white border-white/10 bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xs">grid_view</span>
          </button>
          <button 
            onClick={handleRecalibrate}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white border border-white/10 bg-white/5"
            title="Recalibrate"
          >
            <span className="material-symbols-outlined text-xs">refresh</span>
          </button>
          <button 
            onClick={() => setIsRecording(prev => !prev)}
            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
              isRecording ? 'bg-error/30 text-error border-error animate-pulse' : 'text-white border-white/10 bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xs">videocam</span>
          </button>
          <button 
            onClick={handleEndSession}
            className="w-7 h-7 rounded-full bg-error/20 text-error border border-error/30 flex items-center justify-center hover:bg-error/40 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Side Panels */}
      {hudActive && (
        <>
          {/* Left panel: Reps */}
          <div className="absolute left-gutter top-[40%] z-40 flex flex-col gap-sm pointer-events-none">
            <div className="glass-card p-xs rounded-xl w-32 border-l-2 border-l-primary flex flex-col justify-center">
              <span className="font-label-caps text-[8px] text-on-surface-variant uppercase">Recon.Cycles</span>
              <div className="flex items-baseline gap-xs mt-1">
                <span className="font-display text-xl text-primary font-bold">{reps.toString().padStart(2, '0')}</span>
                <span className="text-[8px] text-on-surface-variant">/12</span>
              </div>
            </div>
            <div className="glass-card p-xs rounded-xl w-32 border-l-2 border-l-primary flex flex-col justify-center">
              <span className="font-label-caps text-[8px] text-on-surface-variant uppercase">Alignment</span>
              <span className="font-display font-bold text-xs text-white mt-1">92% OPTIMAL</span>
            </div>
          </div>

          {/* Right panel: Core Status */}
          <div className="absolute right-gutter top-[40%] z-40 flex flex-col items-end gap-sm pointer-events-none">
            <div className="glass-card p-xs rounded-xl w-36 border-r-2 border-r-primary text-right flex flex-col justify-center">
              <span className="font-label-caps text-[8px] text-primary uppercase">Cognitive Core</span>
              <span className="font-mono text-[7px] text-on-surface-variant mt-1">Bench Analysis Active</span>
            </div>
            <div className="glass-card p-xs rounded-xl w-36 border-r-2 border-r-error text-right flex flex-col justify-center">
              <span className="font-label-caps text-[8px] text-error uppercase">Integrity</span>
              <span className="font-mono text-[7px] text-error animate-pulse">Telemetry Live</span>
            </div>
          </div>
        </>
      )}

      {/* Bottom HUD Feedback Banner */}
      <div className="absolute bottom-[40px] left-gutter right-gutter z-40 flex flex-col gap-xs pointer-events-none">
        <div className={`flex items-center gap-xs bg-black/60 border backdrop-blur-md p-xs rounded-xl border-l-2 ${
          feedbackAlert ? 'border-error border-l-error' : 'border-primary border-l-primary'
        }`}>
          <div className={`p-xs rounded-lg flex items-center justify-center shrink-0 ${
            feedbackAlert ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
          }`}>
            <span className="material-symbols-outlined text-sm font-bold">
              {feedbackAlert ? 'warning' : 'auto_awesome'}
            </span>
          </div>
          <div className="flex-grow min-w-0">
            <div className="font-label-caps text-[7px] text-on-surface-variant uppercase">
              {feedbackAlert ? 'Form Critical Alert' : 'Biometric Range'}
            </div>
            <p className="text-[9px] text-white font-medium truncate leading-tight mt-0.5">{coachingFeedback}</p>
          </div>
        </div>

        {/* Telemetry scrolling logs */}
        <div className="flex justify-between items-center font-mono text-[7px] text-on-surface-variant opacity-60 px-xs pt-1">
          <div className="flex flex-col gap-0.5">
            {logs.map((log, idx) => (
              <span key={idx}>{log}</span>
            ))}
          </div>
          <span className="text-right">FG_SYS_LOCK_v3.4</span>
        </div>
      </div>
    </div>
  );
}
