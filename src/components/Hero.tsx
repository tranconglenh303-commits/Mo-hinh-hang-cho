import React from 'react';
import { Play, BookOpen, Layers } from 'lucide-react';
import { MathView } from './MathView';

export const Hero: React.FC = () => {
  return (
    <div className="relative pt-12 pb-10 border-b border-slate-800/60 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-mono">
          <span className="text-cyan-400 font-semibold">QUEUEING THEORY</span>
          <span aria-hidden="true">·</span>
          <span>Nghiên Cứu Vận Hành & Tối Ưu Hóa Dòng Chảy</span>
          <span aria-hidden="true">·</span>
          <span>Tiêu chuẩn Kendall A/B/c</span>
        </div>

      
<div className="max-w-5xl">
  {/* Tiêu đề chính */}
  <h1
    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight"
    style={{ textWrap: 'balance' }}
  >
    Mô Hình Hàng Chờ: Bản Chất Vận Hành,
    Công Thức Từng Giai Đoạn & Ứng Dụng Thực Tiễn
  </h1>

  {/* Thông tin nhóm và giảng viên */}
  <div className="mt-6 flex flex-col gap-2 border-l-4 border-cyan-400 pl-4">
    <p className="text-lg sm:text-xl font-bold text-cyan-400">
      NHÓM 6
    </p>

    <p className="text-base sm:text-lg text-slate-300">
      <span className="font-medium text-slate-400">
        Giảng viên hướng dẫn:
      </span>
      <span className="block sm:inline sm:ml-2 font-semibold text-white">
        TS. Chu Nguyễn Mộng Ngọc
      </span>
    </p>
  </div>

  {/* Phần mô tả */}
  <p className="mt-7 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
    Khám phá toàn diện Lý thuyết Hàng chờ (Queueing Theory)
    qua mô phỏng trực quan tương tác thời gian thực,
    bóc tách công thức toán học từng bước (Định luật Little,
    M/M/1, M/M/c, M/M/1/K, M/G/1), tối ưu hóa cân bằng chi phí
    và giải quyết các bài toán kinh doanh thực tế.
  </p>
</div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 backdrop-blur">
            <span className="text-xs text-slate-500 block mb-1">Định luật Little</span>
            <div className="font-mono text-cyan-300 font-semibold text-sm">
              <MathView formula="L = \lambda W" />
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Khách trong hệ thống</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 backdrop-blur">
            <span className="text-xs text-slate-500 block mb-1">Hệ số sử dụng</span>
            <div className="font-mono text-emerald-300 font-semibold text-sm">
              <MathView formula="\rho = \frac{\lambda}{c \mu}" />
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Điều kiện ổn định &lt; 1</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 backdrop-blur">
            <span className="text-xs text-slate-500 block mb-1">Mô hình đa kênh</span>
            <div className="font-mono text-purple-300 font-semibold text-sm">
              <MathView formula="M/M/c" /> (Erlang C)
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Xác suất phải xếp hàng</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 backdrop-blur">
            <span className="text-xs text-slate-500 block mb-1">Hàm mục tiêu chi phí</span>
            <div className="font-mono text-amber-300 font-semibold text-sm">
              <MathView formula="\min TC = C_s c + C_w L" />
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Cân bằng kinh tế tối ưu</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#simulator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950/40 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Khám phá Mô phỏng Thời gian thực</span>
          </a>
          <a
            href="#principles"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Nguyên tắc hoạt động</span>
          </a>
          <a
            href="#formulas"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Công thức từng giai đoạn</span>
          </a>
        </div>
      </div>
    </div>
  );
};
