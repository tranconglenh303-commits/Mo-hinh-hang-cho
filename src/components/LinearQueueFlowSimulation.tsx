import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, UserPlus, Zap } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'arriving' | 'waiting' | 'in_service' | 'departing';
  serverIndex?: number;
  serviceTotalSec: number;
  serviceRemainingSec: number;
  radius: number;
  color: string;
}

export const LinearQueueFlowSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation Parameters
  const [lambda, setLambda] = useState<number>(12); // arrivals per minute
  const [mu, setMu] = useState<number>(15); // service rate per server per minute
  const [c, setC] = useState<number>(1); // 1 or 2 or 3 servers
  const [speed, setSpeed] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Live Counters matching user reference style
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [inServiceCount, setInServiceCount] = useState<number>(0);
  const [servedCount, setServedCount] = useState<number>(0);
  const [, setTotalArrivals] = useState<number>(0);

  // References for animation state
  const particlesRef = useRef<Particle[]>([]);
  const nextArrivalTimerRef = useRef<number>(generateInterarrival(12));
  const particleIdCounter = useRef<number>(1);
  const lastTimestampRef = useRef<number | null>(null);

  function generateInterarrival(ratePerMin: number): number {
    const ratePerSec = ratePerMin / 60;
    const u = Math.max(0.0001, Math.random());
    return -Math.log(u) / ratePerSec;
  }

  function generateServiceTime(ratePerMin: number): number {
    const ratePerSec = ratePerMin / 60;
    const u = Math.max(0.0001, Math.random());
    return -Math.log(u) / ratePerSec;
  }

  // Add a customer immediately
  const handleAddCustomer = useCallback(() => {
    const id = particleIdCounter.current++;
    const canvas = canvasRef.current;
    const height = canvas ? canvas.clientHeight : 260;
    const centerY = height / 2;

    const servTime = generateServiceTime(mu);
    const newP: Particle = {
      id,
      x: 10,
      y: centerY,
      targetX: 60,
      targetY: centerY,
      state: 'arriving',
      serviceTotalSec: servTime,
      serviceRemainingSec: servTime,
      radius: 12,
      color: '#3b82f6', // blue (Khách đến)
    };

    particlesRef.current.push(newP);
    setTotalArrivals((prev) => prev + 1);
  }, [mu]);

  // Reset simulation
  const handleReset = () => {
    particlesRef.current = [];
    setWaitingCount(0);
    setInServiceCount(0);
    setServedCount(0);
    setTotalArrivals(0);
    particleIdCounter.current = 1;
    nextArrivalTimerRef.current = generateInterarrival(lambda);
  };

  // Main 60FPS Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const elapsedMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Delta seconds scaled by speed
      const dt = Math.min(0.1, (elapsedMs / 1000) * (isRunning ? speed : 0));

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // System layout coordinates
      const serverBoxSize = 54;
      const serverX = width * 0.56;
      const centerY = height / 2;

      // Server vertical offsets for c = 1, 2, or 3
      const serverPositions = [];
      if (c === 1) {
        serverPositions.push({ x: serverX, y: centerY - serverBoxSize / 2 });
      } else if (c === 2) {
        const gap = 20;
        serverPositions.push({ x: serverX, y: centerY - serverBoxSize - gap / 2 });
        serverPositions.push({ x: serverX, y: centerY + gap / 2 });
      } else {
        const gap = 16;
        serverPositions.push({ x: serverX, y: centerY - (serverBoxSize * 1.5 + gap) });
        serverPositions.push({ x: serverX, y: centerY - serverBoxSize / 2 });
        serverPositions.push({ x: serverX, y: centerY + serverBoxSize / 2 + gap });
      }

      const queueLineEndX = serverX - 25;
      const queueLineStartX = width * 0.16;

      // 1. Spawning new arrivals
      if (isRunning) {
        nextArrivalTimerRef.current -= dt;
        if (nextArrivalTimerRef.current <= 0) {
          const id = particleIdCounter.current++;
          const servTime = generateServiceTime(mu);
          particlesRef.current.push({
            id,
            x: 0,
            y: centerY,
            targetX: 60,
            targetY: centerY,
            state: 'arriving',
            serviceTotalSec: servTime,
            serviceRemainingSec: servTime,
            radius: 11,
            color: '#3b82f6', // blue
          });
          setTotalArrivals((prev) => prev + 1);
          nextArrivalTimerRef.current = generateInterarrival(lambda);
        }
      }

      // 2. Logic Update: Partition particles
      const particles = particlesRef.current;
      const serverSlots: (Particle | null)[] = new Array(c).fill(null);

      // Find particles currently in service
      particles.forEach((p) => {
        if (p.state === 'in_service' && p.serverIndex !== undefined && p.serverIndex < c) {
          serverSlots[p.serverIndex] = p;
        }
      });

      // Update in_service particles progress
      particles.forEach((p) => {
        if (p.state === 'in_service') {
          p.serviceRemainingSec -= dt;
          if (p.serviceRemainingSec <= 0) {
            p.state = 'departing';
            p.color = '#94a3b8'; // grey / white
            setServedCount((prev) => prev + 1);
          }
        }
      });

      // Gather waiting / arriving particles
      const waitingParticles = particles.filter(
        (p) => p.state === 'waiting' || p.state === 'arriving'
      );

      // Check if any server slot is free, assign the front waiting particle
      for (let sIdx = 0; sIdx < c; sIdx++) {
        if (!serverSlots[sIdx] && waitingParticles.length > 0) {
          const nextP = waitingParticles.shift()!;
          nextP.state = 'in_service';
          nextP.serverIndex = sIdx;
          nextP.color = '#10b981'; // green (Đang phục vụ)
          const sPos = serverPositions[sIdx];
          nextP.targetX = sPos.x + serverBoxSize / 2;
          nextP.targetY = sPos.y + serverBoxSize / 2;
          serverSlots[sIdx] = nextP;
        }
      }

      // Arrange remaining waiting particles along queue line (from right to left)
      const particleSpacing = 28;
      waitingParticles.forEach((p, index) => {
        p.state = 'waiting';
        p.color = '#a855f7'; // purple (Đang chờ)
        const targetX = queueLineEndX - index * particleSpacing;
        p.targetX = Math.max(queueLineStartX - 40, targetX);
        p.targetY = centerY;
      });

      // Update physics positions (smooth lerp)
      particles.forEach((p) => {
        if (p.state === 'departing') {
          p.x += 160 * dt;
        } else {
          const lerpSpeed = 6;
          p.x += (p.targetX - p.x) * Math.min(1, dt * lerpSpeed);
          p.y += (p.targetY - p.y) * Math.min(1, dt * lerpSpeed);
        }
      });

      // Filter out particles that have left the screen
      particlesRef.current = particles.filter((p) => p.x < width + 50);

      // Update counters for UI
      const currentWaiting = particlesRef.current.filter((p) => p.state === 'waiting').length;
      const currentInService = particlesRef.current.filter((p) => p.state === 'in_service').length;
      setWaitingCount(currentWaiting);
      setInServiceCount(currentInService);

      // 3. DRAW CANVAS SCENE
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0, 0, width, height);

      // Entrance guideline
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, centerY);
      ctx.lineTo(queueLineStartX, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Main Queue Line ("Hàng chờ")
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(queueLineStartX, centerY + 14);
      ctx.lineTo(queueLineEndX, centerY + 14);
      ctx.stroke();

      // Label: "Hàng chờ"
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Hàng chờ', queueLineStartX + 10, centerY + 34);

      // Server Boxes ("Server")
      serverPositions.forEach((sPos, idx) => {
        const isBusy = !!serverSlots[idx];

        ctx.fillStyle = isBusy ? '#1e293b' : '#0f172a';
        ctx.strokeStyle = isBusy ? '#10b981' : '#334155';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(sPos.x, sPos.y, serverBoxSize, serverBoxSize, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isBusy ? '#34d399' : '#94a3b8';
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        const label = c === 1 ? 'Server' : `Server ${idx + 1}`;
        ctx.fillText(label, sPos.x + serverBoxSize / 2, sPos.y - 10);

        if (isBusy && serverSlots[idx]) {
          const sCust = serverSlots[idx]!;
          const pct = Math.max(0, Math.min(1, 1 - sCust.serviceRemainingSec / sCust.serviceTotalSec));
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            sPos.x + serverBoxSize / 2,
            sPos.y + serverBoxSize / 2,
            serverBoxSize / 2 + 5,
            -Math.PI / 2,
            -Math.PI / 2 + pct * 2 * Math.PI
          );
          ctx.stroke();
        }
      });

      // Departure Line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(serverX + serverBoxSize + 10, centerY);
      ctx.lineTo(width - 10, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Draw Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.id.toString(), p.x, p.y);
        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [c, isRunning, lambda, mu, speed]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rho = lambda / (c * mu);
  const isOverloaded = rho >= 1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur">
      <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-950/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>MÔ PHỎNG DÒNG CHẢY HÀNG CHỜ TUYẾN TÍNH (LINEAR PIPELINE)</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mt-0.5">
              Mô Phỏng Trực Quan Quá Trình Di Chuyển Của Khách Hàng
            </h3>
          </div>

          <div className="flex items-center gap-6 sm:gap-10 font-mono">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-sans">Đang chờ:</span>
              <span className="text-2xl md:text-3xl font-extrabold text-purple-400">
                {waitingCount}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-sans">Đang phục vụ:</span>
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-400">
                {inServiceCount}/{c}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-sans">Đã phục vụ:</span>
              <span className="text-2xl md:text-3xl font-extrabold text-cyan-400">
                {servedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[260px] md:h-[300px] bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
        <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 px-2 py-1 rounded-md">
          Tốc độ: <span className="text-cyan-300 font-bold">{speed}x</span> · Trạng thái: {isRunning ? '🟢 Đang chạy' : '⏸ Đã dừng'}
        </div>
        {isOverloaded && (
          <div className="absolute top-3 right-3 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs px-3 py-1 rounded-md font-semibold animate-pulse">
            ⚠️ Tắc nghẽn: ρ = {(rho * 100).toFixed(0)}% ≥ 100%
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
            <span className="text-slate-300 font-medium">Khách đến</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/40" />
            <span className="text-slate-300 font-medium">Đang chờ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
            <span className="text-slate-300 font-medium">Đang phục vụ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-400" />
            <span className="text-slate-400">Đã phục vụ (rời đi)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isRunning
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Tạm dừng' : 'Chạy tiếp'}</span>
          </button>

          <button
            onClick={handleAddCustomer}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Thêm khách</span>
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  speed === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 md:px-6 bg-slate-950/60 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Tốc độ đến (λ):</span>
            <span className="font-mono text-cyan-300 font-bold">{lambda} khách/phút</span>
          </div>
          <input
            type="range"
            min={4}
            max={30}
            step={1}
            value={lambda}
            onChange={(e) => setLambda(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Tốc độ quầy (μ):</span>
            <span className="font-mono text-emerald-300 font-bold">{mu} khách/phút</span>
          </div>
          <input
            type="range"
            min={5}
            max={35}
            step={1}
            value={mu}
            onChange={(e) => setMu(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Số lượng Server (c):</span>
            <span className="font-mono text-purple-300 font-bold">{c} quầy</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setC(num)}
                className={`flex-1 py-1 rounded border text-xs font-mono font-bold transition-colors cursor-pointer ${
                  c === num
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                c = {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
