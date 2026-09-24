import React from 'react';
import { Users, Clock, ListOrdered, GitBranch, Shield, ArrowRight } from 'lucide-react';
import { MathView } from './MathView';

export const QueueSystemArchitecture: React.FC = () => {
  const components = [
    {
      step: '01',
      title: 'Dòng Đến & Nguồn Khách (Arrival Process)',
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      desc: 'Được đặc trưng bởi tốc độ đến λ (Arrival rate). Khách thường đến ngẫu nhiên theo Quá trình Poisson, với khoảng thời gian giữa 2 lần đến tuân theo Phân phối Hàm Mũ (Exponential Distribution).',
      formula: 'P(n \\text{ khách đến trong } t) = \\frac{(\\lambda t)^n e^{-\\lambda t}}{n!}',
    },
    {
      step: '02',
      title: 'Hàng Đợi & Dung Lượng (Queue Buffer)',
      icon: <ListOrdered className="w-5 h-5 text-purple-400" />,
      desc: 'Nơi khách lưu trú trong lúc chờ phục vụ. Có thể có dung lượng vô hạn (K = ∞) hoặc hữu hạn (K < ∞). Khi hàng đầy, khách mới đến sẽ bị từ chối (Drop/Balk).',
      formula: 'K = \\text{Số chỗ trong hàng} + \\text{Số quầy phục vụ}',
    },
    {
      step: '03',
      title: 'Kỷ Luật Xếp Hàng (Queue Discipline)',
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      desc: 'Quy tắc chọn khách tiếp theo: FIFO (Đến trước phục vụ trước), LIFO (Đến sau phục vụ trước - ngăn xếp), SIRO (Chọn ngẫu nhiên), hoặc Priority (Ưu tiên theo phân cấp VIP/cấp cứu).',
      formula: '\\text{FIFO, LIFO, Priority (Preemptive / Non-preemptive)}',
    },
    {
      step: '04',
      title: 'Cơ Chế Phục Vụ (Service Mechanism)',
      icon: <GitBranch className="w-5 h-5 text-emerald-400" />,
      desc: 'Gồm c quầy phục vụ song song, mỗi quầy có tốc độ phục vụ μ. Thời gian phục vụ có thể là Hàm mũ (M), Xác định cố định (D), hoặc Tổng quát (G).',
      formula: '\\text{Thời gian phục vụ trung bình } = \\frac{1}{\\mu}',
    },
  ];

  return (
    <section id="principles" className="py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-mono text-cyan-400 tracking-wider">01. KIẾN TRÚC & NGUYÊN TẮC HOẠT ĐỘNG</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Cấu Trúc Hệ Thống Hàng Chờ & Ký Hiệu Kendall
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {components.map((c) => (
          <div
            key={c.step}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-500 font-bold">{c.step}</span>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  {c.icon}
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{c.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{c.desc}</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
              <MathView formula={c.formula} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        <h3 className="text-base font-bold text-white mb-3">
          Chuẩn Quốc Tế: Ký Hiệu Kendall (Kendall's Notation: A / B / c / K / N / D)
        </h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Được phát minh bởi David G. Kendall năm 1953, đây là ngôn ngữ chuẩn hóa giúp mô tả chính xác mọi mô hình hàng chờ trên toàn cầu:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block mb-1">A (Dòng đến)</span>
            <span className="text-slate-400 block text-[11px]">M (Markov), D (Deterministic), G (General)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold block mb-1">B (Thời gian phục vụ)</span>
            <span className="text-slate-400 block text-[11px]">M (Markov), D (Cố định), G (Tổng quát)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-mono text-purple-400 font-bold block mb-1">c (Số quầy)</span>
            <span className="text-slate-400 block text-[11px]">Số server phục vụ song song (1, 2, ..., c)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-mono text-amber-400 font-bold block mb-1">K (Dung lượng)</span>
            <span className="text-slate-400 block text-[11px]">Số khách tối đa trong toàn hệ thống (mặc định ∞)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-mono text-rose-400 font-bold block mb-1">N (Nguồn khách)</span>
            <span className="text-slate-400 block text-[11px]">Quy mô nguồn phát sinh khách (vô hạn hoặc hữu hạn)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-mono text-blue-400 font-bold block mb-1">D (Kỷ luật)</span>
            <span className="text-slate-400 block text-[11px]">FIFO, LIFO, SIRO, Priority (mặc định FIFO)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
