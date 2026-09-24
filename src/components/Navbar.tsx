import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>QueueTheory · Mô Hình Hàng Chờ</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a href="#simulator" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
            Mô Phỏng
          </a>
          <a href="#principles" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
            Nguyên Tắc
          </a>
          <a href="#formulas" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
            Công Thức
          </a>
          <a href="#economics" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
            Tối Ưu Chi Phí
          </a>
          <a href="#applications" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
            Ứng Dụng
          </a>
          <a href="#quiz" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
            Trắc Nghiệm
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#simulator"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-950/40"
          >
            Chạy Mô Phỏng
          </a>
        </div>
      </div>
    </header>
  );
};
