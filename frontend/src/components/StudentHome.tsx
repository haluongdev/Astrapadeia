import React from 'react';
import {
  Flame,
  Clock,
  Target,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Bot,
  Zap,
  TrendingUp,
  Compass,
  Star,
  Video,
  FileText,
  Layers,
  AlertOctagon,
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  UserCheck,
  GraduationCap,
  PenTool
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CosmicCountdown } from './CosmicCountdown';
import { TypingEffect } from './TypingEffect';
import { FlashcardFlipBox } from './FlashcardFlipBox';
import { ScreenId } from '../types';

interface StudentHomeProps {
  onStartPractice: (subjectId?: string) => void;
  onOpenExam: (examId?: string) => void;
  onOpenGuestTrial: () => void;
  onOpenVIPModal: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  onStartPractice,
  onOpenExam,
  onOpenGuestTrial,
  onOpenVIPModal
}) => {
  const {
    currentUser,
    completedLessonIds,
    lessons,
    subjects,
    exams,
    mistakeItems,
    weakTopics,
    weeklyPlan,
    toggleTaskCompletion,
    navigateTo,
    setActiveLessonId,
    setActiveExamId
  } = useApp();

  const isGuest = currentUser.role === 'guest';
  const unresolvedMistakes = mistakeItems.filter(m => !m.resolved);

  // In-progress lesson for Bento Box (FR-CONT-10) - find first uncompleted or last studied
  const lastLesson = lessons.find(l => !completedLessonIds.includes(l.id)) || lessons[0];

  const heroTypingSlogans = [
    'Hệ Thống Học Tập & Ôn Luyện Chuẩn GDPT 2018',
    'Cấu Trúc Đề Mới 3 Phần Chuẩn Bộ GD&ĐT',
    'Trợ Lý AI Cosmos Đồng Hành 24/7',
    'Lộ Trình Cá Nhân Hóa Thích Ứng Năng Lực'
  ];

  // 8 Quick Access Feature Cards (Yêu cầu 4 & Ưu tiên 3)
  const featureCards: Array<{
    id: ScreenId;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    iconColor: string;
    badge?: string;
    params?: Record<string, any>;
  }> = [
    {
      id: 'lessons',
      title: 'Khóa Ôn Luyện',
      description: 'Kho bài giảng GDPT 2018 theo chương mục và lý thuyết trọng tâm',
      icon: BookOpen,
      color: 'from-blue-600/20 to-indigo-600/30 border-blue-500/30 hover:border-blue-400',
      iconColor: 'text-blue-400 bg-blue-500/10'
    },
    {
      id: 'practice-setup',
      title: 'Luyện Tập Theo Chủ Đề',
      description: 'Luyện trắc nghiệm 3 dạng chuẩn QĐ 764 theo nhận biết, thông hiểu, vận dụng',
      icon: PenTool,
      color: 'from-cyan-600/20 to-teal-600/30 border-cyan-500/30 hover:border-cyan-400',
      iconColor: 'text-cyan-400 bg-cyan-500/10'
    },
    {
      id: 'exam-catalog',
      title: 'Thi Thử THPT',
      description: 'Phòng thi thử chuẩn cấu trúc 3 phần, tính giờ máy chủ và xếp hạng phổ điểm',
      icon: Award,
      color: 'from-amber-600/20 to-orange-600/30 border-amber-500/30 hover:border-amber-400',
      iconColor: 'text-amber-400 bg-amber-500/10',
      badge: 'CHUẨN 2026'
    },
    {
      id: 'ai',
      title: 'Trợ Lý AI Cosmos',
      description: 'Hỏi đáp kiến thức có trích dẫn nguồn SGK đã duyệt qua công nghệ RAG',
      icon: Bot,
      color: 'from-purple-600/20 to-pink-600/30 border-purple-500/30 hover:border-purple-400',
      iconColor: 'text-purple-400 bg-purple-500/10',
      badge: 'AI RAG'
    },
    {
      id: 'practice-result',
      title: 'Sổ Câu Sai Tự Động',
      description: 'Tự động thu thập câu sai để rèn luyện khắc phục triệt để lỗ hổng',
      icon: AlertOctagon,
      color: 'from-rose-600/20 to-red-600/30 border-rose-500/30 hover:border-rose-400',
      iconColor: 'text-rose-400 bg-rose-500/10',
      badge: unresolvedMistakes.length > 0 ? `${unresolvedMistakes.length} câu` : undefined
    },
    {
      id: 'review-progress',
      title: 'Tiến Độ Học Tập',
      description: 'Dashboard thống kê tiến độ, tỷ lệ đúng, chủ đề yếu và biểu đồ năng lực',
      icon: BarChart3,
      color: 'from-emerald-600/20 to-green-600/30 border-emerald-500/30 hover:border-emerald-400',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      params: { tab: 'progress' }
    },
    {
      id: 'review-progress',
      title: 'Ôn Tập Tổng Hợp',
      description: 'Sổ tay công thức cốt lõi, bẫy lý thuyết và các mốc thời gian thi 2026',
      icon: Layers,
      color: 'from-indigo-600/20 to-violet-600/30 border-indigo-500/30 hover:border-indigo-400',
      iconColor: 'text-indigo-400 bg-indigo-500/10',
      params: { tab: 'review' }
    },
    {
      id: 'vip-roadmap',
      title: 'Lộ Trình Cá Nhân Hóa',
      description: 'Lộ trình tuần thích ứng tự động tối ưu hóa theo năng lực và số giờ học/ngày',
      icon: Calendar,
      color: 'from-amber-600/20 to-yellow-600/30 border-amber-500/30 hover:border-amber-400',
      iconColor: 'text-amber-400 bg-amber-500/10',
      badge: 'VIP'
    }
  ];

  // Active enrolled courses calculated dynamically from actual activity (Yêu cầu Ưu tiên 3.5)
  const enrolledCourses = subjects.slice(0, 5).map(s => {
    const subjectLessons = lessons.filter(l => l.subjectId === s.id);
    const totalLessons = subjectLessons.length;
    const completedCount = subjectLessons.filter(l => completedLessonIds.includes(l.id)).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      id: s.id,
      name: s.name + ' 12',
      progress: progressPercent,
      completed: completedCount,
      total: totalLessons,
      isCompulsory: s.isCompulsory
    };
  });

  return (
    <div className="space-y-10 pb-16">
      {/* ========================================================= */}
      {/* 1. HERO BANNER NỔI BẬT (Yêu cầu mục 3)                    */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 cosmic-card border border-indigo-500/30 animated-cosmic-gradient box-lift">
        {/* Ambient atmospheric cosmic glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Kỳ Thi Tốt Nghiệp THPT 2026 Chuẩn Bộ GD&ĐT (ISO/IEC/IEEE 29148)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-space tracking-tight text-white leading-tight">
            SCHOLYX – VŨ TRỤ TRI THỨC
          </h1>

          <div className="text-base sm:text-xl font-bold font-space bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            <TypingEffect phrases={heroTypingSlogans} />
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl pt-1">
            Hệ thống học tập, ôn luyện và thi thử tốt nghiệp THPT chuẩn Chương trình GDPT 2018. Tích hợp cấu trúc đề thi 3 phần chuẩn Bộ GD&ĐT (Trắc nghiệm nhiều lựa chọn, Đúng/Sai 4 ý, Trả lời ngắn), ngân hàng câu hỏi phân cấp tư duy và Trợ lý AI Cosmos giải đáp tức thì theo kho tri thức sách giáo khoa.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => navigateTo('lessons')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition interactive-bounce box-lift-subtle"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>Bắt Đầu Ôn Luyện</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => navigateTo('exam-catalog')}
              className="px-6 py-3.5 rounded-2xl cosmic-glass text-white hover:text-cyan-300 hover:border-cyan-400/50 font-bold text-xs sm:text-sm transition flex items-center gap-2 interactive-bounce"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Thi Thử Ngay</span>
            </button>

            <button
              onClick={() => navigateTo('ai')}
              className="px-4 py-3.5 rounded-2xl bg-[#0f1433] border border-indigo-500/30 text-indigo-200 hover:text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 interactive-bounce"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Hỏi Trợ Lý AI</span>
            </button>

            {isGuest && (
              <button
                onClick={onOpenGuestTrial}
                className="px-4 py-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 interactive-bounce"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Làm Thử 10 Câu (Khách)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. ĐẾM NGƯỢC THI THIÊN HÀ WIDGET                          */}
      {/* ========================================================= */}
      <div className="box-lift">
        <CosmicCountdown />
      </div>

      {/* ========================================================= */}
      {/* 3. KHÁM PHÁ CHỨC NĂNG (8 Quick Access Cards - Yêu cầu 4)  */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Trung Tâm Điều Hướng Toàn Diện</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
              Khám Phá Chức Năng Hệ Thống
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Truy cập nhanh 8 module học tập và ôn thi tốt nghiệp THPT chuẩn GDPT 2018
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id + card.title}
                onClick={() => navigateTo(card.id, card.params)}
                className={`group p-5 rounded-2xl cosmic-card border bg-gradient-to-br ${card.color} transition cursor-pointer flex flex-col justify-between space-y-3 box-lift relative overflow-hidden`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition group-hover:scale-110 shadow-sm ${card.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {card.badge && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-cyan-400 font-semibold">
                  <span>Khám phá ngay</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. HÀNH TRÌNH HỌC TẬP CỦA BẠN (Yêu cầu mục 5)             */}
      {/* ========================================================= */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
              <Target className="w-4 h-4" />
              <span>Tiến Trình & Trải Nghiệm Học Sinh</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
              Hành Trình Học Tập Của Bạn
            </h2>
          </div>
          <div className="text-xs text-slate-300">
            {isGuest ? (
              <span className="text-amber-300 font-medium">Chế độ Khách tham quan</span>
            ) : (
              <span>
                Lời chào: <strong className="text-cyan-300">Chào mừng trở lại, {currentUser.name}! 👋</strong>
              </span>
            )}
          </div>
        </div>

        {/* Guest Banner Notice if not logged in */}
        {isGuest ? (
          <div className="p-6 rounded-3xl cosmic-card border border-amber-500/30 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-amber-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Trải Nghiệm Khách Tham Quan (SRS Phase 1)</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Đăng ký tài khoản để lưu trữ tiến trình học tập và sổ câu sai
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Khách có thể làm thử 10 câu trắc nghiệm miễn phí. Đăng ký tài khoản chính thức để mở rộng hạn mức luyện tập 30 câu/ngày và kết nối Trợ lý AI.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onOpenGuestTrial}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition interactive-bounce"
              >
                Làm Thử 10 Câu
              </button>
              <button
                onClick={() => navigateTo('auth-register')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition interactive-bounce"
              >
                Đăng Ký Ngay
              </button>
            </div>
          </div>
        ) : (
          /* Enrolled Courses & Goal Metrics for logged-in students */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Enrolled Courses & Recent Lesson Bento Box */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enrolled Courses Card */}
              <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4 box-lift">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>Các Khóa Học Đang Tham Gia ({enrolledCourses.length})</span>
                  </h3>
                  <button
                    onClick={() => navigateTo('lessons')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả khóa học</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {enrolledCourses.map(course => (
                    <div
                      key={course.id}
                      onClick={() => navigateTo('lessons', { subjectId: course.id })}
                      className="p-3.5 rounded-xl bg-[#090d20] border border-white/5 hover:border-indigo-500/30 transition cursor-pointer space-y-2 box-lift-subtle"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{course.name}</span>
                        {course.isCompulsory ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                            Bắt buộc
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                            Tự chọn
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Đã học: {course.completed}/{course.total} bài</span>
                        <span className="font-mono text-cyan-300 font-bold">{course.progress}%</span>
                      </div>

                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Lesson Bento Box (Bài học gần đây) */}
              {lastLesson && (
                <div className="p-6 rounded-2xl cosmic-card border border-indigo-500/25 relative overflow-hidden box-lift group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>Bài Học Gần Đây Nhất (Tiếp Tục Học)</span>
                    </span>
                    <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      {completedLessonIds.includes(lastLesson.id) ? 'Đã hoàn thành' : 'Đang học'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Video thumbnail preview */}
                    <div
                      onClick={() => {
                        setActiveLessonId(lastLesson.id);
                        navigateTo('lesson-detail', { lessonId: lastLesson.id });
                      }}
                      className="relative w-full sm:w-56 aspect-video sm:aspect-auto sm:h-32 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0 group-hover:border-cyan-400/50 transition cursor-pointer"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80"
                        alt="Lesson thumbnail"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/80 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition interactive-bounce">
                          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                        12:45
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3
                        onClick={() => {
                          setActiveLessonId(lastLesson.id);
                          navigateTo('lesson-detail', { lessonId: lastLesson.id });
                        }}
                        className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition cursor-pointer"
                      >
                        {lastLesson.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {lastLesson.summary}
                      </p>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: completedLessonIds.includes(lastLesson.id) ? '100%' : '65%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                    <div className="text-xs text-slate-400">
                      Môn: <strong className="text-slate-200">{subjects.find(s => s.id === lastLesson.subjectId)?.name || 'Toán Học 12'}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setActiveLessonId(lastLesson.id);
                        navigateTo('lesson-detail', { lessonId: lastLesson.id });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition interactive-bounce box-lift-subtle shadow-md shadow-indigo-600/30"
                    >
                      <span>Tiếp Tục Học</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Bento Box: 3D Card Flipping Flashcards */}
              <div className="box-lift">
                <FlashcardFlipBox />
              </div>
            </div>

            {/* Right 1 Col: Goals, KPI Metrics and Weekly tasks */}
            <div className="space-y-6">
              {/* Target Scores Box */}
              <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4 box-lift">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>Mục Tiêu Điểm Số</span>
                  </h3>
                  <button
                    onClick={() => navigateTo('onboarding')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Chỉnh sửa
                  </button>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(currentUser.targetScores).slice(0, 4).map(([subId, score]) => (
                    <div key={subId} className="p-2.5 rounded-xl bg-[#090d20] border border-white/5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">
                        {subjects.find(s => s.id === subId)?.name || subId.toUpperCase()}
                      </span>
                      <span className="font-mono font-black text-cyan-300 text-sm">{score}.0</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#090d20]">
                    <span className="text-[10px] text-slate-400 block">Chuỗi Học</span>
                    <strong className="text-amber-400 font-mono text-sm">{currentUser.streakDays} ngày</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#090d20]">
                    <span className="text-[10px] text-slate-400 block">Giờ / Ngày</span>
                    <strong className="text-cyan-300 font-mono text-sm">{currentUser.studyHoursPerDay}h</strong>
                  </div>
                </div>
              </div>

              {/* Task list with checkboxes */}
              <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-3 box-lift">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Nhiệm Vụ Tuần Này</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Tuần {weeklyPlan.weekNumber}</span>
                </div>

                <div className="space-y-2">
                  {weeklyPlan.tasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`p-2.5 rounded-xl cursor-pointer border transition flex items-start gap-2.5 text-xs ${
                        task.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                          : 'bg-[#090d20] border-white/5 hover:border-indigo-500/30'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          task.completed ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="text-cyan-400 font-bold uppercase">{task.dayOfWeek}</span>
                          <span>{task.durationMinutes}p</span>
                        </div>
                        <p className={`mt-0.5 line-clamp-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {task.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigateTo('vip-roadmap')}
                  className="w-full mt-2 py-2 text-center text-xs text-indigo-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                >
                  Xem toàn bộ lộ trình tuần →
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 5. ĐỀ XUẤT DÀNH CHO BẠN (Yêu cầu mục 6)                   */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Cá Nhân Hóa Học Tập (AI Recommendations)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
              Đề Xuất Dành Cho Bạn
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Thuật toán BR-PERS đề xuất dựa trên mục tiêu điểm số và chẩn đoán năng lực thực tế
          </p>
        </div>

        {/* 5.1 Các môn học gợi ý */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>1. Khóa Học Trọng Tâm GDPT 2018</span>
            </h3>
            <button
              onClick={() => navigateTo('lessons')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả môn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subjects.slice(0, 4).map(s => (
              <div
                key={s.id}
                onClick={() => navigateTo('lessons', { subjectId: s.id })}
                className="p-4 rounded-2xl cosmic-card border border-white/5 hover:border-cyan-500/40 transition cursor-pointer space-y-2 box-lift group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                    {s.name} 12
                  </span>
                  {s.isCompulsory ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      Bắt buộc
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      Tự chọn
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {s.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-cyan-400 font-semibold border-t border-white/5">
                  <span>Vào khóa học</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5.2 Chuyên đề cần ôn luyện & Đề thi thử nổi bật (2 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chuyên đề cần củng cố (Weak Topics) */}
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4 box-lift">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>2. Chuyên Đề Cần Củng Cố Ngay</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tập trung lấp lỗ hổng các chủ đề có điểm thành thạo dưới 60%
                </p>
              </div>
              <button
                onClick={() => navigateTo('practice-setup')}
                className="text-xs text-cyan-400 hover:underline"
              >
                Luyện tập
              </button>
            </div>

            <div className="space-y-3">
              {weakTopics.slice(0, 3).map((wt, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#090d20] border border-white/5 flex items-center justify-between gap-3 text-xs box-lift-subtle"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{wt.topic}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          wt.status === 'Yếu'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {wt.status} ({wt.masteryPercentage}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Môn: {subjects.find(s => s.id === wt.subjectId)?.name || wt.subjectId.toUpperCase()} • Đã làm {wt.sampleCount} câu
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('practice-setup', { subjectId: wt.subjectId, topic: wt.topic })}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-xs transition flex items-center gap-1 shrink-0"
                  >
                    <span>Luyện Ngay</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Đề thi thử nổi bật (Featured Mock Exams) */}
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4 box-lift">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>3. Đề Thi Thử THPT 2026 Tiêu Biểu</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Đề thi biên soạn đúng cấu trúc 3 phần theo Quyết định 764/QĐ-BGDĐT
                </p>
              </div>
              <button
                onClick={() => navigateTo('exam-catalog')}
                className="text-xs text-cyan-400 hover:underline"
              >
                Tất cả đề
              </button>
            </div>

            <div className="space-y-3">
              {exams.slice(0, 2).map(exam => (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-xl bg-[#090d20] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs box-lift-subtle"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{exam.title}</span>
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                        {exam.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Thời lượng: <strong className="text-slate-200">{exam.durationMinutes} phút</strong> • Thang điểm: <strong className="text-amber-400">{exam.maxScore}.0</strong> • {exam.totalSubmissions || 850} lượt thi
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveExamId(exam.id);
                      navigateTo('exam-catalog', { examId: exam.id });
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Làm Bài Ngay</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
