import React, { useState } from 'react';
import { ShoppingCart, PhoneCall, HeartPulse, Server, Plane, Factory, CheckCircle2 } from 'lucide-react';

interface ApplicationItem {
  id: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  model: string;
  problem: string;
  solution: string;
  mathInsight: string;
  keyTakeaways: string[];
}

export const RealWorldApplications: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<string>('supermarket');

  const applications: ApplicationItem[] = [
    {
      id: 'supermarket',
      icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />,
      category: 'Bán Lẻ & Thương Mại',
      title: 'Quầy Thu Ngân Siêu Thị: 1 Hàng Đa Quầy vs Nhiều Hàng Riêng Lẻ',
      model: 'M/M/c (Single Queue Multi-Server) vs c × M/M/1',
      problem: 'Ở mô hình truyền thống (mỗi quầy 1 hàng), khách hay gặp cảnh hàng bên cạnh đi nhanh hơn hoặc không may đứng sau một khách gặp sự cố khiến cả hàng bị tắc.',
      solution: 'Chuyển sang thiết kế 1 hàng rào ziczac chung (Snake Line). Khách đầu hàng sẽ tiến vào bất kỳ quầy nào vừa trống.',
      mathInsight: 'Về mặt toán học, 1 hàng chung M/M/c loại bỏ hoàn toàn thời gian quầy bị bỏ trống lãng phí khi vẫn còn người đang chờ ở hàng khác. Độ lệch chuẩn thời gian chờ giảm tới 65%.',
      keyTakeaways: [
        'Loại bỏ 100% rủi ro bị "mắc kẹt" sau khách hàng đặc biệt.',
        'Thời gian chờ đợi được phân bổ công bằng tuyệt đối theo nguyên tắc FIFO.',
        'Được áp dụng thành công tại các chuỗi bán lẻ toàn cầu như Zara, Uniqlo, Best Buy.',
      ],
    },
    {
      id: 'callcenter',
      icon: <PhoneCall className="w-5 h-5 text-emerald-400" />,
      category: 'Dịch Vụ Khách Hàng (BPO)',
      title: 'Trung Tâm Tổng Đài Cuộc Gọi: Bài Toán Erlang C & Chuẩn SLA 80/20',
      model: 'M/M/c với công thức Erlang C',
      problem: 'Doanh nghiệp cần xác định số lượng điện thoại viên ca trực sao cho không để khách chờ quá lâu dẫn đến dập máy, đồng thời không lãng phí chi phí nhân sự rảnh rỗi.',
      solution: 'Sử dụng công thức Erlang C để tính xác suất một cuộc gọi phải chờ quá t giây: P(Wait > t) = C(c, r) · exp(-(c·μ - λ)·t).',
      mathInsight: 'Quy chuẩn SLA phổ biến: 80% cuộc gọi được bắt máy trong vòng 20 giây (SLA 80/20). Nếu λ = 120 cuộc/giờ, μ = 15 cuộc/giờ, cần tối thiểu 11 agent để đạt SLA 86%.',
      keyTakeaways: [
        'Dự báo chính xác số điện thoại viên cần phân ca theo từng khung giờ.',
        'Giảm tỷ lệ khách hàng dập máy (Abandonment Rate < 3%).',
        'Tối ưu ngân sách quỹ lương nhân sự hàng chục phần trăm.',
      ],
    },
    {
      id: 'hospital',
      icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
      category: 'Y Tế & Cấp Cứu',
      title: 'Khoa Cấp Cứu Bệnh Viện: Hệ Thống Phân Luồng Ưu Tiên (Triage Priority)',
      model: 'Priority Queueing Model (Preemptive & Non-Preemptive)',
      problem: 'Khoa cấp cứu không thể áp dụng FIFO vì bệnh nhân đau tim, tai nạn giao thông nặng cần cấp cứu ngay lập tức, không thể đợi sau người bị nhẹ.',
      solution: 'Quy trình Triage 5 mức độ (ESI). Bệnh nhân nguy kịch được bác sĩ tiếp nhận ngay lập tức, ngắt quãng mọi ca phục vụ không khẩn cấp.',
      mathInsight: 'Mô hình hàng chờ ưu tiên ngắt quãng chứng minh thời gian chờ của nhóm ưu tiên cao nhất hoàn toàn không phụ thuộc vào số lượng bệnh nhân nhóm nhẹ đang xếp hàng!',
      keyTakeaways: [
        'Cứu sống tính mạng bệnh nhân nặng trong "Khung giờ vàng" (Golden Hour).',
        'Phân luồng phòng khám nhanh (Fast-track) cho các ca bệnh nhẹ.',
        'Cân bằng tải giữa các phòng mổ và khoa hồi sức tích cực (ICU).',
      ],
    },
    {
      id: 'cloud',
      icon: <Server className="w-5 h-5 text-purple-400" />,
      category: 'Công Nghệ Thông Tin',
      title: 'Hạ Tầng Cloud & Load Balancer: Hàng Đợi Request & Chống Sập Hệ Thống',
      model: 'M/M/1/K Buffer & Message Brokers (Kafka / RabbitMQ)',
      problem: 'Khi lượng truy cập tăng đột biến, máy chủ web nhận hàng chục ngàn HTTP request mỗi giây. Nếu không có bộ đệm giới hạn K, RAM và CPU sẽ cạn kiệt, dẫn đến sập toàn bộ cụm máy chủ.',
      solution: 'Thiết lập hàng đợi có kích thước giới hạn (Bounded Queue M/M/1/K). Các request vượt ngưỡng dung lượng K sẽ nhận ngay phản hồi HTTP 429 Too Many Requests để bảo vệ hệ thống.',
      mathInsight: 'Tốc độ thực tế λ_eff = λ · (1 - P_K) giữ cho hệ thống luôn chạy ở công suất bão hòa tối đa mà không bị tràn bộ nhớ.',
      keyTakeaways: [
        'Bảo vệ hệ thống backend khỏi thảm họa sập theo chuỗi (Cascading Failure).',
        'Auto-scaling: Khi độ dài hàng chờ L_q vượt ngưỡng, tự động khởi tạo thêm các Pod container mới.',
        'Đảm bảo thời gian phản hồi (p99 latency) cho các yêu cầu đã được tiếp nhận.',
      ],
    },
    {
      id: 'transport',
      icon: <Plane className="w-5 h-5 text-amber-400" />,
      category: 'Giao Thông & Logistics',
      title: 'Sân Bay & Trạm Thu Phí BOT: Tác Động Của Chuẩn Hóa Thời Gian (M/D/c)',
      model: 'Từ M/M/c chuyển sang M/D/c (Deterministic Service)',
      problem: 'Trạm thu phí thủ công dùng tiền mặt khiến xe dừng chờ lâu, thời gian thanh toán dao động lớn gây ùn tắc kéo dài vào giờ cao điểm.',
      solution: 'Chuyển sang làn thu phí không dừng ETC và cổng soát vé tự động Auto-gate tại sân bay.',
      mathInsight: 'Theo công thức Pollaczek-Khinchine, khi phương sai thời gian phục vụ triệt tiêu về 0 (σ² = 0, mô hình M/D/c), độ dài hàng chờ và thời gian chờ giảm chính xác 50% so với mô hình ngẫu nhiên!',
      keyTakeaways: [
        'Triệt tiêu độ biến thiên (Variance reduction) là giải pháp mạnh nhất trong quản trị vận hành.',
        'Tăng lưu lượng thông xe lên gấp 4–5 lần tại các trạm BOT.',
        'Giảm tiêu hao nhiên liệu và khí thải ô nhiễm môi trường.',
      ],
    },
    {
      id: 'factory',
      icon: <Factory className="w-5 h-5 text-blue-400" />,
      category: 'Sản Xuất Tinh Gọn (Lean)',
      title: 'Dây Chuyền Nhà Máy: Kiểm Soát WIP & Giải Quyết Điểm Nghẽn (Bottlenecks)',
      model: 'Mạng Hàng Chờ Nối Tiếp (Jackson Queueing Networks)',
      problem: 'Sản phẩm dở dang (WIP) ứ đọng khổng lồ giữa các công đoạn sản xuất, làm chôn vốn lưu động và kéo dài thời gian hoàn thành đơn hàng.',
      solution: 'Áp dụng Lý thuyết Điểm nghẽn (Theory of Constraints) và hệ thống thẻ Kanban kéo để giới hạn WIP tại từng trạm.',
      mathInsight: 'Định luật Little L = λW khẳng định: Để rút ngắn thời gian giao hàng W mà tốc độ sản xuất λ không đổi, cách duy nhất là phải giảm lượng hàng tồn dở dang L!',
      keyTakeaways: [
        'Xác định trạm có hệ số sử dụng cao nhất để ưu tiên đầu tư cải tiến.',
        'Cân bằng chuyền sản xuất (Line balancing) để triệt tiêu thời gian chờ đợi.',
        'Nguyên tắc cốt lõi của Hệ thống Sản xuất Toyota (TPS / Lean Manufacturing).',
      ],
    },
  ];

  const currentApp = applications.find((a) => a.id === selectedApp) || applications[0];

  return (
    <section id="applications" className="py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-mono text-cyan-400 tracking-wider">04. ỨNG DỤNG THỰC TIỄN & CASE STUDIES</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Mô Hình Hàng Chờ Trong Đời Sống & Kinh Doanh Hiện Đại
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          6 Lĩnh vực kinh tế ứng dụng sâu sắc Lý thuyết Hàng chờ
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        {applications.map((app) => (
          <button
            key={app.id}
            onClick={() => setSelectedApp(app.id)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedApp === app.id
                ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="mb-2 p-1.5 rounded-lg bg-slate-900 w-fit border border-slate-800">
                {app.icon}
              </div>
              <span className="text-[11px] text-slate-400 block line-clamp-1">{app.category}</span>
              <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-2">{app.title.split(':')[0]}</h4>
            </div>
            <span className={`text-[10px] font-mono mt-2 block ${selectedApp === app.id ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
              {selectedApp === app.id ? '● Đang xem' : 'Xem chi tiết'}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
              {currentApp.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <span>{currentApp.category.toUpperCase()}</span>
                <span>·</span>
                <span className="text-purple-300 font-semibold">{currentApp.model}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {currentApp.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div className="bg-slate-950/80 rounded-xl p-4 border border-rose-500/20">
              <span className="text-xs font-mono text-rose-400 font-semibold block mb-1">
                VẤN ĐỀ VẬN HÀNH & NGHẼN CỔ CHAI
              </span>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {currentApp.problem}
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-emerald-500/20">
              <span className="text-xs font-mono text-emerald-400 font-semibold block mb-1">
                GIẢI PHÁP TỐI ƯU HÀNG CHỜ
              </span>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {currentApp.solution}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950/80 rounded-xl p-4 border border-cyan-500/20">
              <span className="text-xs font-mono text-cyan-400 font-semibold block mb-1">
                LUẬN ĐIỂM TOÁN HỌC & CÔNG THỨC CHỨNG MINH
              </span>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {currentApp.mathInsight}
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
              <span className="text-xs font-semibold text-white block mb-2">
                Bài học rút ra cho nhà quản trị:
              </span>
              <ul className="space-y-2">
                {currentApp.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
