import React, { useState, useEffect, useRef } from 'react';

export default function ScannerScreen({ onNavigate, showToast, authHeaders }) {
  const [currentScannedMeal, setCurrentScannedMeal] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [latency, setLatency] = useState('14ms');
  const [flashActive, setFlashActive] = useState(false);
  const [telemetryText, setTelemetryText] = useState('SCANNER_V4.2 READY');
  const [telemetryDetail, setTelemetryDetail] = useState('FOV: 78° | TILT: 12.4°');
  const [isSimulated, setIsSimulated] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize and load latest scan
  useEffect(() => {
    async function init() {
      try {
        const historyRes = await fetch('/api/scanner/history', { headers: authHeaders });
        if (historyRes.ok) {
          const meals = await historyRes.json();
          if (meals.length > 0) {
            setCurrentScannedMeal(meals[meals.length - 1]);
          }
        }
      } catch (err) {
        showToast('Scanner diagnostics offline', 'error');
      }
    }
    init();
    return () => stopCameraStream();
  }, [authHeaders]);

  const stopCameraStream = () => {
    if (streamRef.current && streamRef.current !== 'simulated') {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setIsSimulated(false);
      setTelemetryText('LENS PROTOCOL ACTIVE');
      showToast('CAMERA FEED SYNCED');
    } catch (err) {
      console.warn('Webcam stream access failed:', err);
      showToast('SIMULATING CAMERA PROTOCOL');
      setIsCameraActive(true);
      setIsSimulated(true);
      setTelemetryText('LENS SIMULATOR ACTIVE');
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCameraStream();
      setTelemetryText('SCANNER_V4.2 READY');
    } else {
      startCamera();
    }
  };

  const handleCapture = () => {
    // 1. Flash Overlay
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);

    let dataUrl = null;
    if (isCameraActive && !isSimulated && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL('image/jpeg');
    }

    stopCameraStream();
    setTelemetryText('SCANNER_V4.2 READY');

    if (dataUrl) {
      sendBase64ToScan(dataUrl);
    } else {
      // Simulated camera freeze fallback
      uploadFakeMeal();
    }
  };

  const sendBase64ToScan = async (base64Data) => {
    setIsScanning(true);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ imageBase64: base64Data }),
      });
      const data = await res.json();
      setLatency(`${Date.now() - startTime}ms`);
      setIsScanning(false);

      if (res.ok) {
        setCurrentScannedMeal(data.meal);
        if (data.xpGained > 0) {
          showToast(`+${data.xpGained} XP GAINED`, 'success');
        }
      } else {
        showToast(data.error || 'Scan failed', 'error');
      }
    } catch (err) {
      setIsScanning(false);
      showToast('Connection uplink failed', 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      sendBase64ToScan(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadFakeMeal = async () => {
    setIsScanning(true);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ imageBase64: '' }), // Empty sends simulated data
      });
      const data = await res.json();
      setLatency(`${Date.now() - startTime}ms`);
      setIsScanning(false);

      if (res.ok) {
        setCurrentScannedMeal(data.meal);
        if (data.xpGained > 0) {
          showToast(`+${data.xpGained} XP GAINED`, 'success');
        }
      }
    } catch (err) {
      setIsScanning(false);
      showToast('Offline simulation activated');
    }
  };

  const logScannedMeal = async () => {
    if (!currentScannedMeal) {
      showToast('No active meal scanned', 'error');
      return;
    }
    try {
      const res = await fetch('/api/habits/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ dietCompleted: true }),
      });
      if (res.ok) {
        showToast('MEAL LOGGED SUCCESSFULLY');
        setTimeout(() => onNavigate('dashboard'), 1000);
      } else {
        showToast('Failed to log meal', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  // Math variables
  const healthScore = currentScannedMeal
    ? Math.min(100, Math.round(55 + (currentScannedMeal.protein / (currentScannedMeal.calories || 1)) * 350))
    : 85;

  return (
    <div className="scroll-area flex-grow w-full select-none bg-black relative pb-[96px]">
      {/* Immersive Viewfinder */}
      <section className="relative w-full h-[280px] bg-black overflow-hidden border-b border-white/10 shrink-0">
        <div className="absolute inset-0 opacity-20 hud-grid z-0"></div>

        {/* Shutter Flash */}
        {flashActive && <div className="absolute inset-0 bg-white z-[60] animate-pulse"></div>}

        {/* Viewfinder backgrounds */}
        {!isCameraActive ? (
          <div 
            className="w-full h-full bg-cover bg-center opacity-70"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC570yR53ff5KKWtLpyUszqFIUSfo8eFg6m8a6CFNY40f-Lj5sFLXZoUdp85yMHHEgWdoFA2iKirEhchAl-noX4FGEe3rgujHHIdlbB6PNcyJpahvJ6W6d9K9gQ6RaM8nPmPAqc5aGrxCrUBL1xS5n5-OtEOjJNcaV7MZWVFjXRteUY0WBCMDlrUk5l-jPDanXy5SzOf1-axCQgCjQ8hpoW4I2RQXZrtylu9RV9BIFT-9QgHhi3rNerEEOc8lL3TaQ2io77mWP10g')`
            }}
          />
        ) : isSimulated ? (
          <div 
            className="w-full h-full bg-cover bg-center brightness-125 contrast-125 opacity-80"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC570yR53ff5KKWtLpyUszqFIUSfo8eFg6m8a6CFNY40f-Lj5sFLXZoUdp85yMHHEgWdoFA2iKirEhchAl-noX4FGEe3rgujHHIdlbB6PNcyJpahvJ6W6d9K9gQ6RaM8nPmPAqc5aGrxCrUBL1xS5n5-OtEOjJNcaV7MZWVFjXRteUY0WBCMDlrUk5l-jPDanXy5SzOf1-axCQgCjQ8hpoW4I2RQXZrtylu9RV9BIFT-9QgHhi3rNerEEOc8lL3TaQ2io77mWP10g')`
            }}
          />
        ) : (
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover z-10" autoPlay playsInline></video>
        )}

        <canvas ref={canvasRef} className="hidden"></canvas>

        {/* Bounding box animation */}
        {currentScannedMeal && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute w-full h-[1px] bg-primary/30 top-1/2 -translate-y-1/2 animate-bounce"></div>
            <div className="absolute top-[25%] left-[20%] w-[45%] h-[40%] border border-primary/40 rounded-lg animate-pulse-border">
              <div className="absolute -top-5 left-0 bg-primary text-black px-1 py-0.5 font-label-caps text-[8px] rounded">
                {currentScannedMeal.name.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Telemetry Info */}
        <div className="absolute bottom-3 left-4 font-mono text-primary/70 text-[8px] flex flex-col gap-0.5 z-20">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
            <span>{telemetryText}</span>
          </div>
          <div>FOV: 78° | TILT: 12.4°</div>
        </div>

        {/* Control buttons */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        <div className="absolute bottom-3 right-4 z-30 flex items-center gap-xs">
          {isCameraActive && (
            <button 
              onClick={handleCapture}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-transform"
              title="Capture Frame"
            >
              <span className="material-symbols-outlined text-sm font-bold">circle</span>
            </button>
          )}
          <button 
            onClick={toggleCamera}
            className="w-8 h-8 rounded-full bg-primary/10 border border-primary text-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">
              {isCameraActive ? 'close' : 'photo_camera'}
            </span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-full bg-primary/10 border border-primary text-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
          </button>
        </div>

        {/* Analyzing overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-xs">
            <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
            <span className="font-label-caps text-[9px] text-primary tracking-widest animate-pulse">ANALYZING MACROS...</span>
          </div>
        )}
      </section>

      {/* Details Section */}
      <section className="px-gutter pt-sm space-y-md">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display font-bold text-sm text-white">
              {currentScannedMeal ? currentScannedMeal.name : 'Nutrition DNA'}
            </h2>
            <p className="text-[10px] text-on-surface-variant">
              {currentScannedMeal ? currentScannedMeal.description : 'Log food to synthesize nutritional biometrics'}
            </p>
          </div>
        </div>

        {/* Health Score */}
        <div className="glass-card p-sm rounded-xl flex items-center justify-between border border-white/10 shadow-[0_0_20px_rgba(57,255,20,0.02)]">
          <div className="flex flex-col">
            <span className="font-label-caps text-on-surface-variant text-[8px] tracking-widest">DIET RATING</span>
            <div className="flex items-baseline gap-xs">
              <span className="font-display font-extrabold text-2xl text-primary">{healthScore}</span>
              <span className="text-on-surface-variant font-mono text-[10px]">/100</span>
            </div>
            <span className="text-[8px] text-primary mt-1 font-medium bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {healthScore >= 80 ? 'EXCELLENT FUEL' : 'BALANCED PROTOCOL'}
            </span>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"></path>
              <path 
                className="transition-all duration-1000 ease-out" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="#39FF14" 
                strokeDasharray={`${healthScore}, 100`} 
                strokeWidth="3"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-md animate-pulse">bolt</span>
            </div>
          </div>
        </div>

        {/* Macro breakdown */}
        <div className="grid grid-cols-2 gap-sm">
          <div className="glass-card p-xs rounded-xl border border-white/5 space-y-1">
            <span className="font-label-caps text-[8px] text-on-surface-variant">CALORIES</span>
            <div className="flex items-baseline gap-xs">
              <span className="font-display font-bold text-white text-sm">
                {currentScannedMeal ? currentScannedMeal.calories : 0}
              </span>
              <span className="text-[8px] text-on-surface-variant">kcal</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${currentScannedMeal ? Math.min(100, (currentScannedMeal.calories / 1000) * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-xs rounded-xl border border-primary/20 space-y-1">
            <span className="font-label-caps text-[8px] text-primary">PROTEIN</span>
            <div className="flex items-baseline gap-xs">
              <span className="font-display font-bold text-primary text-sm">
                {currentScannedMeal ? currentScannedMeal.protein : 0}
              </span>
              <span className="text-[8px] text-primary/70">g</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${currentScannedMeal ? Math.min(100, (currentScannedMeal.protein / 60) * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-xs rounded-xl border border-white/5 space-y-1">
            <span className="font-label-caps text-[8px] text-on-surface-variant">CARBS</span>
            <div className="flex items-baseline gap-xs">
              <span className="font-display font-bold text-white text-sm">
                {currentScannedMeal ? currentScannedMeal.carbs : 0}
              </span>
              <span className="text-[8px] text-on-surface-variant">g</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-on-surface-variant h-full rounded-full opacity-60" 
                style={{ width: `${currentScannedMeal ? Math.min(100, (currentScannedMeal.carbs / 100) * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-xs rounded-xl border border-white/5 space-y-1">
            <span className="font-label-caps text-[8px] text-on-surface-variant">FATS</span>
            <div className="flex items-baseline gap-xs">
              <span className="font-display font-bold text-white text-sm">
                {currentScannedMeal ? currentScannedMeal.fat : 0}
              </span>
              <span className="text-[8px] text-on-surface-variant">g</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-on-surface-variant h-full rounded-full opacity-40" 
                style={{ width: `${currentScannedMeal ? Math.min(100, (currentScannedMeal.fat / 40) * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* CTA Log to meal plan */}
        <button 
          onClick={logScannedMeal}
          disabled={!currentScannedMeal}
          className="w-full bg-primary text-black py-sm rounded-xl font-bold text-xs flex items-center justify-center gap-xs active:scale-95 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(57,255,20,0.2)]"
        >
          <span>LOG TO MEAL PLAN</span>
          <span className="material-symbols-outlined text-sm font-bold">add_task</span>
        </button>

        {/* System telemetry logs */}
        <div className="opacity-40 pt-sm">
          <div className="flex flex-col gap-0.5 font-mono text-[8px] text-on-surface-variant">
            <div className="flex justify-between">
              <span>AI_ENGINE_STATE:</span>
              <span className="text-primary">EXECUTION_READY</span>
            </div>
            <div className="flex justify-between">
              <span>SERVER_LATENCY:</span>
              <span>{latency}</span>
            </div>
            <div className="flex justify-between">
              <span>FIRMWARE:</span>
              <span>FG_SCAN_OS_v1.0.8</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
