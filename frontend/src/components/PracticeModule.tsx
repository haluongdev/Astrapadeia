import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Bot,
  AlertTriangle,
  Play,
  Award,
  Sparkles,
  BookOpen,
  Send,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Question, CognitiveLevel, QuestionType, UserExamAnswer, ExamSubmission } from '../types';
import confetti from 'canvas-confetti';

interface PracticeModuleProps {
  initialSubjectId?: string;
  onOpenVIPModal: () => void;
  onAskAIQuestion: (question: Question) => void;
}

export const PracticeModule: React.FC<PracticeModuleProps> = ({
  initialSubjectId,
  onOpenVIPModal,
  onAskAIQuestion
}) => {
  const {
    subjects,
    questions,
    currentUser,
    submitExamOrPractice,
    submitFeedback,
    activeScreenId,
    screenParams,
    navigateTo
  } = useApp();

  // Builder configuration state
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId || screenParams?.subjectId || 'toan');
  const [selectedGrade, setSelectedGrade] = useState<number>(12);
  const [selectedLevels, setSelectedLevels] = useState<CognitiveLevel[]>(['nhan_biet', 'thong_hieu', 'van_dung']);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['choice', 'true_false', 'short_answer']);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isStudyMode, setIsStudyMode] = useState<boolean>(true); // FR-PRAC-08: xem đáp án ngay
  const [practiceNotice, setPracticeNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setPracticeNotice(msg);
    setTimeout(() => {
      setPracticeNotice(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  // Sync route params
  useEffect(() => {
    if (screenParams?.subjectId && screenParams.subjectId !== subjectId) {
      setSubjectId(screenParams.subjectId);
    }
  }, [screenParams?.subjectId]);

  // Daily quota check for Free user (BR-VIP-02: max 30 questions/day)
  const isFree = currentUser.vipTier === 'free';

  // Active Session state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserExamAnswer>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmission | null>(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Storage key for active practice session
  const practiceSessionKey = `scholyx_u_${currentUser.id}_active_practice`;

  // Restore active practice session on mount if in practice-room
  useEffect(() => {
    if (activeScreenId === 'practice-room') {
      try {
        const saved = localStorage.getItem(practiceSessionKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.sessionQuestions) && parsed.sessionQuestions.length > 0) {
            setSessionQuestions(parsed.sessionQuestions);
            setCurrentIndex(parsed.currentIndex || 0);
            setUserAnswers(parsed.userAnswers || {});
            setRevealedSolutions(parsed.revealedSolutions || {});
            setSecondsElapsed(parsed.secondsElapsed || 0);
            setIsSessionActive(true);
            setIsSubmitted(false);
            setSubjectId(parsed.subjectId || subjectId);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to restore practice session:', e);
      }
    }
  }, [activeScreenId, currentUser.id]);

  // Persist in-progress practice session
  useEffect(() => {
    if (isSessionActive && !isSubmitted && sessionQuestions.length > 0) {
      try {
        localStorage.setItem(
          practiceSessionKey,
          JSON.stringify({
            sessionQuestions,
            currentIndex,
            userAnswers,
            revealedSolutions,
            secondsElapsed,
            subjectId,
            savedAt: Date.now()
          })
        );
      } catch (e) {
        // quota exceeded or storage disabled
      }
    }
  }, [isSessionActive, isSubmitted, sessionQuestions, currentIndex, userAnswers, revealedSolutions, secondsElapsed, subjectId, practiceSessionKey]);

  // Timer
  useEffect(() => {
    let timer: any;
    if (isSessionActive && !isSubmitted) {
      timer = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive, isSubmitted]);

  // Start Practice
  const handleStartPractice = () => {
    const available = questions.filter(q => {
      const matchSub = q.subjectId === subjectId;
      const matchGrade = q.grade === selectedGrade;
      const matchLevel = selectedLevels.includes(q.level);
      const matchType = selectedTypes.includes(q.type);
      return matchSub && matchGrade && matchLevel && matchType;
    });

    const chosen = available.slice(0, questionCount);
    if (chosen.length === 0) {
      showToast('Không tìm thấy câu hỏi phù hợp với bộ lọc đã chọn. Hãy chọn thêm các dạng hoặc môn học khác!');
      return;
    }

    setSessionQuestions(chosen);
    setCurrentIndex(0);
    setUserAnswers({});
    setRevealedSolutions({});
    setSecondsElapsed(0);
    setIsSubmitted(false);
    setSubmissionResult(null);
    setIsSessionActive(true);
    navigateTo('practice-room');
  };

  const handleAbandonPractice = () => {
    try {
      localStorage.removeItem(practiceSessionKey);
    } catch (e) {}
    setIsSessionActive(false);
    setIsSubmitted(false);
    setSessionQuestions([]);
    setShowExitConfirmModal(false);
    navigateTo('practice-setup');
  };

  const currentQ = sessionQuestions[currentIndex];

  // Answers handlers
  const handleSelectChoice = (optionIdx: number) => {
    if (!currentQ || isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        selectedOptionIndex: optionIdx
      }
    }));
  };

  const handleSelectProposition = (propId: string, val: boolean) => {
    if (!currentQ || isSubmitted) return;
    const currentProps = userAnswers[currentQ.id]?.selectedPropositions || {};
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        selectedPropositions: {
          ...currentProps,
          [propId]: val
        }
      }
    }));
  };

  const handleShortAnswerChange = (val: string) => {
    if (!currentQ || isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        shortAnswerText: val
      }
    }));
  };

  const handleEssayChange = (val: string) => {
    if (!currentQ || isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        essayText: val
      }
    }));
  };

  const toggleFlagCurrent = () => {
    if (!currentQ) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        isFlagged: !prev[currentQ.id]?.isFlagged
      }
    }));
  };

  // Submit and calculate score per BR-SCORE
  const handleSubmitPractice = () => {
    let rawScore = 0;
    let maxPossible = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const topicBreakdown: Record<string, { total: number; correct: number }> = {};

    sessionQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { total: 0, correct: 0 };
      }
      topicBreakdown[q.topic].total += 1;

      if (!ans) {
        unansweredCount++;
        maxPossible += 1;
        return;
      }

      if (q.type === 'choice') {
        maxPossible += 1;
        if (ans.selectedOptionIndex === undefined) {
          unansweredCount++;
        } else if (ans.selectedOptionIndex === q.correctOptionIndex) {
          rawScore += 1;
          correctCount++;
          topicBreakdown[q.topic].correct += 1;
        } else {
          wrongCount++;
        }
      } else if (q.type === 'true_false' && q.propositions) {
        maxPossible += 1;
        const selected = ans.selectedPropositions || {};
        const answeredProps = Object.keys(selected).length;
        if (answeredProps === 0) {
          unansweredCount++;
        } else {
          // QĐ 764: 1 ý = 0.1, 2 ý = 0.25, 3 ý = 0.5, 4 ý = 1.0 (BR-SCORE-04)
          let matchCount = 0;
          q.propositions.forEach(p => {
            if (selected[p.id] === p.isCorrect) matchCount++;
          });

          if (matchCount === 4) {
            rawScore += 1.0;
            correctCount++;
            topicBreakdown[q.topic].correct += 1;
          } else if (matchCount === 3) {
            rawScore += 0.5;
            wrongCount++;
          } else if (matchCount === 2) {
            rawScore += 0.25;
            wrongCount++;
          } else if (matchCount === 1) {
            rawScore += 0.1;
            wrongCount++;
          } else {
            wrongCount++;
          }
        }
      } else if (q.type === 'short_answer' && q.shortAnswerKey) {
        maxPossible += 1;
        if (!ans.shortAnswerText) {
          unansweredCount++;
        } else {
          const uText = ans.shortAnswerText.trim().replace(',', '.');
          const kText = q.shortAnswerKey.trim().replace(',', '.');
          if (uText === kText) {
            rawScore += 1;
            correctCount++;
            topicBreakdown[q.topic].correct += 1;
          } else {
            wrongCount++;
          }
        }
      } else if (q.type === 'essay') {
        maxPossible += 1;
        // Essay gets submitted into pending grading queue
        rawScore += 1;
      }
    });

    const scaledScore = maxPossible > 0 ? Number(((rawScore / maxPossible) * 10).toFixed(2)) : 0;

    const subId = `sub-${currentUser.id}-prac-${subjectId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sub: ExamSubmission = {
      id: subId,
      examId: `practice-${subjectId}-${Date.now()}`,
      examTitle: `Luyện tập ${subjects.find(s => s.id === subjectId)?.name || 'THPT'}`,
      subjectId,
      userId: currentUser.id,
      startedAt: new Date(Date.now() - secondsElapsed * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      durationSeconds: secondsElapsed,
      answers: userAnswers,
      score: scaledScore,
      maxScore: 10,
      correctCount,
      wrongCount,
      unansweredCount,
      partScores: { main: scaledScore },
      topicBreakdown
    };

    try {
      localStorage.removeItem(practiceSessionKey);
    } catch (e) {}

    submitExamOrPractice(sub);
    setSubmissionResult(sub);
    setIsSubmitted(true);

    if (scaledScore >= 7.0) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }
  };

  // Feedback report submission (FR-FB-01)
  const handleReportFeedback = () => {
    if (!currentQ || !feedbackText.trim()) return;
    submitFeedback('question_error', feedbackText, currentQ.id);
    setShowFeedbackModal(false);
    setFeedbackText('');
    showToast('Cảm ơn bạn! Ban biên tập QTND sẽ kiểm tra và phản hồi câu hỏi này sớm nhất.');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
            <PenTool className="w-4 h-4" />
            <span>Phòng Luyện Đề Tự Động (PRAC)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Luyện Tập Bám Sát Dạng Đề & Mức Độ Tư Duy
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tự động lưu bài theo tài khoản, chấm chuẩn QĐ 764 và lưu sổ câu sai cá nhân
          </p>
        </div>

        {isSessionActive && !isSubmitted && (
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d20] border border-cyan-500/30 text-cyan-300 font-mono text-sm font-bold">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>
                {Math.floor(secondsElapsed / 60)}:
                {String(secondsElapsed % 60).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setShowExitConfirmModal(true)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-bold transition"
            >
              Rời Phòng
            </button>
            <button
              onClick={handleSubmitPractice}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/30 hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Bài</span>
            </button>
          </div>
        )}
      </div>

      {practiceNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between animate-fadeIn">
          <span>{practiceNotice}</span>
          <button
            onClick={() => setPracticeNotice(null)}
            className="text-slate-400 hover:text-white text-xs ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl cosmic-card border border-rose-500/40 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-white text-base">Rời Khỏi Phòng Luyện Tập?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Phiên làm bài hiện tại đã được hệ thống tự động lưu vào bộ nhớ tạm của tài khoản của bạn. Bạn muốn tiếp tục làm, lưu lại để quay lại sau hay nộp bài ngay?
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
              >
                Tiếp Tục Làm
              </button>
              <button
                onClick={handleAbandonPractice}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
              >
                Thoát & Xóa Phiên
              </button>
              <button
                onClick={() => {
                  setShowExitConfirmModal(false);
                  handleSubmitPractice();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Nộp Bài Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guard for practice-room when no active session */}
      {activeScreenId === 'practice-room' && !isSessionActive && !isSubmitted ? (
        <div className="p-8 sm:p-12 rounded-2xl cosmic-card border border-indigo-500/30 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <PenTool className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white font-space">Chưa Có Phiên Luyện Tập Hợp Lệ</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bạn chưa bắt đầu bài luyện nào hoặc phiên luyện tập trước đó đã hoàn thành. Vui lòng thiết lập cấu hình đề để bắt đầu làm bài mới.
          </p>
          <button
            onClick={() => navigateTo('practice-setup')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition interactive-bounce"
          >
            Đến Cấu Hình Luyện Tập →
          </button>
        </div>
      ) : null}

      {/* Builder screen when not in session and not empty-room prompt */}
      {!isSessionActive && activeScreenId !== 'practice-room' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Form */}
          <div className="lg:col-span-2 p-6 rounded-2xl cosmic-card border border-white/5 space-y-5">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Cấu Hình Bài Luyện Tập Cá Nhân Hóa (FR-PRAC-01)
            </h3>

            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">1. Chọn Môn Học:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSubjectId(s.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border transition flex items-center justify-between ${
                      subjectId === s.id
                        ? 'bg-indigo-600/40 text-cyan-300 border-cyan-400/50'
                        : 'bg-[#0a0e22] text-slate-300 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span>{s.name}</span>
                    {subjectId === s.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Cognitive Levels */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                2. Mức Độ Nhận Thức (Tư Duy):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'nhan_biet' as CognitiveLevel, label: 'Nhận Biết (40%)', desc: 'Định nghĩa, công thức' },
                  { id: 'thong_hieu' as CognitiveLevel, label: 'Thông Hiểu (30%)', desc: 'Áp dụng cơ bản' },
                  { id: 'van_dung' as CognitiveLevel, label: 'Vận Dụng (30%)', desc: 'Tổng hợp & bài toán khó' }
                ].map(lvl => {
                  const isChecked = selectedLevels.includes(lvl.id);
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        if (isChecked && selectedLevels.length > 1) {
                          setSelectedLevels(prev => prev.filter(x => x !== lvl.id));
                        } else if (!isChecked) {
                          setSelectedLevels(prev => [...prev, lvl.id]);
                        }
                      }}
                      className={`p-3 rounded-xl text-left border transition ${
                        isChecked
                          ? 'bg-indigo-600/25 border-indigo-500/40 text-slate-100'
                          : 'bg-[#0a0e22] border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">{lvl.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Formats (FR-PRAC-02 & 03) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                3. Định Dạng Câu Hỏi (Chuẩn QĐ 764):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'choice' as QuestionType, label: 'Nhiều Lựa Chọn (4 phương án)' },
                  { id: 'true_false' as QuestionType, label: 'Đúng / Sai (4 ý a, b, c, d)' },
                  { id: 'short_answer' as QuestionType, label: 'Trả Lời Ngắn (Điền số)' }
                ].map(t => {
                  const isChecked = selectedTypes.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (isChecked && selectedTypes.length > 1) {
                          setSelectedTypes(prev => prev.filter(x => x !== t.id));
                        } else if (!isChecked) {
                          setSelectedTypes(prev => [...prev, t.id]);
                        }
                      }}
                      className={`p-3 rounded-xl text-left border transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                          : 'bg-[#0a0e22] border-white/5 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold">{t.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question count and mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Số lượng câu hỏi:
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        questionCount === cnt
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-[#0a0e22] text-slate-400 border-white/5'
                      }`}
                    >
                      {cnt} câu
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Chế độ luyện tập (FR-PRAC-08):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsStudyMode(true)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      isStudyMode
                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                        : 'bg-[#0a0e22] text-slate-400 border-white/5'
                    }`}
                  >
                    Xem giải ngay
                  </button>
                  <button
                    onClick={() => setIsStudyMode(false)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      !isStudyMode
                        ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200'
                        : 'bg-[#0a0e22] text-slate-400 border-white/5'
                    }`}
                  >
                    Bấm giờ thi
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartPractice}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Khởi Tạo & Bắt Đầu Luyện Tập</span>
            </button>
          </div>

          {/* Right Info Box */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-3">
              <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Hạn Mức & Quyền Lợi Luyện Tập
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Cấp tài khoản:</span>
                  <span className="font-bold text-white capitalize">{currentUser.vipTier === 'vip' ? 'VIP' : 'Miễn Phí'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Số câu luyện tập/ngày:</span>
                  <span className="font-bold text-emerald-400">
                    {currentUser.vipTier === 'vip' ? 'Không giới hạn' : 'Tối đa 30 câu'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Sổ câu sai:</span>
                  <span className="font-bold text-indigo-300">
                    {currentUser.vipTier === 'vip' ? 'Vô hạn' : 'Lưu tối đa 50 câu'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Phương pháp lời giải:</span>
                  <span className="font-bold text-amber-300">
                    {currentUser.vipTier === 'vip' ? 'Đầy đủ & Casio' : 'Rút gọn'}
                  </span>
                </div>
              </div>

              {isFree && (
                <button
                  onClick={onOpenVIPModal}
                  className="w-full mt-2 py-2 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold transition"
                >
                  Mở Khóa Luyện Không Giới Hạn →
                </button>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Quy tắc tính điểm chuẩn QĐ 764:
              </div>
              <p className="text-slate-400 leading-relaxed">
                Đối với câu hỏi trắc nghiệm Đúng/Sai 4 ý: Thí sinh chọn đúng 1 ý = 0.1đ; đúng 2 ý = 0.25đ; đúng 3 ý = 0.5đ; đúng trọn vẹn 4 ý = 1.0đ.
              </p>
            </div>
          </div>
        </div>
      ) : isSubmitted && submissionResult ? (
        /* Result Screen (FR-PRAC-07) */
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl cosmic-card border border-indigo-500/30 text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
              Kết Quả Bài Luyện Tập
            </h3>
            <div className="text-5xl font-black text-cyan-400 font-space tracking-tight">
              {submissionResult.score.toFixed(1)}{' '}
              <span className="text-lg text-slate-400 font-normal">/ 10</span>
            </div>

            {/* Quick Metrics */}
            <div className="max-w-md mx-auto grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0b0f24] border border-white/5">
                <div className="text-lg font-bold text-emerald-400">{submissionResult.correctCount}</div>
                <div className="text-[11px] text-slate-400">Câu Đúng</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0b0f24] border border-white/5">
                <div className="text-lg font-bold text-rose-400">{submissionResult.wrongCount}</div>
                <div className="text-[11px] text-slate-400">Câu Sai (Đã lưu sổ)</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0b0f24] border border-white/5">
                <div className="text-lg font-bold text-slate-400">{submissionResult.unansweredCount}</div>
                <div className="text-[11px] text-slate-400">Chưa Làm</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsSessionActive(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm Bài Khác</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white">Xem Lại Lời Giải Chi Tiết Từng Câu</h4>
            {sessionQuestions.map((q, idx) => {
              const ans = userAnswers[q.id];
              return (
                <div key={q.id} className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-cyan-300">Câu {idx + 1}: {q.topic}</span>
                    <span className="capitalize">{q.type.replace('_', ' ')}</span>
                  </div>

                  <p className="text-sm text-slate-100 font-medium whitespace-pre-line">{q.content}</p>

                  {/* Question Options or Sub-items */}
                  {q.type === 'choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOpt = oIdx === q.correctOptionIndex;
                        const isUserChoice = ans?.selectedOptionIndex === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border ${
                              isCorrectOpt
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                                : isUserChoice
                                ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                                : 'bg-[#0a0e22] border-white/5 text-slate-300'
                            }`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Solution block */}
                  <div className="p-3.5 rounded-xl bg-[#090d20] border border-cyan-500/20 text-xs space-y-1.5">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Lời giải chi tiết:</span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Running Practice Test Session (FR-PRAC-04) */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Panel (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            {currentQ && (
              <div className="p-6 rounded-2xl cosmic-card border border-indigo-500/30 space-y-5">
                {/* Header row */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                      Câu {currentIndex + 1} / {sessionQuestions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {currentQ.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ask AI Context button (FR-AI-07) */}
                    <button
                      onClick={() => onAskAIQuestion(currentQ)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      title="Hỏi Trợ lý AI Cosmos giải thích câu này"
                    >
                      <Bot className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="hidden sm:inline">Hỏi AI câu này</span>
                    </button>

                    {/* Report Error button (FR-FB-01) */}
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                      title="Báo lỗi câu hỏi (FR-FB-01)"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>

                    {/* Flag button */}
                    <button
                      onClick={toggleFlagCurrent}
                      className={`p-1.5 rounded-lg transition ${
                        userAnswers[currentQ.id]?.isFlagged
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title="Đánh dấu xem lại trước khi nộp"
                    >
                      <Flag className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="text-base text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                  {currentQ.content}
                </div>

                {/* Question Type 1: 4 Options Choice */}
                {currentQ.type === 'choice' && currentQ.options && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = userAnswers[currentQ.id]?.selectedOptionIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectChoice(idx)}
                          className={`p-3.5 rounded-xl cursor-pointer border text-sm font-medium transition flex items-center gap-3 box-lift-subtle interactive-bounce ${
                            isSelected
                              ? 'bg-indigo-600/30 border-cyan-400 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-[#0a0e22] border-white/5 text-slate-300 hover:border-indigo-500/40 hover:text-white'
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
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Question Type 2: True/False with 4 propositions per QĐ 764 */}
                {currentQ.type === 'true_false' && currentQ.propositions && (
                  <div className="space-y-3">
                    <p className="text-xs text-cyan-300 font-bold uppercase">
                      Chọn Đúng hoặc Sai cho từng mệnh đề sau:
                    </p>
                    <div className="space-y-2">
                      {currentQ.propositions.map(prop => {
                        const curPropVal = userAnswers[currentQ.id]?.selectedPropositions?.[prop.id];
                        return (
                          <div
                            key={prop.id}
                            className="p-3 rounded-xl bg-[#0a0e22] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <span className="text-slate-200 font-medium flex-1">{prop.text}</span>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                onClick={() => handleSelectProposition(prop.id, true)}
                                className={`px-3 py-1.5 rounded-lg font-bold border transition flex items-center gap-1 ${
                                  curPropVal === true
                                    ? 'bg-emerald-600 text-white border-emerald-400'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Đúng</span>
                              </button>
                              <button
                                onClick={() => handleSelectProposition(prop.id, false)}
                                className={`px-3 py-1.5 rounded-lg font-bold border transition flex items-center gap-1 ${
                                  curPropVal === false
                                    ? 'bg-rose-600 text-white border-rose-400'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Sai</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Type 3: Short Answer Input */}
                {currentQ.type === 'short_answer' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-cyan-300 uppercase">
                      Nhập kết quả số (Chấp nhận cả dấu . và ,):
                    </label>
                    <input
                      type="text"
                      value={userAnswers[currentQ.id]?.shortAnswerText || ''}
                      onChange={e => handleShortAnswerChange(e.target.value)}
                      placeholder="Ví dụ: 0.64 hoặc 12"
                      className="w-full sm:w-64 p-3 rounded-xl bg-[#0a0e22] border border-indigo-500/30 text-white font-mono text-base focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Question Type 4: Essay Input */}
                {currentQ.type === 'essay' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-cyan-300 uppercase">
                      Nhập bài làm tự luận của bạn:
                    </label>
                    <textarea
                      rows={6}
                      value={userAnswers[currentQ.id]?.essayText || ''}
                      onChange={e => handleEssayChange(e.target.value)}
                      placeholder="Trình bày bài làm chi tiết tại đây..."
                      className="w-full p-4 rounded-xl bg-[#0a0e22] border border-indigo-500/30 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Chế độ học tập: nút xem giải ngay (FR-PRAC-08) */}
                {isStudyMode && (
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() =>
                        setRevealedSolutions(prev => ({
                          ...prev,
                          [currentQ.id]: !prev[currentQ.id]
                        }))
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{revealedSolutions[currentQ.id] ? 'Ẩn lời giải' : 'Xem đáp án & lời giải ngay'}</span>
                    </button>

                    {revealedSolutions[currentQ.id] && (
                      <div className="mt-3 p-4 rounded-xl bg-[#070b1d] border border-cyan-500/20 text-xs space-y-2 animate-fadeIn">
                        <div className="font-bold text-cyan-300">💡 Hướng dẫn & Lời giải:</div>
                        <p className="text-slate-300 whitespace-pre-line leading-relaxed">{currentQ.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Câu Trước</span>
                  </button>

                  {currentIndex < sessionQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition"
                    >
                      <span>Câu Tiếp Theo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitPractice}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 hover:opacity-90 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Hoàn Tất & Nộp Bài</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Question Navigation Matrix (1 Col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Bảng Điều Hướng Câu Hỏi
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {sessionQuestions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const hasAnswered =
                    ans?.selectedOptionIndex !== undefined ||
                    (ans?.selectedPropositions && Object.keys(ans.selectedPropositions).length > 0) ||
                    !!ans?.shortAnswerText ||
                    !!ans?.essayText;
                  const isCurrent = idx === currentIndex;
                  const isFlagged = ans?.isFlagged;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-9 h-9 rounded-xl font-bold text-xs transition flex items-center justify-center border ${
                        isCurrent
                          ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60 ring-2 ring-cyan-500/30'
                          : hasAnswered
                          ? 'bg-indigo-600/40 text-white border-indigo-500/40'
                          : 'bg-[#0a0e22] text-slate-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-600/40 border border-indigo-500/40" />
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#0a0e22] border border-white/10" />
                  <span>Chưa trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Đánh dấu xem lại</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal (FR-FB-01) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl cosmic-card border border-indigo-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Báo Lỗi Câu Hỏi
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Nhập chi tiết về sai sót nội dung, đáp án hoặc hình ảnh để đội ngũ QTND kiểm tra:
            </p>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Ví dụ: Đề bài câu này bị thiếu điều kiện mẫu số x khác 0..."
              className="w-full p-3 rounded-xl bg-[#090d20] border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                onClick={handleReportFeedback}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Gửi Phản Hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
