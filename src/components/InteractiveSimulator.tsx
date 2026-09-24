import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Customer, ServerChannel, SimulatorConfig, QueueDiscipline, ServiceDistribution } from '../types/queue';
import { calculateMMC, calculateMM1, calculateMM1K } from '../utils/mathFormulas';
import { Play, Pause, RotateCcw, UserPlus, FastForward, AlertTriangle, CheckCircle2, Clock, Users, ShieldAlert, Cpu } from 'lucide-react';
import { MathView } from './MathView';

const AVATAR_EMOJIS = ['👨‍💼', '👩‍💻', '👨‍🎓', '👩‍⚕️', '🧑‍🎨', '👨‍🚀', '👩‍🔬', '🧑‍🌾'];
const AVATAR_COLORS = [
  'bg-blue-600/30 border-blue-500 text-blue-300',
  'bg-purple-600/30 border-purple-500 text-purple-300',
  'bg-emerald-600/30 border-emerald-500 text-emerald-300',
  'bg-amber-600/30 border-amber-500 text-amber-300',
  'bg-rose-600/30 border-rose-500 text-rose-300',
  'bg-cyan-600/30 border-cyan-500 text-cyan-300',
];

export const InteractiveSimulator: React.FC = () => {
  // Configuration
  const [config, setConfig] = useState<SimulatorConfig>({
    lambda: 6, // 6 customers/minute = 1 every 10 seconds
    mu: 4, // 4 customers/minute per server = avg 15 seconds service
    c: 2, // 2 servers
    capacity: null, // infinite
    discipline: 'FIFO',
    serviceDistribution: 'exponential',
    balkingThreshold: 12,
    speed: 1,
  });

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);

  // Entities state
  const [queue, setQueue] = useState<Customer[]>([]);
  const [servers, setServers] = useState<ServerChannel[]>([
    { id: 1, name: 'Quầy 1', isBusy: false, busyRemainingSeconds: 0, totalServiceDuration: 0, totalCustomersServed: 0 },
    { id: 2, name: 'Quầy 2', isBusy: false, busyRemainingSeconds: 0, totalServiceDuration: 0, totalCustomersServed: 0 },
  ]);
  const [completedCustomers, setCompletedCustomers] = useState<Customer[]>([]);
  const [balkedCount, setBalkedCount] = useState<number>(0);
  const [totalArrivals, setTotalArrivals] = useState<number>(0);

  const customerIdCounter = useRef<number>(1);
  const nextArrivalInSeconds = useRef<number>(generateInterarrivalTime(config.lambda));

  // Sync server count when c changes
  useEffect(() => {
    setServers((prev) => {
      const next: ServerChannel[] = [];
      for (let i = 1; i <= config.c; i++) {
        const existing = prev.find((s) => s.id === i);
        if (existing) {
          next.push(existing);
        } else {
          next.push({
            id: i,
            name: `Quầy ${i}`,
            isBusy: false,
            busyRemainingSeconds: 0,
            totalServiceDuration: 0,
            totalCustomersServed: 0,
          });
        }
      }
      return next;
    });
  }, [config.c]);

  // Helper generators
  function generateInterarrivalTime(lambda: number): number {
    // lambda is per minute, convert to seconds
    const ratePerSec = lambda / 60;
    // Exponential distribution: -ln(U) / rate
    const u = Math.max(0.0001, Math.random());
    return -Math.log(u) / ratePerSec;
  }

  function generateServiceTime(mu: number, dist: ServiceDistribution): number {
    const ratePerSec = mu / 60;
    const meanSec = 1 / ratePerSec;
    if (dist === 'deterministic') {
      return meanSec;
    } else if (dist === 'erlang') {
      // Erlang-2: sum of two exponentials with mean / 2
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.max(0.0001, Math.random());
      return -0.5 * meanSec * (Math.log(u1) + Math.log(u2));
    } else {
      // Exponential
      const u = Math.max(0.0001, Math.random());
      return -Math.log(u) * meanSec;
    }
  }

  // Inject a single customer
  const spawnCustomer = useCallback((priority = 1) => {
    const id = customerIdCounter.current++;
    const serviceSec = generateServiceTime(config.mu, config.serviceDistribution);
    const avatarIndex = id % AVATAR_EMOJIS.length;
    const colorIndex = id % AVATAR_COLORS.length;

    const newCustomer: Customer = {
      id,
      name: `Khách #${id}`,
      arriveTime: simTime,
      serviceTimeNeeded: serviceSec,
      waitTime: 0,
      priority,
      status: 'waiting',
      avatar: AVATAR_EMOJIS[avatarIndex],
      color: AVATAR_COLORS[colorIndex],
    };

    setTotalArrivals((prev) => prev + 1);

    // Check capacity or balking
    const currentQueueLen = queue.length;
    const isFull = config.capacity !== null && currentQueueLen >= config.capacity;
    const isBalked = config.balkingThreshold > 0 && currentQueueLen >= config.balkingThreshold && Math.random() < 0.6;

    if (isFull || isBalked) {
      setBalkedCount((prev) => prev + 1);
      return;
    }

    setQueue((prevQueue) => {
      const next = [...prevQueue, newCustomer];
      if (config.discipline === 'Priority') {
        // Higher priority first, then earlier arriveTime
        return next.sort((a, b) => b.priority - a.priority || a.arriveTime - b.arriveTime);
      } else if (config.discipline === 'LIFO') {
        return [newCustomer, ...prevQueue];
      }
      return next;
    });
  }, [config.capacity, config.balkingThreshold, config.discipline, config.mu, config.serviceDistribution, queue.length, simTime]);

  // Main simulation tick loop
  useEffect(() => {
    if (!isRunning) return;

    const tickIntervalMs = 100; // 10 ticks per second
    const interval = setInterval(() => {
      const deltaSec = (tickIntervalMs / 1000) * config.speed;

      setSimTime((prevTime) => {
        const newSimTime = prevTime + deltaSec;

        // 1. Process customer arrival timer
        nextArrivalInSeconds.current -= deltaSec;
        if (nextArrivalInSeconds.current <= 0) {
          spawnCustomer(Math.random() < 0.2 ? 2 : 1);
          nextArrivalInSeconds.current = generateInterarrivalTime(config.lambda);
        }

        // 2. Update servers and customers in service
        setServers((prevServers) => {
          let updatedQueue = [...queue];
          const newCompleted: Customer[] = [];

          const updatedServers = prevServers.map((server) => {
            if (server.isBusy) {
              const remaining = server.busyRemainingSeconds - deltaSec;
              if (remaining <= 0) {
                // Customer finished
                const finishedCustId = server.currentCustomerId;
                if (finishedCustId) {
                  newCompleted.push({
                    id: finishedCustId,
                    name: `Khách #${finishedCustId}`,
                    arriveTime: 0,
                    waitTime: 0,
                    serviceTimeNeeded: server.totalServiceDuration,
                    status: 'completed',
                    priority: 1,
                    avatar: '👤',
                    color: '',
                  });
                }

                return {
                  ...server,
                  isBusy: false,
                  currentCustomerId: undefined,
                  busyRemainingSeconds: 0,
                  totalCustomersServed: server.totalCustomersServed + 1,
                };
              } else {
                return {
                  ...server,
                  busyRemainingSeconds: remaining,
                };
              }
            }
            return server;
          });

          if (newCompleted.length > 0) {
            setCompletedCustomers((prevComp) => [...newCompleted, ...prevComp].slice(0, 50));
          }

          // 3. Assign idle servers from queue
          const finalServers = updatedServers.map((server) => {
            if (!server.isBusy && updatedQueue.length > 0) {
              const nextCustomer = updatedQueue[0];
              updatedQueue = updatedQueue.slice(1);

              return {
                ...server,
                isBusy: true,
                currentCustomerId: nextCustomer.id,
                busyRemainingSeconds: nextCustomer.serviceTimeNeeded,
                totalServiceDuration: nextCustomer.serviceTimeNeeded,
              };
            }
            return server;
          });

          // Update wait time for customers remaining in queue
          updatedQueue = updatedQueue.map((cust) => ({
            ...cust,
            waitTime: cust.waitTime + deltaSec,
          }));

          setQueue(updatedQueue);
          return finalServers;
        });

        return newSimTime;
      });
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [isRunning, config.speed, config.lambda, spawnCustomer, queue]);

  // Reset simulator
  const handleReset = () => {
    setQueue([]);
    setServers((prev) =>
      prev.map((s) => ({
        ...s,
        isBusy: false,
        currentCustomerId: undefined,
        busyRemainingSeconds: 0,
        totalCustomersServed: 0,
      }))
    );
    setCompletedCustomers([]);
    setBalkedCount(0);
    setTotalArrivals(0);
    setSimTime(0);
    nextArrivalInSeconds.current = generateInterarrivalTime(config.lambda);
    customerIdCounter.current = 1;
  };

  // Theoretical calculations
  const theoretical = config.capacity !== null
    ? calculateMM1K(config.lambda, config.mu, config.capacity + config.c)
    : config.c === 1
      ? calculateMM1(config.lambda, config.mu)
      : calculateMMC(config.lambda, config.mu, config.c);

  const trafficRho = config.lambda / (config.c * config.mu);
  const isOverloaded = trafficRho >= 1;

  // Real-time simulated metrics
  const activeInService = servers.filter((s) => s.isBusy).length;
  const currentTotalInSystem = queue.length + activeInService;
  const totalCompletedCount = servers.reduce((acc, s) => acc + s.totalCustomersServed, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 backdrop-blur shadow-2xl">
      {/* Title & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-5 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>MÔ PHỎNG THỜI GIAN THỰC (REAL-TIME ENGINE)</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Thời gian chạy: {Math.floor(simTime)}s</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Không Gian Mô Phỏng Vận Hành Hàng Chờ
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Tạm dừng' : 'Tiếp tục chạy'}</span>
          </button>

          <button
            onClick={() => spawnCustomer(1)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-cyan-600/30 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-600/50 transition-colors cursor-pointer"
            title="Thêm 1 khách hàng mới vào hàng đợi ngay lập tức"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+1 Khách thường</span>
          </button>

          <button
            onClick={() => spawnCustomer(2)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-amber-600/30 text-amber-200 border border-amber-500/30 hover:bg-amber-600/50 transition-colors cursor-pointer"
            title="Thêm khách ưu tiên (VIP/Cấp cứu)"
          >
            <span className="font-bold text-amber-300">★</span>
            <span>+1 VIP</span>
          </button>

          {/* Speed switcher */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
            {[0.5, 1, 2, 4].map((sp) => (
              <button
                key={sp}
                onClick={() => setConfig((prev) => ({ ...prev, speed: sp }))}
                className={`px-2 py-1 rounded transition-colors cursor-pointer font-mono ${
                  config.speed === sp
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            title="Khôi phục trạng thái ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Simulation Stage: Flow from Left to Right */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Arena (7 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Traffic intensity alert banner */}
          {isOverloaded && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">CẢNH BÁO NGHẼN MẠNG / QUÁ TẢI:</span> Hệ số sử dụng <MathView formula={`\\rho = ${(trafficRho * 100).toFixed(1)}\\% \\ge 100\\%`} />. Tốc độ đến lớn hơn năng lực phục vụ, hàng đợi sẽ kéo dài vô hạn nếu không tăng quầy!
              </div>
            </div>
          )}

          {/* Flow Container */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-950/90 p-4 md:p-6 overflow-hidden">
            {/* Stage Flow Labels */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold text-slate-300">1. DÒNG ĐẾN (Arrivals)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-300">2. HÀNG ĐỢI ({queue.length} người)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-300">3. TRẠM PHỤC VỤ ({config.c} quầy)</span>
              </div>
            </div>

            {/* Layout Grid: Queue Lane & Servers */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Waiting Queue Lane (7 cols) */}
              <div className="md:col-span-7 bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-slate-400">
                      Quy tắc: <strong className="text-cyan-300">{config.discipline}</strong>
                    </span>
                    <span className="text-slate-400 font-mono">
                      Dung lượng: {config.capacity === null ? 'Vô hạn (∞)' : `Tối đa ${config.capacity}`}
                    </span>
                  </div>

                  {/* Customer Queue Visualizer */}
                  {queue.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
                      <span className="text-3xl mb-2">✨</span>
                      <span>Hàng đang trống — Khách đến được vào phục vụ ngay!</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {queue.map((cust, idx) => (
                        <div
                          key={cust.id}
                          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs shadow-sm transition-all duration-300 ${cust.color} ${
                            cust.priority === 2 ? 'ring-2 ring-amber-400/80' : ''
                          }`}
                        >
                          <span className="text-base">{cust.avatar}</span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 font-mono font-medium">
                              <span>#{cust.id}</span>
                              {cust.priority === 2 && (
                                <span className="text-[10px] text-amber-300 font-bold">VIP</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Chờ: {cust.waitTime.toFixed(0)}s
                            </span>
                          </div>
                          {idx === 0 && (
                            <span className="absolute -top-1.5 -right-1 text-[9px] bg-cyan-400 text-slate-950 font-bold px-1 rounded-sm shadow">
                              Tiếp theo
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Queue status footer */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Khách đến kế tiếp: ~{Math.max(0, nextArrivalInSeconds.current).toFixed(1)}s</span>
                  {balkedCount > 0 && (
                    <span className="text-rose-400">Đã mất {balkedCount} khách do quá tải</span>
                  )}
                </div>
              </div>

              {/* Service Desks (Servers) (5 cols) */}
              <div className="md:col-span-5 flex flex-col gap-2.5">
                {servers.map((server) => {
                  const percentDone = server.isBusy && server.totalServiceDuration > 0
                    ? Math.min(100, Math.max(0, ((server.totalServiceDuration - server.busyRemainingSeconds) / server.totalServiceDuration) * 100))
                    : 0;

                  return (
                    <div
                      key={server.id}
                      className={`p-3.5 rounded-xl border transition-all duration-300 ${
                        server.isBusy
                          ? 'bg-slate-900 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                          : 'bg-slate-950/60 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              server.isBusy ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                            }`}
                          />
                          <span className="font-semibold text-xs text-slate-200">{server.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {server.isBusy ? (
                            <span className="text-emerald-400 font-medium">ĐANG XỬ LÝ</span>
                          ) : (
                            <span className="text-slate-500">RẢNH RỖI</span>
                          )}
                        </span>
                      </div>

                      {server.isBusy ? (
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-300 font-mono mb-1">
                            <span>Khách: #{server.currentCustomerId}</span>
                            <span>Còn lại: {Math.max(0, server.busyRemainingSeconds).toFixed(1)}s</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-150 rounded-full"
                              style={{ width: `${percentDone}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 text-center text-xs text-slate-500 font-mono">
                          Sẵn sàng tiếp nhận khách
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Đã phục vụ: {server.totalCustomersServed}</span>
                        <span>μ = {config.mu}/phút</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Departures Stream Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Đã hoàn tất:{' '}
                  <strong className="text-white font-mono">{totalCompletedCount}</strong> khách
                </span>
                <span className="text-slate-600">·</span>
                <span>
                  Đã đến: <strong className="text-white font-mono">{totalArrivals}</strong> khách
                </span>
              </div>
              <div className="text-slate-400 font-mono">
                Hiệu suất phục vụ thực tế:{' '}
                <span className="text-cyan-300 font-bold">
                  {totalArrivals > 0 ? (((totalCompletedCount) / totalArrivals) * 100).toFixed(1) : 100}%
                </span>
              </div>
            </div>
          </div>

          {/* Metric Comparison Dashboard: Real-time vs Theoretical */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-xs text-slate-400 block mb-1">Hệ số sử dụng (ρ)</span>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {(trafficRho * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {isOverloaded ? 'Cảnh báo quá tải' : 'Trạng thái ổn định'}
              </span>
            </div>

            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-xs text-slate-400 block mb-1">Khách trong hàng (Lq)</span>
              <div className="text-xl font-bold font-mono text-white">
                {queue.length} <span className="text-xs font-normal text-slate-400">hiện tại</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                Lý thuyết: {isOverloaded ? '∞' : theoretical.Lq.toFixed(2)}
              </span>
            </div>

            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-xs text-slate-400 block mb-1">Toàn hệ thống (L)</span>
              <div className="text-xl font-bold font-mono text-white">
                {currentTotalInSystem} <span className="text-xs font-normal text-slate-400">khách</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                Lý thuyết: {isOverloaded ? '∞' : theoretical.L.toFixed(2)}
              </span>
            </div>

            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-xs text-slate-400 block mb-1">Thời gian chờ lý thuyết (Wq)</span>
              <div className="text-xl font-bold font-mono text-amber-300">
                {isOverloaded ? '∞' : `${(theoretical.Wq * 60).toFixed(1)}s`}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                Tổng lưu W: {isOverloaded ? '∞' : `${(theoretical.W * 60).toFixed(1)}s`}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Controls & Parameters Deck (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
              <span>Bảng Điều Khiển Tham Số</span>
              <span className="text-xs font-mono text-cyan-400">M/M/{config.c}</span>
            </h3>

            {/* Slider 1: Lambda (Arrival Rate) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1 font-medium">
                  Tốc độ khách đến (<MathView formula="\lambda" />)
                </span>
                <span className="font-mono text-cyan-300 font-bold">{config.lambda} khách/phút</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={config.lambda}
                onChange={(e) => setConfig((prev) => ({ ...prev, lambda: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 khách/phút</span>
                <span>Tb 1 khách mỗi {(60 / config.lambda).toFixed(1)}s</span>
                <span>20 khách/phút</span>
              </div>
            </div>

            {/* Slider 2: Mu (Service Rate per server) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1 font-medium">
                  Tốc độ phục vụ mỗi quầy (<MathView formula="\mu" />)
                </span>
                <span className="font-mono text-emerald-300 font-bold">{config.mu} khách/phút</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={config.mu}
                onChange={(e) => setConfig((prev) => ({ ...prev, mu: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 khách/phút</span>
                <span>Tb phục vụ {(60 / config.mu).toFixed(1)}s</span>
                <span>15 khách/phút</span>
              </div>
            </div>

            {/* Slider 3: Number of servers (c) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Số quầy phục vụ song song (c)</span>
                <span className="font-mono text-purple-300 font-bold">{config.c} quầy</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setConfig((prev) => ({ ...prev, c: num }))}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                      config.c === num
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    c = {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue Discipline */}
            <div className="mb-4">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Kỷ luật xếp hàng (Discipline)
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['FIFO', 'Priority', 'LIFO'] as QueueDiscipline[]).map((disc) => (
                  <button
                    key={disc}
                    onClick={() => setConfig((prev) => ({ ...prev, discipline: disc }))}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer font-medium ${
                      config.discipline === disc
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {disc === 'FIFO' ? 'FIFO (Vào trước)' : disc === 'Priority' ? 'Ưu tiên VIP' : 'LIFO (Vào sau)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Distribution */}
            <div className="mb-4">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Phân phối thời gian phục vụ
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, serviceDistribution: 'exponential' }))}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    config.serviceDistribution === 'exponential'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 font-medium'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  M (Exponential)
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, serviceDistribution: 'deterministic' }))}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    config.serviceDistribution === 'deterministic'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 font-medium'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  D (Đều cố định)
                </button>
              </div>
            </div>

            {/* Capacity Toggle */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Giới hạn hàng chờ (Buffer Capacity)</span>
                <span className="font-mono text-xs text-slate-400">
                  {config.capacity === null ? 'Không giới hạn' : `K = ${config.capacity}`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, capacity: null }))}
                  className={`py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    config.capacity === null
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-medium'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Vô hạn (∞)
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, capacity: 5 }))}
                  className={`py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    config.capacity === 5
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-medium'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  K = 5
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, capacity: 10 }))}
                  className={`py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    config.capacity === 10
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-medium'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  K = 10
                </button>
              </div>
            </div>
          </div>

          {/* Quick Real-Time Insight Callout */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block mb-1">Quy luật quan sát trực quan:</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>
                Nếu <strong className="text-cyan-300">ρ &lt; 0.7</strong>: Quầy phục vụ thoáng, hàng chờ tan rất nhanh.
              </li>
              <li>
                Nếu <strong className="text-amber-300">0.7 &le; ρ &lt; 1.0</strong>: Hàng chờ bắt đầu tích tụ sóng ngẫu nhiên.
              </li>
              <li>
                Khi chuyển sang <strong className="text-emerald-300">D (Đều cố định)</strong>, độ biến thiên bằng 0, hàng chờ giảm một nửa!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
