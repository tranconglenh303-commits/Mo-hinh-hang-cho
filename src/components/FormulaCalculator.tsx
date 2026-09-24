import React, { useState } from 'react';
import { KendallModelType } from '../types/queue';
import { calculateMM1, calculateMMC, calculateMM1K, calculateMG1, getStepByStepCalculation } from '../utils/mathFormulas';
import { MathView } from './MathView';
import { BookOpen, Layers } from 'lucide-react';

export const FormulaCalculator: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<KendallModelType>('M/M/1');

  const [lambda, setLambda] = useState<number>(8);
  const [mu, setMu] = useState<number>(10);
  const [c, setC] = useState<number>(2);
  const [K, setK] = useState<number>(5);
  const [sigma, setSigma] = useState<number>(0.05);

  const metrics = selectedModel === 'M/M/1'
    ? calculateMM1(lambda, mu)
    : selectedModel === 'M/M/c'
      ? calculateMMC(lambda, mu, c)
      : selectedModel === 'M/M/1/K'
        ? calculateMM1K(lambda, mu, K)
        : calculateMG1(lambda, mu, sigma);

  const steps = getStepByStepCalculation(selectedModel, lambda, mu, c, K, sigma);

  return (
    <section id="formulas" className="py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-mono text-cyan-400 tracking-wider">02. CÔNG THỨC TOÁN HỌC TỪNG GIAI ĐOẠN</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Máy Tính & Diễn Giải Chi Tiết Công Thức Hàng Chờ
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          {(['M/M/1', 'M/M/c', 'M/M/1/K', 'M/G/1'] as KendallModelType[]).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-colors cursor-pointer ${
                selectedModel === m
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-4 md:p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Định Luật Cốt Lõi: Định Luật Little (Little's Law - 1961)</h4>
              <p className="text-xs text-slate-400">
                Áp dụng cho mọi hệ thống hàng chờ ở trạng thái ổn định, không phụ thuộc vào dạng phân phối:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-slate-950/80 px-4 py-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">Toàn hệ thống: </span>
              <span className="text-cyan-300 font-bold"><MathView formula="L = \lambda W" /></span>
            </div>
            <span className="text-slate-600">·</span>
            <div>
              <span className="text-slate-400">Trong hàng chờ: </span>
              <span className="text-amber-300 font-bold"><MathView formula="L_q = \lambda W_q" /></span>
            </div>
            <span className="text-slate-600">·</span>
            <div>
              <span className="text-slate-400">Thời gian lưu: </span>
              <span className="text-emerald-300 font-bold"><MathView formula="W = W_q + \frac{1}{\mu}" /></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
              <span>Thiết Lập Tham Số Đầu Vào</span>
              <span className="text-xs font-mono text-cyan-400">{selectedModel}</span>
            </h3>

            <div className="mb-4">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Tốc độ đến (<MathView formula="\lambda" />): khách/giờ (hoặc khách/phút)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={lambda}
                  onChange={(e) => setLambda(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="range"
                  min={0.5}
                  max={30}
                  step={0.5}
                  value={lambda}
                  onChange={(e) => setLambda(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Tốc độ phục vụ mỗi quầy (<MathView formula="\mu" />): khách/giờ
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={mu}
                  onChange={(e) => setMu(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="range"
                  min={0.5}
                  max={30}
                  step={0.5}
                  value={mu}
                  onChange={(e) => setMu(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {selectedModel === 'M/M/c' && (
              <div className="mb-4">
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Số lượng quầy phục vụ song song (c)
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setC(num)}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                        c === num
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedModel === 'M/M/1/K' && (
              <div className="mb-4">
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Dung lượng tối đa cả hệ thống (K = hàng chờ + 1 quầy)
                </label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={K}
                  onChange={(e) => setK(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {selectedModel === 'M/G/1' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="text-slate-300 font-medium">
                    Độ lệch chuẩn thời gian phục vụ (<MathView formula="\sigma" />)
                  </label>
                  <button
                    onClick={() => setSigma(0)}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Đặt = 0 (M/D/1)
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={sigma}
                  onChange={(e) => setSigma(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Chỉ Số Cân Bằng (Steady-State):</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Hệ số sử dụng (ρ)</span>
                  <span className={`font-mono font-bold text-sm ${metrics.isStable ? 'text-cyan-300' : 'text-rose-400'}`}>
                    {(metrics.rho * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Khách trong hàng (Lq)</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {metrics.isStable ? metrics.Lq.toFixed(2) : '∞'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Toàn hệ thống (L)</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {metrics.isStable ? metrics.L.toFixed(2) : '∞'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">TG chờ hàng (Wq)</span>
                  <span className="font-mono font-bold text-sm text-amber-300">
                    {metrics.isStable ? `${metrics.Wq.toFixed(3)} ĐV` : '∞'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Các Giai Đoạn Tính Toán Chi Tiết Cho {selectedModel}</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {steps.length} Giai đoạn chuẩn hóa
            </span>
          </div>

          <div className="space-y-4">
            {steps.map((st) => (
              <div
                key={st.stepNumber}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700/80 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-mono font-bold">
                      {st.stepNumber}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200">{st.stageName}</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3">{st.description}</p>

                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 my-2 overflow-x-auto text-cyan-200 text-sm">
                  <MathView formula={st.latexFormula} displayMode={true} />
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/80 rounded-lg px-3 py-2 border border-slate-800 text-xs gap-2">
                  <div className="font-mono text-emerald-300 font-semibold">
                    <MathView formula={st.numericalResult} />
                  </div>
                  <div className="text-slate-400 sm:max-w-md text-right">
                    {st.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
