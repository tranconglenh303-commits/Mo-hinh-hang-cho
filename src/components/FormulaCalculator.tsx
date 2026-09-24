import React, { useState } from 'react';
import { KendallModelType } from '../types/queue';
import { calculateMM1, calculateMMC, calculateMD1, calculateMG1, getStepByStepCalculation } from '../utils/mathFormulas';
import { MathView } from './MathView';
import { BookOpen, Layers, Server } from 'lucide-react';

export const FormulaCalculator: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<KendallModelType>('M/M/1');

  const [lambda, setLambda] = useState<number>(8);
  const [mu, setMu] = useState<number>(10);
  const [k, setK] = useState<number>(2);
  const [sigma, setSigma] = useState<number>(0.05);

  const metrics = selectedModel === 'M/M/1'
    ? calculateMM1(lambda, mu)
    : selectedModel === 'M/M/k'
      ? calculateMMC(lambda, mu, k)
      : selectedModel === 'M/G/1'
        ? calculateMG1(lambda, mu, sigma)
        : calculateMD1(lambda, mu);

  const steps = getStepByStepCalculation(selectedModel, lambda, mu, k, sigma);

  const modelDescriptions: Record<KendallModelType, { title: string; subtitle: string; tag: string }> = {
    'M/M/1': {
      title: 'M/M/1: Lượt đến Poisson, thời gian phục vụ Mũ, 1 server',
      subtitle: 'Mô hình hàng chờ đơn kênh cơ bản nhất trong lý thuyết xếp hàng.',
      tag: '1 Server · Phục vụ ngẫu nhiên',
    },
    'M/M/k': {
      title: 'M/M/k: Lượt đến Poisson, thời gian phục vụ Mũ, nhiều server',
      subtitle: 'Mô hình đa server song song cùng phục vụ 1 hàng đợi chung (Erlang-C).',
      tag: 'Nhiều Server (k) · Chia tải song song',
    },
    'M/G/1': {
      title: 'M/G/1: Lượt đến Poisson, thời gian phục vụ tổng quát, 1 server',
      subtitle: 'Thời gian phục vụ tuân theo phân phối xác suất bất kỳ với độ lệch chuẩn σ (Pollaczek-Khinchine).',
      tag: '1 Server · Phân phối tổng quát (σ)',
    },
    'M/D/1': {
      title: 'M/D/1: Lượt đến Poisson, thời gian phục vụ cố định, 1 server',
      subtitle: 'Thời gian phục vụ không đổi (Deterministic, σ = 0), hàng chờ Lq giảm 50% so với M/M/1.',
      tag: '1 Server · Thời gian cố định (σ = 0)',
    },
  };

  return (
    <section id="formulas" className="py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-mono text-cyan-400 tracking-wider">02. CÔNG THỨC TOÁN HỌC TỪNG GIAI ĐOẠN</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Máy Tính & Diễn Giải Chi Tiết Công Thức Hàng Chờ
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {modelDescriptions[selectedModel].title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          {(['M/M/1', 'M/M/k', 'M/G/1', 'M/D/1'] as KendallModelType[]).map((m) => (
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

      {/* Model Definition Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  {selectedModel}
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {modelDescriptions[selectedModel].title}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {modelDescriptions[selectedModel].subtitle}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 shrink-0 self-start sm:self-auto">
            {modelDescriptions[selectedModel].tag}
          </span>
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
                Tốc độ đến (<MathView formula="\lambda" />): khách/giờ (Poisson)
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
                Tốc độ phục vụ mỗi server (<MathView formula="\mu" />): khách/giờ
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

            {selectedModel === 'M/M/k' && (
              <div className="mb-4">
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Số lượng server phục vụ song song (k)
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setK(num)}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                        k === num
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      k = {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedModel === 'M/G/1' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="text-slate-300 font-medium">
                    Độ lệch chuẩn thời gian phục vụ (<MathView formula="\sigma" />): giờ
                  </label>
                </div>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={sigma}
                  onChange={(e) => setSigma(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Phương sai tương ứng: <span className="font-mono text-cyan-300 font-bold">{(sigma * sigma).toFixed(5)}</span>
                </span>
              </div>
            )}

            {selectedModel === 'M/D/1' && (
              <div className="mb-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Thời gian phục vụ cố định (1/μ):</span>
                  <span className="font-mono text-cyan-300 font-bold">{((1 / mu) * 60).toFixed(1)} phút/khách</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Phương sai σ²:</span>
                  <span className="font-mono text-emerald-400 font-bold">0 (Không dao động)</span>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-300">6 Chỉ Số Cân Bằng Chuẩn (Steady-State):</span>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  ρ = {(metrics.rho * 100).toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 text-xs">
                {/* 1. P0 */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-0.5">
                    <span>1. Xác suất rảnh</span>
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">P₀</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${metrics.isStable ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {metrics.isStable ? `${(metrics.P0 * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>

                {/* 2. Lq */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-0.5">
                    <span>2. Khách trong hàng</span>
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">L_q</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-white">
                    {metrics.isStable ? `${metrics.Lq.toFixed(2)}` : '∞'}
                    <span className="text-[10px] text-slate-500 font-normal ml-1">khách</span>
                  </span>
                </div>

                {/* 3. L */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-0.5">
                    <span>3. Toàn hệ thống</span>
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">L</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-white">
                    {metrics.isStable ? `${metrics.L.toFixed(2)}` : '∞'}
                    <span className="text-[10px] text-slate-500 font-normal ml-1">khách</span>
                  </span>
                </div>

                {/* 4. Wq */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-0.5">
                    <span>4. TG chờ hàng</span>
                    <span className="font-mono text-amber-400 font-bold text-[11px]">W_q</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-300">
                    {metrics.isStable ? `${(metrics.Wq * 60).toFixed(1)}` : '∞'}
                    <span className="text-[10px] text-slate-500 font-normal ml-1">phút</span>
                  </span>
                </div>

                {/* 5. W */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-0.5">
                    <span>5. TG hệ thống</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">W</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-300">
                    {metrics.isStable ? `${(metrics.W * 60).toFixed(1)}` : '∞'}
                    <span className="text-[10px] text-slate-500 font-normal ml-1">phút</span>
                  </span>
                </div>

                {/* 6. Pw */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-0.5">
                    <span>6. Xác suất phải chờ</span>
                    <span className="font-mono text-purple-400 font-bold text-[11px]">P_w</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${metrics.isStable ? 'text-purple-300' : 'text-rose-400'}`}>
                    {metrics.isStable ? `${(metrics.Pw * 100).toFixed(1)}%` : '100%'}
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
              <span>Đủ 6 Phép Tính Cho {selectedModel} (Thứ tự: P₀ → Lq → L → Wq → W → Pw)</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/80">
              {steps.length} phép tính chuẩn xác 100%
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
