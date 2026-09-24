import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const KnowledgeQuiz: React.FC = () => {
  const questions: Question[] = [
    {
      id: 1,
      question: 'Tại sao trong mô hình hàng chờ không giới hạn (M/M/1, M/M/c), điều kiện bắt buộc để hệ thống đạt trạng thái ổn định là ρ = λ / (c·μ) < 1?',
      options: [
        'A. Vì nếu ρ ≥ 1, chi phí mở quầy sẽ vượt quá ngân sách tài chính.',
        'B. Vì nếu ρ ≥ 1, tốc độ khách đến lớn hơn hoặc bằng tốc độ phục vụ tối đa, hàng chờ sẽ tích tụ và kéo dài vô hạn theo thời gian.',
        'C. Vì công thức Erlang chỉ tính được các số nguyên dương.',
        'D. Vì khi ρ ≥ 1 thì mọi khách hàng đều tự động bỏ về (Balking).',
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Khi tốc độ khách đến λ vượt quá tổng năng lực phục vụ c·μ, hệ thống không bao giờ có thể "giải phóng" hết hàng chờ.',
    },
    {
      id: 2,
      question: 'Theo Định luật Little (Little\'s Law), mối liên hệ giữa số lượng khách trung bình trong hệ thống (L), tốc độ khách đến (λ) và thời gian lưu lại (W) là gì?',
      options: [
        'A. L = λ / W',
        'B. W = λ · L',
        'C. L = λ · W',
        'D. L = W / λ',
      ],
      correctIndex: 2,
      explanation: 'Chính xác! L = λ · W là định luật nền tảng được chứng minh bởi John Little năm 1961.',
    },
    {
      id: 3,
      question: 'Khi chuyển từ mô hình thời gian phục vụ ngẫu nhiên (M/M/1) sang mô hình thời gian phục vụ hoàn toàn cố định (M/D/1, phương sai σ² = 0) với cùng tốc độ trung bình, độ dài hàng chờ Lq thay đổi thế nào theo công thức Pollaczek-Khinchine?',
      options: [
        'A. Độ dài hàng chờ Lq không thay đổi vì tốc độ trung bình μ vẫn như cũ.',
        'B. Độ dài hàng chờ Lq giảm chính xác 50% (một nửa).',
        'C. Độ dài hàng chờ Lq tăng gấp đôi do thiếu tính linh hoạt.',
        'D. Độ dài hàng chờ Lq triệt tiêu về 0 hoàn toàn.',
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Với M/M/1, phương sai là σ² = 1/μ², nên Lq = ρ² / (1 - ρ). Với M/D/1 (σ² = 0), Lq = ρ² / [2(1 - ρ)], tức là giảm đúng 50%!',
    },
    {
      id: 4,
      question: 'Tại sao các siêu thị và sân bay hiện đại có xu hướng chuyển từ "nhiều hàng riêng cho từng quầy" sang "1 hàng chung duy nhất cho tất cả các quầy"?',
      options: [
        'A. Nhằm tiết kiệm chi phí thuê nhân viên quản lý hàng.',
        'B. Nhằm ép khách hàng phải đi qua nhiều gian hàng trưng bày bánh kẹo hơn.',
        'C. Để loại bỏ hiện tượng nhảy hàng (Jockeying), đảm bảo công bằng FIFO tuyệt đối và không để quầy nào bị rảnh trong khi khách vẫn phải đợi ở hàng khác.',
        'D. Để giảm diện tích mặt bằng sàn.',
      ],
      correctIndex: 2,
      explanation: 'Chính xác! Mô hình 1 hàng chung (M/M/c) tối đa hóa hiệu suất sử dụng: ngay khi có bất kỳ quầy nào hoàn tất, khách đầu hàng lập tức được gọi vào.',
    },
  ];

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const handleSelect = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter(
    (q) => userAnswers[q.id] === q.correctIndex
  ).length;

  const handleReset = () => {
    setUserAnswers({});
  };

  return (
    <section id="quiz" className="py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-mono text-cyan-400 tracking-wider">05. KIỂM TRA KIẾN THỨC VẬN HÀNH</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Trắc Nghiệm Tương Tác: Thấu Hiểu Lý Thuyết Hàng Chờ
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            Đã làm: {answeredCount}/{questions.length} câu
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {questions.map((q) => {
          const isAnswered = userAnswers[q.id] !== undefined;
          const selectedOption = userAnswers[q.id];
          const isCorrect = selectedOption === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                isAnswered
                  ? isCorrect
                    ? 'bg-slate-900/60 border-emerald-500/50'
                    : 'bg-slate-900/60 border-rose-500/50'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold">CÂU HỎI {q.id}</span>
                  {isAnswered && (
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Chính xác
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                        </>
                      )}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white mb-4 leading-snug">
                  {q.question}
                </h4>

                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isTheCorrectOne = isAnswered && optIdx === q.correctIndex;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500 text-white font-medium'
                              : 'bg-rose-500/20 border-rose-500 text-white font-medium'
                            : isTheCorrectOne
                              ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAnswered && (
                <div className="mt-2 pt-3 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg">
                  <strong className="text-slate-300 block mb-0.5">Lời giải thích:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answeredCount === questions.length && (
        <div className="mt-6 rounded-xl border border-cyan-500/40 bg-slate-900/90 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">Kết Quả Kiểm Tra Kiến Thức</h4>
            <p className="text-xs text-slate-400">
              Bạn đã trả lời đúng <strong className="text-cyan-300 font-mono text-sm">{correctCount}/{questions.length}</strong> câu hỏi.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            Làm lại bài trắc nghiệm
          </button>
        </div>
      )}
    </section>
  );
};
