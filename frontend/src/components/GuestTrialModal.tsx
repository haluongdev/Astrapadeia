import React, { useState } from 'react';
import { Play, Check, X, RotateCcw, Award, Sparkles, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GuestTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpAsStudent: () => void;
}

export const GuestTrialModal: React.FC<GuestTrialModalProps> = ({
  isOpen,
  onClose,
  onSignUpAsStudent
}) => {
  const { questions } = useApp();
  const trialQuestions = questions.slice(0, 5); // 5 sample questions for guest trial

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = trialQuestions[currentIndex];

  const handleSelect = (idx: number) => {
    if (!currentQ || showResult) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: idx }));
  };

  const handleFinishTrial = () => {
    setShowResult(true);
  };

  const correctCount = trialQuestions.filter(
    q => selectedAnswers[q.id] === q.correctOptionIndex
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl cosmic-card border border-cyan-500/40 relative my-auto space-y-5 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {!showResult ? (
          <>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                Làm Thử Công Khai (FR-PRAC-13)
              </span>
              <h3 className="text-xl font-bold text-white font-space mt-2">
                Trải Nghiệm Đề Thi Thử THPT Miễn Phí
              </h3>
              <p className="text-xs text-slate-400">
                Dành cho khách tham quan. Kết quả làm thử sẽ không lưu vào hồ sơ cá nhân.
              </p>
            </div>

            {currentQ && (
              <div className="p-5 rounded-2xl bg-[#090d20] border border-white/5 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-cyan-300">Câu {currentIndex + 1} / {trialQuestions.length}</span>
                  <span>{currentQ.topic}</span>
                </div>

                <p className="text-sm text-slate-100 font-medium whitespace-pre-line leading-relaxed">
                  {currentQ.content}
                </p>

                {currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedAnswers[currentQ.id] === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          className={`p-3 rounded-xl cursor-pointer border text-xs font-medium transition flex items-center gap-3 ${
                            isSelected
                              ? 'bg-indigo-600/30 border-cyan-400 text-white'
                              : 'bg-[#0c1126] border-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                                : 'border-slate-500 text-slate-400'
                            }`}
                          >
                            {['A', 'B', 'C', 'D'][idx]}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-300 disabled:opacity-30"
              >
                Câu trước
              </button>

              {currentIndex < trialQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Câu tiếp theo
                </button>
              ) : (
                <button
                  onClick={handleFinishTrial}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Xem Kết Quả Làm Thử
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/20 text-cyan-300">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white font-space">
              Hoàn Thành Bài Làm Thử!
            </h3>
            <p className="text-sm text-slate-200">
              Bạn đã trả lời đúng <strong className="text-cyan-400 text-base">{correctCount} / {trialQuestions.length}</strong> câu hỏi.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Đăng ký tài khoản Học Sinh chính thức để lưu lịch sử, nhận phân tích chủ đề yếu và lộ trình luyện thi cá nhân hóa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  setShowResult(false);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
              <button
                onClick={() => {
                  onSignUpAsStudent();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng Ký Tài Khoản Học Sinh Ngay</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
