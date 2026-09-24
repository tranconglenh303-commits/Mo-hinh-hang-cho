import React, { useState } from 'react';
import { calculateOptimalServers } from '../utils/mathFormulas';
import { MathView } from './MathView';
import { Award, BarChart2 } from 'lucide-react';

export const EconomicOptimization: React.FC = () => {
  const [lambda, setLambda] = useState<number>(30);
  const [mu, setMu] = useState<number>(12);
  const [costService, setCostService] = useState<number>(100);
  const [costWait, setCostWait] = useState<number>(150);

  const results = calculateOptimalServers(lambda, mu, costService, costWait, 8);
  const optimalResult = results.find((r) => r.isOptimal) || results[0];
  const maxTotalCost = Math.max(...results.map((r) => r.totalCost), 1);

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
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Tham Số Kinh Tế & Vận Hành</h3>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Khách đến (λ):</span>
                <span className="font-mono text-cyan-300 font-bold">{lambda} khách/giờ</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={2}
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
                min={5}
                max={30}
                step={1}
                value={mu}
                onChange={(e) => setMu(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Chi phí mở 1 quầy (Cs):</span>
                <span className="font-mono text-purple-300 font-bold">{costService}.000 đ/giờ</span>
              </div>
              <input
                type="range"
                min={20}
                max={300}
                step={10}
                value={costService}
                onChange={(e) => setCostService(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Chi phí tổn thất do khách chờ (Cw):</span>
                <span className="font-mono text-amber-300 font-bold">{costWait}.000 đ/giờ</span>
              </div>
              <input
                type="range"
                min={20}
                max={400}
                step={10}
                value={costWait}
                onChange={(e) => setCostWait(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {optimalResult && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 p-3 mt-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <Award className="w-4 h-4" />
                <span>ĐIỂM TỐI ƯU KINH TẾ (SWEET SPOT)</span>
              </div>
              <div className="text-sm text-slate-200">
                Mở chính xác <strong className="text-emerald-300 font-mono text-base">{optimalResult.servers} quầy</strong> sẽ đạt Tổng chi phí thấp nhất:{' '}
                <strong className="text-white font-mono">{optimalResult.totalCost.toFixed(0)}.000 đ/giờ</strong>.
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Biểu Đồ So Sánh Chi Phí Theo Số Lượng Quầy Phục Vụ (c)</span>
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-purple-300">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500" />
                  Cs · c (Dịch vụ)
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  Cw · L (Chờ đợi)
                </span>
                <span className="flex items-center gap-1 text-cyan-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                  Tổng TC
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {results.map((res) => (
                <div
                  key={res.servers}
                  className={`p-2.5 rounded-lg border transition-all ${
                    res.isOptimal
                      ? 'bg-slate-950 border-emerald-500/80 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">c = {res.servers} quầy</span>
                      {res.isOptimal && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                          ★ TỐI ƯU NHẤT
                        </span>
                      )}
                      <span className="text-slate-500 text-[11px] font-mono">
                        (Tải: {(res.utilization * 100).toFixed(1)}% · Lq: {res.Lq.toFixed(2)} · Wq: {(res.Wq * 60).toFixed(1)}p)
                      </span>
                    </div>
                    <div className="font-mono font-bold text-xs">
                      <span className={res.isOptimal ? 'text-emerald-300 text-sm' : 'text-slate-300'}>
                        {res.totalCost.toFixed(0)}.000 đ/h
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-purple-500/80 hover:bg-purple-500 transition-all"
                      style={{ width: `${(res.costService / maxTotalCost) * 100}%` }}
                    />
                    <div
                      className="bg-amber-500/80 hover:bg-amber-500 transition-all"
                      style={{ width: `${(res.costWaiting / maxTotalCost) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
