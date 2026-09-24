import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Lý Thuyết Hàng Chờ & Mô Phỏng Hệ Thống</span>
          <span>·</span>
          <span>Queueing Theory Educational Portal</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <a href="#simulator" className="hover:text-white transition-colors">
            Mô phỏng thời gian thực
          </a>
          <a href="#formulas" className="hover:text-white transition-colors">
            Công thức Kendall & Little
          </a>
          <a href="#applications" className="hover:text-white transition-colors">
            Nghiên cứu ứng dụng
          </a>
        </div>

        <div className="text-slate-600">
          Xây dựng cho nghiên cứu khoa học & quản trị vận hành
        </div>
      </div>
    </footer>
  );
};
