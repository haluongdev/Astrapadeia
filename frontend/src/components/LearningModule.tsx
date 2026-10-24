import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  CheckCircle,
  Bookmark,
  Sparkles,
  Lock,
  ChevronRight,
  Filter,
  Video,
  FileText,
  Star,
  ExternalLink,
  Save,
  MessageSquare,
  ArrowLeft,
  Maximize2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lesson, Subject } from '../types';
import { RichLessonContent } from './common/RichLessonContent';

interface LearningModuleProps {
  onOpenVIPModal: () => void;
  onAskAIWithContext?: (lessonTitle: string) => void;
}

export const LearningModule: React.FC<LearningModuleProps> = ({
  onOpenVIPModal,
  onAskAIWithContext
}) => {
  const {
    subjects,
    chapters,
    lessons,
    currentUser,
    completedLessonIds,
    favoriteLessonIds,
    lessonNotes,
    toggleLessonCompleted,
    toggleLessonFavorite,
    saveLessonNote,
    activeScreenId,
    navigateTo,
    screenParams,
    activeLessonId,
    setActiveLessonId
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => screenParams?.subjectId || 'toan');
  const [selectedGrade, setSelectedGrade] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'formulas' | 'video' | 'notes'>('content');
  const [currentNote, setCurrentNote] = useState<string>('');
  const [lightboxFormula, setLightboxFormula] = useState<string | null>(null);

  // Sync selectedSubjectId if screenParams.subjectId changes
  React.useEffect(() => {
    if (screenParams?.subjectId && screenParams.subjectId !== selectedSubjectId) {
      setSelectedSubjectId(screenParams.subjectId);
    }
  }, [screenParams?.subjectId]);

  // Auto-load exact lesson if specified or direct navigation to lesson-detail
  React.useEffect(() => {
    if (activeScreenId === 'lesson-detail') {
      const targetId = screenParams?.lessonId || activeLessonId;
      if (targetId) {
        const found = lessons.find(l => l.id === targetId);
        if (found) {
          setActiveLesson(found);
          setSelectedSubjectId(found.subjectId);
          setCurrentNote(lessonNotes[found.id] || '');
          setActiveTab('content');
          return;
        }
      }
      if (!activeLesson && lessons.length > 0) {
        const target = lessons.find(l => l.subjectId === selectedSubjectId && l.grade === selectedGrade) || lessons[0];
        if (target) {
          setActiveLesson(target);
          setCurrentNote(lessonNotes[target.id] || '');
        }
      }
    } else if (activeScreenId === 'lessons') {
      setActiveLesson(null);
    }
  }, [activeScreenId, lessons, selectedSubjectId, selectedGrade, screenParams?.lessonId, activeLessonId]);

  // Handle note loading when selecting lesson
  const handleSelectLesson = (lesson: Lesson) => {
    // Check VIP permission (FR-CONT-03, FR-PAY-10)
    if (lesson.accessTier === 'vip' && currentUser.vipTier !== 'vip') {
      onOpenVIPModal();
      return;
    }
    setActiveLesson(lesson);
    setCurrentNote(lessonNotes[lesson.id] || '');
    setActiveTab('content');
    setActiveLessonId(lesson.id);
    navigateTo('lesson-detail', { lessonId: lesson.id });
  };

  const handleBackToCatalog = () => {
    setActiveLesson(null);
    navigateTo('lessons');
  };

  const handleSaveNote = () => {
    if (!activeLesson) return;
    saveLessonNote(activeLesson.id, currentNote);
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      const matchSubject = l.subjectId === selectedSubjectId;
      const matchGrade = l.grade === selectedGrade;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchSubject && matchGrade;

      // Vietnamese normalization search (FR-CONT-05)
      const normalize = (str: string) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      const titleMatch =
        l.title.toLowerCase().includes(query) || normalize(l.title).includes(normalize(query));
      const summaryMatch =
        l.summary.toLowerCase().includes(query) || normalize(l.summary).includes(normalize(query));

      return matchSubject && matchGrade && (titleMatch || summaryMatch);
    });
  }, [lessons, selectedSubjectId, selectedGrade, searchQuery]);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const subjectChapters = chapters.filter(c => c.subjectId === selectedSubjectId && c.grade === selectedGrade);

  return (
    <div className="space-y-6 pb-16">
      {/* Subject Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <span>Kho Học Liệu GDPT 2018</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Chương Trình Học Tập & Khám Phá Kiến Thức
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Môn học bám sát nội dung kỳ thi tốt nghiệp THPT mới nhất
          </p>
        </div>

        {/* Grade Selector Pills */}
        <div className="flex items-center gap-1.5 bg-[#0a0e22] p-1 rounded-xl border border-white/5 self-start md:self-auto">
          {[10, 11, 12].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedGrade === g
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lớp {g}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Carousel Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map(s => {
          const isSelected = s.id === selectedSubjectId;
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubjectId(s.id);
                setActiveLesson(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-2 border ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600/80 to-cyan-600/70 text-white border-cyan-400/50 shadow-lg shadow-indigo-500/20'
                  : 'bg-[#0d1229] text-slate-300 border-white/5 hover:border-indigo-500/30 hover:text-white'
              }`}
            >
              <span>{s.name}</span>
              {s.isCompulsory && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                  Bắt buộc
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lesson View: Split View or Detail */}
      {activeLesson ? (
        <div className="space-y-4">
          {/* Back button & Quick actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleBackToCatalog}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition interactive-bounce"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Quay lại danh sách bài học (08)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('practice-setup')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 transition flex items-center gap-1.5"
                title="Luyện tập trắc nghiệm chuyên đề này"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Luyện Tập Chuyên Đề</span>
              </button>

              <button
                onClick={() => toggleLessonFavorite(activeLesson.id)}
                className={`p-2 rounded-xl border transition ${
                  favoriteLessonIds.includes(activeLesson.id)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                }`}
                title="Lưu vào danh sách yêu thích (FR-CONT-07)"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => toggleLessonCompleted(activeLesson.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  completedLessonIds.includes(activeLesson.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {completedLessonIds.includes(activeLesson.id) ? 'Đã Hoàn Thành' : 'Đánh Dấu Hoàn Thành'}
                </span>
              </button>
            </div>
          </div>

          {/* Lesson Container */}
          <div className="rounded-2xl cosmic-card border border-indigo-500/30 overflow-hidden">
            {/* Header info */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-950/40 via-transparent to-transparent">
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-2">
                <span>{currentSubject?.name} {selectedGrade}</span>
                <span>•</span>
                <span className="capitalize">{activeLesson.accessTier === 'vip' ? 'Gói VIP' : 'Miễn Phí'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-space mb-2">
                {activeLesson.title}
              </h1>
              <p className="text-slate-300 text-sm">{activeLesson.summary}</p>
            </div>

            {/* Content Tabs */}
            <div className="flex items-center border-b border-white/10 px-6 gap-2 bg-[#090d20]">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'content'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Lý Thuyết Trọng Tâm</span>
              </button>

              {activeLesson.keyFormulas && activeLesson.keyFormulas.length > 0 && (
                <button
                  onClick={() => setActiveTab('formulas')}
                  className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'formulas'
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Công Thức Cốt Lõi</span>
                </button>
              )}

              {activeLesson.videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'video'
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>Video Bài Giảng</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Ghi Chú Của Tôi</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="p-6">
              {activeTab === 'content' && (
                <div className="prose prose-invert max-w-none space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
                  <div className="font-sans bg-[#080c1d] p-5 rounded-xl border border-white/5">
                    <RichLessonContent content={activeLesson.content} />
                  </div>
                </div>
              )}

              {activeTab === 'formulas' && activeLesson.keyFormulas && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                      Các hệ thức & công thức cần ghi nhớ:
                    </h4>
                    <span className="text-[11px] text-slate-400">Bấm vào công thức để xem Lightbox phóng to</span>
                  </div>
                  {activeLesson.keyFormulas.map((form, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxFormula(form)}
                      className="p-4 rounded-xl bg-[#0a0f26] border border-cyan-500/20 text-cyan-100 font-mono text-sm shadow-inner box-lift-subtle cursor-pointer flex items-center justify-between group"
                    >
                      <span>{form}</span>
                      <Maximize2 className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition" />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'video' && activeLesson.videoUrl && (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                    <iframe
                      src={activeLesson.videoUrl}
                      title={activeLesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Video tóm tắt nhanh phương pháp giải nhanh trắc nghiệm do tổ chuyên môn biên soạn.
                  </p>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Ghi chú được tự động lưu vào bộ nhớ cá nhân của bạn (FR-CONT-08)
                    </span>
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Ghi Chú</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={currentNote}
                    onChange={e => setCurrentNote(e.target.value)}
                    placeholder="Viết ghi chú cá nhân, mẹo giải nhanh, hoặc công thức bạn hay nhầm lẫn ở bài này..."
                    className="w-full p-4 rounded-xl bg-[#090d20] border border-white/10 text-slate-200 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Lesson Listing & Search */
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài học, chủ đề (tiếng Việt có dấu hoặc không dấu)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0c1126] border border-white/10 text-slate-200 placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Chapters and Lessons */}
          <div className="space-y-6">
            {subjectChapters.map(chap => {
              const chapLessons = filteredLessons.filter(l => l.chapterId === chap.id);
              if (chapLessons.length === 0 && searchQuery) return null;

              return (
                <div key={chap.id} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h3 className="font-bold text-white text-base sm:text-lg">{chap.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapLessons.map(lesson => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isVIP = lesson.accessTier === 'vip';
                      const isLocked = isVIP && currentUser.vipTier !== 'vip';

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`group p-4 rounded-2xl cosmic-card cursor-pointer border transition flex flex-col justify-between box-lift ${
                            isLocked
                              ? 'border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-br from-[#0c1024] to-[#120f21]'
                              : 'border-white/5 hover:border-indigo-500/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  lesson.accessTier === 'public'
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                    : lesson.accessTier === 'free'
                                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {lesson.accessTier === 'public'
                                  ? 'Công khai'
                                  : lesson.accessTier === 'free'
                                  ? 'Miễn phí'
                                  : 'Gói VIP'}
                              </span>

                              {isCompleted && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Đã xong</span>
                                </span>
                              )}
                              {isLocked && (
                                <Lock className="w-4 h-4 text-amber-400" />
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition line-clamp-2 mb-1.5">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                              {lesson.summary}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                            <span>Bài {lesson.order}</span>
                            <span className="group-hover:translate-x-1 transition text-cyan-400 font-semibold flex items-center gap-1">
                              {isLocked ? 'Mở khóa VIP' : 'Học ngay'}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal (Lightbox effect phóng to) */}
      {lightboxFormula && (
        <div
          onClick={() => setLightboxFormula(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl p-6 sm:p-8 rounded-3xl cosmic-glass border border-cyan-400/50 shadow-2xl relative space-y-4"
          >
            <button
              onClick={() => setLightboxFormula(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs uppercase font-bold text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>Phóng To Công Thức Cốt Lõi (Lightbox)</span>
            </div>

            <div className="p-6 rounded-2xl bg-black/70 border border-cyan-500/30 text-cyan-200 font-mono text-base sm:text-lg text-center leading-relaxed shadow-inner">
              {lightboxFormula}
            </div>

            <p className="text-xs text-slate-300 text-center">
              Nhấp ra ngoài hoặc bấm dấu nhân để đóng chế độ phóng to.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
