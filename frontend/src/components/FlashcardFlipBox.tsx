import React, { useState } from 'react';
import { RotateCw, Sparkles, BookOpen, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  frontTitle: string;
  frontContent: string;
  frontHint?: string;
  backAnswer: string;
  backMethod: string;
  color: string;
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subject: 'Toán Học 12',
    topic: 'Khảo Sát Hàm Số',
    frontTitle: 'Đạo hàm hàm phân thức bậc 1 / bậc 1',
    frontContent: 'Cho hàm số y = (ax + b) / (cx + d). Tính đạo hàm y\' và điều kiện đồng biến trên từng khoảng xác định?',
    frontHint: 'Chạm để lật xem công thức tính nhanh ad - bc...',
    backAnswer: 'y\' = (ad - bc) / (cx + d)²',
    backMethod: 'Hàm số đồng biến trên từng khoảng (-∞; -d/c) và (-d/c; +∞) khi ad - bc > 0. KHÔNG BAO GIỜ đồng biến trên R!',
    color: 'from-blue-600/30 to-indigo-600/30 border-indigo-500/40'
  },
  {
    id: 'fc-2',
    subject: 'Vật Lí 12',
    topic: 'Vật Lí Nhiệt',
    frontTitle: 'Công thức định luật 1 Nhiệt Động Lực Học',
    frontContent: 'Biểu thức nguyên lý I nhiệt động học: ΔU = A + Q. Quy ước dấu của A và Q khi nào mang dấu dương (+)?',
    frontHint: 'Chạm để lật xem quy ước dấu năng lượng...',
    backAnswer: 'Q > 0: Hệ nhận nhiệt lượng; A > 0: Hệ nhận công từ bên ngoài.',
    backMethod: 'Ngược lại: Q < 0 (hệ truyền nhiệt lượng), A < 0 (hệ sinh công ra môi trường ngoài).',
    color: 'from-cyan-600/30 to-blue-600/30 border-cyan-500/40'
  },
  {
    id: 'fc-3',
    subject: 'Toán Học 12',
    topic: 'Toạ Độ Không Gian Oxyz',
    frontTitle: 'Khoảng cách từ điểm M(x₀, y₀, z₀) đến mặt phẳng (P)',
    frontContent: 'Mặt phẳng (P): Ax + By + Cz + D = 0. Công thức tính khoảng cách d(M, (P)) là gì?',
    frontHint: 'Chạm để lật xem công thức toạ độ...',
    backAnswer: 'd(M, (P)) = |Ax₀ + By₀ + Cz₀ + D| / √(A² + B² + C²)',
    backMethod: 'Lưu ý: Mẫu số luôn là độ dài vectơ pháp tuyến √(A² + B² + C²), tử số là trị tuyệt đối khi thay toạ độ M.',
    color: 'from-purple-600/30 to-pink-600/30 border-purple-500/40'
  },
  {
    id: 'fc-4',
    subject: 'Hóa Học 12',
    topic: 'Ester - Lipid',
    frontTitle: 'Phản ứng xà phòng hóa chất béo Triglyceride',
    frontContent: 'Thuỷ phân hoàn toàn 1 mol Triglyceride trong dung dịch NaOH đun nóng thu được bao nhiêu mol muối và glycerol?',
    frontHint: 'Chạm để lật xem tỉ lệ phản ứng xà phòng hóa...',
    backAnswer: '1 mol Triglyceride + 3 mol NaOH → 3 mol muối muối xà phòng + 1 mol Glycerol C₃H₅(OH)₃.',
    backMethod: 'Bảo toàn khối lượng: m_chất béo + m_NaOH = m_xà phòng + m_glycerol.',
    color: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/40'
  }
];

export const FlashcardFlipBox: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = SAMPLE_FLASHCARDS[currentIndex];

  const handleNext = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % SAMPLE_FLASHCARDS.length);
    }, 150);
  };

  const handlePrev = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + SAMPLE_FLASHCARDS.length) % SAMPLE_FLASHCARDS.length);
    }, 150);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white font-space flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Hộp Flashcard 3D Lật Mặt (Card Flipping)
          </h4>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>{currentIndex + 1} / {SAMPLE_FLASHCARDS.length}</span>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handlePrev}
              onKeyDown={e => e.stopPropagation()}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition interactive-bounce focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
              title="Thẻ trước"
              aria-label="Thẻ ghi nhớ trước đó"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              onKeyDown={e => e.stopPropagation()}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition interactive-bounce focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
              title="Thẻ tiếp theo"
              aria-label="Thẻ ghi nhớ tiếp theo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Flip Container */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Thẻ ghi nhớ: ${card.frontTitle}. Bấm phím cách hoặc Enter để lật mặt xem đáp án.`}
        aria-pressed={isFlipped}
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped(prev => !prev);
          }
        }}
        className="flip-container h-52 w-full cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] rounded-2xl"
      >
        <div className={`flipper w-full h-full ${isFlipped ? 'flipped' : ''}`}>
          {/* Front Face */}
          <div
            className={`front w-full h-full rounded-2xl p-5 cosmic-glass border bg-gradient-to-br ${card.color} flex flex-col justify-between shadow-lg`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                  {card.subject} • {card.topic}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-cyan-300 transition">
                  <RotateCw className="w-3 h-3 group-hover:rotate-180 transition duration-500" />
                  Bấm để lật xem đáp án
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                {card.frontTitle}
              </h5>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {card.frontContent}
              </p>
            </div>

            <div className="text-[11px] text-cyan-300/80 italic flex items-center gap-1">
              <span>💡 {card.frontHint}</span>
            </div>
          </div>

          {/* Back Face (Answer & Method) */}
          <div
            className="back w-full h-full rounded-2xl p-5 cosmic-glass border border-cyan-400/50 bg-gradient-to-br from-[#0c1333] via-[#0f173d] to-[#151c45] flex flex-col justify-between shadow-2xl"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đáp Án Chuẩn & Mẹo Ghi Nhớ
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Bấm để lật lại
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 text-cyan-200 font-mono text-xs sm:text-sm font-bold mb-2">
                {card.backAnswer}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {card.backMethod}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
              <span>Tổ chuyên môn Scholyx biên soạn</span>
              <span className="text-cyan-300">Đã lưu vào bộ nhớ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
