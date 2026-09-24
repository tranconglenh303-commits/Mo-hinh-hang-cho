import React, { useState } from 'react';
import { calculateOptimalServers } from '../utils/mathFormulas';
import { MathView } from './MathView';
import { Award, LineChart as ChartLineIcon, RotateCcw } from 'lucide-react';
import { CostMultiLineChart, CostDataPoint } from './CostMultiLineChart';

export const EconomicOptimization: React.FC = () => {
  // Default values matching the standard queue benchmark:
  // lambda = 30, mu = 12, costService = 100 (x1000 = 100k đ/h), costWait = 150 (x1000 = 150k đ/h)
  const [lambda, setLambda] = useState<number>(30);
  const [mu, setMu] = useState<number>(12);
  const [costService, setCostService] = useState<number>(100);
  const [costWait, setCostWait] = useState<number>(150);
  const [selectedServer, setSelectedServer] = useState<number>(4);

  // Calculate servers from c = 3 up to 8
  const rawResults = calculateOptimalServers(lambda, mu, costService, costWait, 8);
  // Ensure we filter c from 3 to 8 (or min capacity needed)
  const results = rawResults.filter((r) => r.servers >= 3 && r.servers <= 8);
  const effectiveResults = results.length > 0 ? results : rawResults;
  const optimalResult = effectiveResults.find((r) => r.isOptimal) || effectiveResults[0];

  // Convert to CostDataPoint array in VNĐ
  const chartData: CostDataPoint[] = effectiveResults.map((r) => ({
    c: r.servers,
    serviceCost: Math.round(r.costService * 1000),
    waitingCost: Math.round(r.costWaiting * 1000),
    totalCost: Math.round(r.totalCost * 1000),
    utilization: r.utilization,
    Lq: r.Lq,
    Wq: r.Wq,
    isOptimal: r.isOptimal,
  }));

  const resetToStandardBenchmark = () => {
    setLambda(30);
    setMu(12);
    setCostService(100);
    setCostWait(150);
    setSelectedServer(4);
  };

  const isDefaultBenchmark = lambda === 30 && mu === 12 && costService === 100 && costWait === 150;

  return (
    <section id="economics" className="py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-mono text-cyan-400 tracking-wider">03. BÀI TOÁN TỐI ƯU HÓA KINH TẾ</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Cân Bằng Chi Phí Dịch Vụ & Chi Phí Chờ Đợi
          </h2>
        </div>
        <div className="text-xs text-slate-400 max-w-md">
          Hàm mục tiêu: <MathView formula="\min TC(c) = C_s \cdot c + C_w \cdot L" /> để tìm số quầy <MathView formula="c^*" /> mang lại lợi ích tài chính cao nhất.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Tham Số Kinh Tế & Vận Hành</h3>
              {!isDefaultBenchmark && (
                <button
                  onClick={resetToStandardBenchmark}
                  className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  title="Khôi phục kịch bản chuẩn (c = 3 → 8)"
                >
                  <RotateCcw className="w-3 h-3" />
                  Mặc định
                </button>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Khách đến (λ):</span>
                <span className="font-mono text-cyan-300 font-bold">{lambda} khách/giờ</span>
              </div>
              <input
                type="range"
                min={15}
                max={45}
                step={1}
                value={lambda}
                onChange={(e) => setLambda(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Năng lực phục vụ (μ/quầy):</span>
                <span className="font-mono text-emerald-300 font-bold">{mu} khách/giờ</span>
              </div>
              <input
                type="range"
                min={8}
                max={20}
                step={1}
                value={mu}
                onChange={(e) => setMu(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Chi phí mở 1 quầy (Cs):</span>
                <span className="font-mono text-purple-300 font-bold">
                  {new Intl.NumberFormat('vi-VN').format(costService * 1000)} đ/h
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={200}
                step={10}
                value={costService}
                onChange={(e) => setCostService(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Chi phí khách chờ (Cw):</span>
                <span className="font-mono text-amber-300 font-bold">
                  {new Intl.NumberFormat('vi-VN').format(costWait * 1000)} đ/h
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={300}
                step={10}
                value={costWait}
                onChange={(e) => setCostWait(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {optimalResult && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 p-3 mt-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <Award className="w-4 h-4" />
                <span>ĐIỂM TỐI ƯU KINH TẾ (SWEET SPOT)</span>
              </div>
              <div className="text-sm text-slate-200">
                Mở chính xác{' '}
                <strong className="text-emerald-300 font-mono text-base">
                  {optimalResult.servers} quầy
                </strong>{' '}
                sẽ đạt Tổng chi phí nhỏ nhất:{' '}
                <strong className="text-white font-mono">
                  {new Intl.NumberFormat('vi-VN').format(Math.round(optimalResult.totalCost * 1000))} đ/h
                </strong>.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Line Cost Chart */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ChartLineIcon className="w-4 h-4 text-cyan-400" />
                <span>Biểu Đồ So Sánh Chi Phí Theo Số Lượng Quầy Phục Vụ (c)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Rê chuột lên điểm bất kỳ để xem phân rã
              </span>
            </div>

            {/* The Multi-Line Chart */}
            <CostMultiLineChart
              data={chartData}
              activeServer={selectedServer}
              onSelectServer={(c) => setSelectedServer(c)}
            />

            {/* Compact Table View of all c data points */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-2 px-3">Quầy (c)</th>
                    <th className="py-2 px-3 text-[#9C27B0]">Cs · c (Dịch vụ)</th>
                    <th className="py-2 px-3 text-[#FF9800]">Cw · L (Chờ đợi)</th>
                    <th className="py-2 px-3 text-[#00BCD4]">Tổng TC (đ/h)</th>
                    <th className="py-2 px-3 text-slate-300">Tải (ρ)</th>
                    <th className="py-2 px-3 text-slate-300">Lq</th>
                    <th className="py-2 px-3 text-slate-300">Wq</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {chartData.map((d) => (
                    <tr
                      key={d.c}
                      onClick={() => setSelectedServer(d.c)}
                      className={`cursor-pointer transition-colors ${
                        d.isOptimal
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/15 font-semibold text-white'
                          : selectedServer === d.c
                          ? 'bg-cyan-500/10 text-cyan-200'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 flex items-center gap-1.5">
                        <span>c = {d.c}</span>
                        {d.isOptimal && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/40">
                            TỐI ƯU
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-purple-300">
                        {new Intl.NumberFormat('vi-VN').format(d.serviceCost)} đ
                      </td>
                      <td className="py-2 px-3 text-amber-300">
                        {new Intl.NumberFormat('vi-VN').format(d.waitingCost)} đ
                      </td>
                      <td className="py-2 px-3 font-bold text-cyan-300">
                        {new Intl.NumberFormat('vi-VN').format(d.totalCost)} đ
                      </td>
                      <td className="py-2 px-3 text-slate-400">{(d.utilization * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-slate-400">{d.Lq.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-400">{(d.Wq * 60).toFixed(1)}p</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
