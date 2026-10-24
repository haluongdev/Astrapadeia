import React, { useState, useEffect } from 'react';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart2,
  FileText,
  Lock,
  ChevronRight,
  Send,
  Flag,
  Sparkles,
  Check,
  X,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Exam, Question, UserExamAnswer, ExamSubmission } from '../types';
import confetti from 'canvas-confetti';

interface MockExamModuleProps {
  onOpenVIPModal: () => void;
  onAskAIQuestion: (question: Question) => void;
}

export const MockExamModule: React.FC<MockExamModuleProps> = ({
  onOpenVIPModal,
  onAskAIQuestion
}) => {
  const {
    exams,
    questions,
    subjects,
    currentUser,
    examSubmissions,
    submitExamOrPractice,
    activeScreenId,
    screenParams,
    navigateTo
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showPreExamModal, setShowPreExamModal] = useState<boolean>(false);
  const [examNotice, setExamNotice] = useState<string | null>(null);

  // Active exam session state
  const [isExamRunning, setIsExamRunning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserExamAnswer>>({});
  const [activePartIndex, setActivePartIndex] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showSubmitWarning, setShowSubmitWarning] = useState<boolean>(false);
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const [lastSubmission, setLastSubmission] = useState<ExamSubmission | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'review_questions' | 'history'>('overview');

  function getExamScopedKey(userId: string) {
    return `scholyx_u_${userId}_active_exam`;
  }

  // Filter exam submissions strictly for current student (Requirement 1 & 3)
  const currentUserSubmissions = React.useMemo(() => {
    return examSubmissions.filter(s => s.userId === currentUser.id);
  }, [examSubmissions, currentUser.id]);

  // Sync route param examId if specified
  useEffect(() => {
    if (screenParams?.examId) {
      const match = exams.find(e => e.id === screenParams.examId);
      if (match) {
        setSelectedExam(match);
      }
    }
  }, [screenParams?.examId, exams]);

  // Sync route with internal state and restore session without fabricating fake submissions
  useEffect(() => {
    if (activeScreenId === 'exam-room') {
      if (!isExamRunning) {
        // Restore session from localStorage if present
        const raw = localStorage.getItem(getExamScopedKey(currentUser.id));
        if (raw) {
          try {
            const savedSession = JSON.parse(raw);
            if (savedSession && savedSession.examId) {
              const matched = exams.find(e => e.id === savedSession.examId);
              if (matched) {
                setSelectedExam(matched);
                setUserAnswers(savedSession.userAnswers || {});
                setActivePartIndex(savedSession.activePartIndex || 0);
                setCurrentQuestionIndex(savedSession.currentQuestionIndex || 0);
                setSecondsRemaining(savedSession.secondsRemaining ?? matched.durationMinutes * 60);
                setIsExamRunning(true);
                return;
              }
            }
          } catch {}
        }

        if (selectedExam) {
          setUserAnswers({});
          setActivePartIndex(0);
          setCurrentQuestionIndex(0);
          const secs = selectedExam.durationMinutes * 60;
          setSecondsRemaining(secs);
          setIsExamRunning(true);
          setLastSubmission(null);
          localStorage.setItem(
            getExamScopedKey(currentUser.id),
            JSON.stringify({
              examId: selectedExam.id,
              userAnswers: {},
              activePartIndex: 0,
              currentQuestionIndex: 0,
              secondsRemaining: secs
            })
          );
        }
      }
    } else if (activeScreenId === 'exam-result') {
      setIsExamRunning(false);
      // If explicit submissionId is passed, view that specific submission
      if (screenParams?.submissionId) {
        const found = currentUserSubmissions.find(s => s.id === screenParams.submissionId) ||
          examSubmissions.find(s => s.id === screenParams.submissionId);
        if (found) {
          setLastSubmission(found);
          return;
        }
      }
      // If user just submitted and lastSubmission belongs to currentUser, keep it!
      if (lastSubmission && lastSubmission.userId === currentUser.id) {
        return;
      }
      // If user has past submissions, show the latest one (index 0, not last index!)
      if (currentUserSubmissions.length > 0) {
        setLastSubmission(currentUserSubmissions[0]);
      } else {
        setLastSubmission(null);
      }
    } else if (activeScreenId === 'exam-catalog') {
      // In catalog
    }
  }, [activeScreenId, exams, isExamRunning, selectedExam, currentUserSubmissions, currentUser.id, screenParams?.submissionId]);

  // Persist exam session progress on answers or timer updates
  useEffect(() => {
    if (isExamRunning && selectedExam) {
      localStorage.setItem(
        getExamScopedKey(currentUser.id),
        JSON.stringify({
          examId: selectedExam.id,
          userAnswers,
          activePartIndex,
          currentQuestionIndex,
          secondsRemaining
        })
      );
    }
  }, [isExamRunning, selectedExam, userAnswers, activePartIndex, currentQuestionIndex, secondsRemaining, currentUser.id]);

  // Filter exams
  const filteredExams = exams.filter(e => {
    return selectedSubject === 'all' || e.subjectId === selectedSubject;
  });

  // Flat list of questions for active exam
  const examQuestions: Question[] = React.useMemo(() => {
    if (!selectedExam) return [];
    const allIds = selectedExam.parts.flatMap(p => p.questionIds);
    return allIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as Question[];
  }, [selectedExam, questions]);

  // Exam countdown timer (BR-EXAM-06, FR-EXAM-07: Auto-submit when time expires)
  useEffect(() => {
    let interval: any;
    if (isExamRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamRunning, secondsRemaining]);

  // Pre-exam modal trigger
  const handleOpenExamInfo = (exam: Exam) => {
    if (exam.accessTier === 'vip' && currentUser.vipTier !== 'vip') {
      onOpenVIPModal();
      return;
    }
    setSelectedExam(exam);
    setShowPreExamModal(true);
  };

  const handleStartExam = () => {
    if (!selectedExam) return;
    setShowPreExamModal(false);
    setUserAnswers({});
    setActivePartIndex(0);
    setCurrentQuestionIndex(0);
    setSecondsRemaining(selectedExam.durationMinutes * 60);
    setIsExamRunning(true);
    setLastSubmission(null);
    navigateTo('exam-room');
  };

  const handleAutoSubmitOnTimeout = () => {
    setExamNotice('Đã hết thời gian làm bài thi! Hệ thống tự động nộp bài với các câu trả lời đã lưu.');
    calculateAndSaveScore();
  };

  const calculateAndSaveScore = () => {
    if (!selectedExam) return;

    let totalPoints = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const partScores: Record<string, number> = {};
    const topicBreakdown: Record<string, { total: number; correct: number }> = {};

    selectedExam.parts.forEach(part => {
      let partPoint = 0;
      part.questionIds.forEach(qId => {
        const q = questions.find(item => item.id === qId);
        if (!q) return;

        if (!topicBreakdown[q.topic]) {
          topicBreakdown[q.topic] = { total: 0, correct: 0 };
        }
        topicBreakdown[q.topic].total += 1;

        const ans = userAnswers[qId];
        if (!ans) {
          unansweredCount++;
          return;
        }

        if (q.type === 'choice') {
          if (ans.selectedOptionIndex === undefined) {
            unansweredCount++;
          } else if (ans.selectedOptionIndex === q.correctOptionIndex) {
            partPoint += 0.25;
            totalPoints += 0.25;
            correctCount++;
            topicBreakdown[q.topic].correct += 1;
          } else {
            wrongCount++;
          }
        } else if (q.type === 'true_false' && q.propositions) {
          const selected = ans.selectedPropositions || {};
          let matches = 0;
          q.propositions.forEach(p => {
            if (selected[p.id] === p.isCorrect) matches++;
          });

          // BR-SCORE-04 per QĐ 764: 1 ý = 0.1, 2 ý = 0.25, 3 ý = 0.5, 4 ý = 1.0
          if (matches === 4) {
            partPoint += 1.0;
            totalPoints += 1.0;
            correctCount++;
            topicBreakdown[q.topic].correct += 1;
          } else if (matches === 3) {
            partPoint += 0.5;
            totalPoints += 0.5;
            wrongCount++;
          } else if (matches === 2) {
            partPoint += 0.25;
            totalPoints += 0.25;
            wrongCount++;
          } else if (matches === 1) {
            partPoint += 0.1;
            totalPoints += 0.1;
            wrongCount++;
          } else {
            wrongCount++;
          }
        } else if (q.type === 'short_answer' && q.shortAnswerKey) {
          if (!ans.shortAnswerText) {
            unansweredCount++;
          } else {
            const uText = ans.shortAnswerText.trim().replace(',', '.');
            const kText = q.shortAnswerKey.trim().replace(',', '.');
            if (uText === kText) {
              partPoint += 0.5;
              totalPoints += 0.5;
              correctCount++;
              topicBreakdown[q.topic].correct += 1;
            } else {
              wrongCount++;
            }
          }
        }
      });
      partScores[part.id] = Number(partPoint.toFixed(2));
    });

    const scaledScore = Number(Math.min(10, totalPoints).toFixed(2));
    const durationSpent = selectedExam ? Math.max(0, (selectedExam.durationMinutes * 60) - secondsRemaining) : 0;
    const subId = `sub-${currentUser.id}-${selectedExam.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const sub: ExamSubmission = {
      id: subId,
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      subjectId: selectedExam.subjectId,
      userId: currentUser.id,
      startedAt: new Date(Date.now() - durationSpent * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      durationSeconds: durationSpent,
      answers: userAnswers,
      score: scaledScore,
      maxScore: selectedExam.maxScore,
      correctCount,
      wrongCount,
      unansweredCount,
      partScores,
      topicBreakdown
    };

    localStorage.removeItem(getExamScopedKey(currentUser.id));
    submitExamOrPractice(sub);
    setLastSubmission(sub);
    setIsExamRunning(false);
    setShowSubmitWarning(false);
    navigateTo('exam-result', { submissionId: sub.id });

    if (scaledScore >= 8.0) {
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  // Warning check for unanswered questions (FR-EXAM-06)
  const handleConfirmSubmit = () => {
    const totalQCount = examQuestions.length;
    const answeredCount = Object.keys(userAnswers).filter(k => {
      const a = userAnswers[k];
      return (
        a.selectedOptionIndex !== undefined ||
        (a.selectedPropositions && Object.keys(a.selectedPropositions).length > 0) ||
        !!a.shortAnswerText
      );
    }).length;

    if (answeredCount < totalQCount) {
      setShowSubmitWarning(true);
    } else {
      calculateAndSaveScore();
    }
  };

  const currentQ = examQuestions[currentQuestionIndex];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-indigo-500/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
            <Award className="w-4 h-4" />
            <span>Phòng Thi Thử Chuẩn Tốt Nghiệp THPT (EXAM)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Đề Thi Biên Soạn Theo Cấu Trúc Bộ GD&ĐT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tính giờ theo máy chủ, chấm tự động 3 phần và tính phổ điểm xếp hạng
          </p>
        </div>

        {isExamRunning && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-base font-bold">
              <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>
                {Math.floor(secondsRemaining / 60)}:
                {String(secondsRemaining % 60).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={handleConfirmSubmit}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Bài Thi</span>
            </button>
          </div>
        )}
      </div>

      {examNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between animate-fadeIn">
          <span>{examNotice}</span>
          <button
            onClick={() => setExamNotice(null)}
            className="text-slate-400 hover:text-white text-xs ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {activeScreenId === 'exam-catalog' || (!isExamRunning && activeScreenId !== 'exam-room' && activeScreenId !== 'exam-result') ? (
        /* Exam Catalog Listing */
        <div className="space-y-6">
          {/* Subject Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedSubject === 'all'
                  ? 'bg-indigo-600 text-white border-cyan-400/50'
                  : 'bg-[#0a0e22] text-slate-300 border-white/5 hover:text-white'
              }`}
            >
              Tất Cả Môn
            </button>
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedSubject === s.id
                    ? 'bg-indigo-600 text-white border-cyan-400/50'
                    : 'bg-[#0a0e22] text-slate-300 border-white/5 hover:text-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Exam Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredExams.map(exam => {
              const isVIP = exam.accessTier === 'vip';
              const isLocked = isVIP && currentUser.vipTier !== 'vip';
              const examSub = examSubmissions.find(s => s.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className="p-6 rounded-2xl cosmic-card border border-white/5 hover:border-indigo-500/30 transition flex flex-col justify-between space-y-4 box-lift"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          exam.isStandardTHPT
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {exam.isStandardTHPT ? 'Chuẩn Bộ GD&ĐT 2025' : 'Đề Chuyên Đề'}
                      </span>
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <Lock className="w-3.5 h-3.5" /> Gói VIP
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">{exam.code}</span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white hover:text-cyan-300 transition">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{exam.description}</p>
                  </div>

                  {/* Exam Specs */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Thời lượng</span>
                      <strong className="text-white">{exam.durationMinutes} phút</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cấu trúc</span>
                      <strong className="text-white">{exam.parts.length} Phần</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Thang điểm</span>
                      <strong className="text-cyan-400">{exam.maxScore}.0 điểm</strong>
                    </div>
                  </div>

                  {/* Submission status or CTA */}
                  <div className="flex items-center justify-between pt-1">
                    {examSub ? (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Đã thi: {examSub.score} điểm
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {exam.totalSubmissions || 850} lượt thi
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenExamInfo(exam)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isLocked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      <span>{isLocked ? 'Mở Khóa VIP' : examSub ? 'Thi Lại' : 'Vào Thi Ngay'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeScreenId === 'exam-result' ? (
        lastSubmission ? (
        /* Exam Results Dashboard with Phổ Điểm & Detailed Question Review (FR-EXAM-10 & 11) */
        <div className="space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#080c1d] border border-white/5 overflow-x-auto">
            <button
              onClick={() => setActiveResultTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeResultTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>1. Tổng Quan Điểm Số</span>
            </button>
            <button
              onClick={() => setActiveResultTab('review_questions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeResultTab === 'review_questions'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Xem Lại Bài Thi & Đáp Án</span>
            </button>
            <button
              onClick={() => setActiveResultTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeResultTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Lịch Sử Các Lần Thi ({currentUserSubmissions.length})</span>
            </button>
          </div>

          {activeResultTab === 'overview' && (
            <div className="p-6 sm:p-8 rounded-2xl cosmic-card border border-indigo-500/30 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  ID: {lastSubmission.id}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">Học sinh: <strong className="text-white">{currentUser.name}</strong></span>
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-cyan-300 block">
                {lastSubmission.examTitle}
              </span>
              <div className="text-6xl font-black text-cyan-300 font-space tracking-tight">
                {lastSubmission.score.toFixed(2)}{' '}
                <span className="text-lg text-slate-400 font-normal">/ 10</span>
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thời gian làm bài: {Math.floor(lastSubmission.durationSeconds / 60)} phút{' '}
                {lastSubmission.durationSeconds % 60} giây • Nộp lúc: {new Date(lastSubmission.submittedAt).toLocaleTimeString('vi-VN')} {new Date(lastSubmission.submittedAt).toLocaleDateString('vi-VN')}
              </p>

              {/* Counts: Dung, Sai, Chua lam */}
              <div className="max-w-xl mx-auto grid grid-cols-3 gap-3 pt-1 text-center">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase">Trả Lời Đúng</div>
                  <div className="text-xl font-black text-emerald-400">{lastSubmission.correctCount} câu</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
                  <div className="text-[10px] text-rose-300 font-bold uppercase">Trả Lời Sai</div>
                  <div className="text-xl font-black text-rose-400">{lastSubmission.wrongCount} câu</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Chưa Làm</div>
                  <div className="text-xl font-black text-slate-300">{lastSubmission.unansweredCount} câu</div>
                </div>
              </div>

              {/* Part Breakdown */}
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {Object.entries(lastSubmission.partScores).map(([pId, pScore], idx) => (
                  <div key={pId} className="p-3 rounded-xl bg-[#0b0f24] border border-white/5 text-left">
                    <div className="text-[10px] text-slate-400 uppercase">Phần {idx + 1}</div>
                    <div className="text-lg font-bold text-cyan-400">{pScore} điểm</div>
                  </div>
                ))}
              </div>

              {/* Simulated Phổ Điểm (FR-EXAM-11, BR-EXAM-12) */}
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-[#080c1d] border border-white/5 text-left space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    Phổ Điểm Toàn Quốc (Mô phỏng thử nghiệm)
                  </span>
                  <span className="text-cyan-300 font-bold">Điểm của bạn: {lastSubmission.score.toFixed(2)}</span>
                </div>
                {/* Histogram bars */}
                <div className="flex items-end gap-1.5 h-20 pt-4">
                  {[15, 28, 45, 80, 140, 220, 280, 240, 160, 60].map((h, i) => {
                    const isUserBucket = Math.floor(lastSubmission.score) === i + 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className={`w-full rounded-t transition ${
                            isUserBucket ? 'bg-cyan-400 shadow-md shadow-cyan-400/50' : 'bg-slate-700/60'
                          }`}
                          style={{ height: `${(h / 280) * 100}%` }}
                        />
                        <span className="text-[9px] text-slate-500">{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveResultTab('review_questions')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition interactive-bounce shadow-lg shadow-cyan-500/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem Chi Tiết Từng Câu Hỏi</span>
                </button>

                <button
                  onClick={() => {
                    setLastSubmission(null);
                    setSelectedExam(null);
                    navigateTo('exam-catalog');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition interactive-bounce"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Danh Sách Đề Thi (13)</span>
                </button>

                <button
                  onClick={() => navigateTo('practice-result')}
                  className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold text-xs flex items-center gap-2 transition interactive-bounce"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Sổ Câu Sai & Luyện Lại (12)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Detailed Question-by-Question Review */}
          {activeResultTab === 'review_questions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl cosmic-card border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Chi Tiết Từng Câu Hỏi & Lời Giải</h4>
                  <p className="text-xs text-slate-400">Xem lại đáp án đã chọn, đáp án chuẩn và lời giải chi tiết</p>
                </div>
                <button
                  onClick={() => setActiveResultTab('overview')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  ← Về tổng quan
                </button>
              </div>

              {examQuestions.map((q, idx) => {
                const ans = lastSubmission.answers[q.id];
                let status: 'correct' | 'wrong' | 'unanswered' = 'unanswered';
                let studentAnsText = 'Chưa làm';

                if (q.type === 'choice') {
                  if (ans?.selectedOptionIndex !== undefined) {
                    studentAnsText = `Đáp án ${['A', 'B', 'C', 'D'][ans.selectedOptionIndex]}: ${q.options?.[ans.selectedOptionIndex] || ''}`;
                    status = ans.selectedOptionIndex === q.correctOptionIndex ? 'correct' : 'wrong';
                  }
                } else if (q.type === 'true_false' && q.propositions) {
                  const sel = ans?.selectedPropositions;
                  if (sel && Object.keys(sel).length > 0) {
                    const allMatch = q.propositions.every(p => sel[p.id] === p.isCorrect);
                    status = allMatch ? 'correct' : 'wrong';
                    studentAnsText = 'Đã chọn Đúng/Sai các ý';
                  }
                } else if (q.type === 'short_answer') {
                  if (ans?.shortAnswerText) {
                    studentAnsText = ans.shortAnswerText;
                    const uVal = ans.shortAnswerText.trim().replace(',', '.');
                    const kVal = (q.shortAnswerKey || '').trim().replace(',', '.');
                    status = uVal === kVal ? 'correct' : 'wrong';
                  }
                }

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl cosmic-card border space-y-3 ${
                      status === 'correct'
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : status === 'wrong'
                        ? 'border-rose-500/30 bg-rose-950/10'
                        : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono">
                          Câu {idx + 1}
                        </span>
                        <span className="text-xs text-slate-400">{q.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            status === 'correct'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : status === 'wrong'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Chưa làm'}
                        </span>
                        <span className="text-xs text-amber-300 font-bold">{q.points}đ</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-100 font-medium whitespace-pre-line">{q.content}</p>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Đáp án của bạn:</span>
                        <span className={`font-semibold ${status === 'correct' ? 'text-emerald-300' : status === 'wrong' ? 'text-rose-300' : 'text-slate-400'}`}>
                          {studentAnsText}
                        </span>
                      </div>
                      {q.type === 'choice' && q.options && q.correctOptionIndex !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Đáp án chính xác:</span>
                          <span className="font-semibold text-emerald-400">
                            {['A', 'B', 'C', 'D'][q.correctOptionIndex]}. {q.options[q.correctOptionIndex]}
                          </span>
                        </div>
                      )}
                      {q.type === 'short_answer' && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Đáp án chính xác:</span>
                          <span className="font-semibold text-emerald-400 font-mono">{q.shortAnswerKey}</span>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-[#080d22] border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                        <strong className="text-cyan-300 block">Lời giải chi tiết:</strong>
                        <p className="whitespace-pre-line leading-relaxed">{q.explanation}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onAskAIQuestion(q)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition border border-cyan-400/30"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Hỏi Trợ Lý AI Về Câu Này</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: History of Past Submissions for Current Student */}
          {activeResultTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl cosmic-card border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Lịch Sử Thi Thử Của Bạn</h4>
                  <p className="text-xs text-slate-400">Hiển thị các lần thi của tài khoản <strong>{currentUser.name}</strong></p>
                </div>
                <span className="text-xs font-bold text-cyan-400">
                  Tổng số: {currentUserSubmissions.length} lần thi
                </span>
              </div>

              {currentUserSubmissions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs cosmic-card rounded-2xl border border-white/5">
                  Bạn chưa có lịch sử thi thử nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUserSubmissions.map((sub, idx) => {
                    const isCurrentActive = lastSubmission.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        className={`p-5 rounded-2xl cosmic-card border space-y-3 transition ${
                          isCurrentActive
                            ? 'border-cyan-400/60 bg-indigo-950/20 shadow-lg shadow-cyan-500/10'
                            : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase">
                            Lần {currentUserSubmissions.length - idx} • {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-xl font-black text-cyan-300 font-space">
                            {sub.score.toFixed(2)}đ
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-white">{sub.examTitle}</h5>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>⏱ {Math.floor(sub.durationSeconds / 60)} phút</span>
                          <span>✓ {sub.correctCount} đúng</span>
                          <span>✗ {sub.wrongCount} sai</span>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              setLastSubmission(sub);
                              setActiveResultTab('overview');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              isCurrentActive
                                ? 'bg-cyan-400 text-slate-950'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            {isCurrentActive ? 'Đang Xem' : 'Xem Chi Tiết Lần Này'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        ) : (
          /* Empty state for exam-result when no submission */
          <div className="p-8 sm:p-12 rounded-3xl cosmic-card border border-indigo-500/30 text-center space-y-4 max-w-xl mx-auto my-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-cyan-300 flex items-center justify-center mx-auto border border-indigo-500/30">
              <BarChart2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white font-space">Chưa Có Kết Quả Bài Thi Thử</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              Bạn chưa hoàn thành bài thi thử nào trong phiên học này. Hãy chọn một đề thi chuẩn Bộ GD&ĐT từ danh mục đề thi để bắt đầu làm bài và đánh giá năng lực!
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('exam-catalog')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 hover:opacity-90 transition cursor-pointer interactive-bounce shadow-lg shadow-cyan-500/20"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Khám Phá Danh Mục Đề Thi (13)</span>
              </button>
            </div>
          </div>
        )
      ) : (
        /* activeScreenId === 'exam-room' */
        isExamRunning && selectedExam ? (
        /* Running Strict Exam Room (FR-EXAM-03..07) */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {currentQ && (
              <div className="p-6 rounded-2xl cosmic-card border border-indigo-500/30 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                      Câu {currentQuestionIndex + 1} / {examQuestions.length}
                    </span>
                    <span className="text-xs text-slate-400">{currentQ.topic}</span>
                  </div>

                  <span className="text-xs text-amber-300 font-bold">
                    Thang điểm: {currentQ.points || 0.25}đ
                  </span>
                </div>

                <p className="text-base text-slate-100 font-medium whitespace-pre-line leading-relaxed">
                  {currentQ.content}
                </p>

                {/* Multiple Choice Options */}
                {currentQ.type === 'choice' && currentQ.options && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = userAnswers[currentQ.id]?.selectedOptionIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setUserAnswers(prev => ({
                              ...prev,
                              [currentQ.id]: {
                                ...prev[currentQ.id],
                                questionId: currentQ.id,
                                selectedOptionIndex: idx
                              }
                            }))
                          }
                          className={`p-3.5 rounded-xl cursor-pointer border text-sm font-medium transition flex items-center gap-3 ${
                            isSelected
                              ? 'bg-indigo-600/30 border-cyan-400 text-white'
                              : 'bg-[#0a0e22] border-white/5 text-slate-300 hover:border-indigo-500/40'
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

                {/* True/False Propositions */}
                {currentQ.type === 'true_false' && currentQ.propositions && (
                  <div className="space-y-2.5">
                    {currentQ.propositions.map(prop => {
                      const curVal = userAnswers[currentQ.id]?.selectedPropositions?.[prop.id];
                      return (
                        <div
                          key={prop.id}
                          className="p-3 rounded-xl bg-[#0a0e22] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <span className="text-slate-200 font-medium flex-1">{prop.text}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const currentProps = userAnswers[currentQ.id]?.selectedPropositions || {};
                                setUserAnswers(prev => ({
                                  ...prev,
                                  [currentQ.id]: {
                                    ...prev[currentQ.id],
                                    questionId: currentQ.id,
                                    selectedPropositions: { ...currentProps, [prop.id]: true }
                                  }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                                curVal === true
                                  ? 'bg-emerald-600 text-white border-emerald-400'
                                  : 'bg-white/5 text-slate-400 border-white/10'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              onClick={() => {
                                const currentProps = userAnswers[currentQ.id]?.selectedPropositions || {};
                                setUserAnswers(prev => ({
                                  ...prev,
                                  [currentQ.id]: {
                                    ...prev[currentQ.id],
                                    questionId: currentQ.id,
                                    selectedPropositions: { ...currentProps, [prop.id]: false }
                                  }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                                curVal === false
                                  ? 'bg-rose-600 text-white border-rose-400'
                                  : 'bg-white/5 text-slate-400 border-white/10'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Input */}
                {currentQ.type === 'short_answer' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-cyan-300 uppercase">
                      Điền kết quả vào phiếu trả lời:
                    </label>
                    <input
                      type="text"
                      value={userAnswers[currentQ.id]?.shortAnswerText || ''}
                      onChange={e =>
                        setUserAnswers(prev => ({
                          ...prev,
                          [currentQ.id]: {
                            ...prev[currentQ.id],
                            questionId: currentQ.id,
                            shortAnswerText: e.target.value
                          }
                        }))
                      }
                      placeholder="Nhập số thập phân hoặc nguyên..."
                      className="w-full sm:w-64 p-3 rounded-xl bg-[#0a0e22] border border-indigo-500/30 text-white font-mono text-base focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-slate-300 transition"
                  >
                    Câu Trước
                  </button>
                  {currentQuestionIndex < examQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
                    >
                      Câu Tiếp Theo
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmSubmit}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition"
                    >
                      Nộp Bài Thi
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Question Grid Navigation */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-4">
              <h4 className="font-bold text-xs uppercase text-slate-300">
                Phiếu Trả Lời Trắc Nghiệm
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {examQuestions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const hasAnswered =
                    ans?.selectedOptionIndex !== undefined ||
                    (ans?.selectedPropositions && Object.keys(ans.selectedPropositions).length > 0) ||
                    !!ans?.shortAnswerText;
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition flex items-center justify-center border ${
                        isCurrent
                          ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60 ring-2 ring-cyan-500/30'
                          : hasAnswered
                          ? 'bg-indigo-600/40 text-white border-indigo-500/40'
                          : 'bg-[#0a0e22] text-slate-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        ) : (
          /* Prompt when entered exam-room without selecting an exam */
          <div className="p-8 sm:p-12 rounded-3xl cosmic-card border border-amber-500/30 text-center space-y-4 max-w-xl mx-auto my-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/30">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white font-space">Chưa Chọn Đề Thi Để Vào Phòng Thi</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              Để bảo đảm tính nghiêm ngặt và tính giờ theo máy chủ chuẩn THPT, vui lòng chọn một đề thi từ Danh mục đề thi để bắt đầu làm bài.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('exam-catalog')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 transition cursor-pointer interactive-bounce shadow-lg shadow-indigo-600/20"
              >
                <ChevronRight className="w-4 h-4" />
                <span>Chọn Đề Thi Trong Danh Mục (13)</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Pre-Exam Specs Modal (FR-EXAM-02) */}
      {showPreExamModal && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl cosmic-card border border-indigo-500/40 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase text-cyan-400 font-mono">
                {selectedExam.code}
              </span>
              <button onClick={() => setShowPreExamModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-white font-space">{selectedExam.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedExam.description}</p>

            {/* Matrix structure */}
            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 space-y-2 text-xs">
              <div className="font-bold text-cyan-300">Cấu trúc các phần thi:</div>
              {selectedExam.parts.map((p, idx) => (
                <div key={p.id} className="flex justify-between py-1 border-b border-white/5 last:border-none">
                  <span className="text-slate-300">
                    Phần {idx + 1}: {p.title}
                  </span>
                  <span className="font-bold text-white">{p.maxScore}đ</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPreExamModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Đóng
              </button>
              <button
                onClick={handleStartExam}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:opacity-90 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Bắt Đầu Làm Bài Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal for Unanswered Questions (FR-EXAM-06) */}
      {showSubmitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl cosmic-card border border-amber-500/40 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Cảnh Báo Chưa Hoàn Thành Bài Thi</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn vẫn còn các câu hỏi chưa được điền đáp án! Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitWarning(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={calculateAndSaveScore}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Xác Nhận Nộp Bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
