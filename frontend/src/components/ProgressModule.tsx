import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  Zap,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProgressModuleProps {
  focusRoadmapOnly?: boolean;
  onOpenVIPModal?: () => void;
}

export const ProgressModule: React.FC<ProgressModuleProps> = ({
  focusRoadmapOnly = false,
  onOpenVIPModal
}) => {
  const {
    currentUser,
    completedLessonIds,
    examSubmissions,
    weakTopics,
    weeklyPlan,
    subjects,
    toggleTaskCompletion,
    updateStudyHours,
    navigateTo
  } = useApp();

  const [hoursInput, setHoursInput] = useState<number>(currentUser.studyHoursPerDay);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculate statistics
  const totalSubmissions = examSubmissions.length;
  const avgScore =
    totalSubmissions > 0
      ? (examSubmissions.reduce((acc, cur) => acc + cur.score, 0) / totalSubmissions).toFixed(1)
      : '0.0';

  const totalQuestionsDone = examSubmissions.reduce(
    (acc, cur) => acc + cur.correctCount + cur.wrongCount + cur.unansweredCount,
    0
  );
  const totalCorrect = examSubmissions.reduce((acc, cur) => acc + cur.correctCount, 0);
  const accuracyRate =
    totalQuestionsDone > 0 ? Math.round((totalCorrect / totalQuestionsDone) * 100) : 0;

  const handleSaveHours = () => {
    updateStudyHours(hoursInput);
    showToast(`Đã cập nhật mục tiêu ${hoursInput} giờ học/ngày! Lộ trình Scholyx sẽ tự động phân bổ lại.`);
  };

  const handleExportPDF = () => {
    showToast('Tính năng Mô phỏng: Báo cáo tiến độ học tập Scholyx PDF đã được tạo (Chế độ Demo Prototype).');
  };

  return (
    <div className="space-y-6 pb-16">
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2 animate-fadeIn shadow-lg shadow-cyan-950/40">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-indigo-500/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
            <BarChart3 className="w-4 h-4" />
            <span>Phân Tích Tiến Độ & Lộ Trình (PROG & PERS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Bản Đồ Năng Lực & Quỹ Đạo Học Tập Thích Ứng
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Đánh giá mức thành thạo theo thuật toán BR-PERS-01 và tự động đề xuất lộ trình tuần
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-2 transition self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Xuất Báo Cáo PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl cosmic-card border border-white/5">
          <div className="text-xs text-slate-400 mb-1">Điểm Thi Thử Trung Bình</div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-space">{avgScore}</div>
          <div className="text-[10px] text-slate-500 mt-1">Dựa trên {totalSubmissions} lượt thi</div>
        </div>

        <div className="p-4 rounded-2xl cosmic-card border border-white/5">
          <div className="text-xs text-slate-400 mb-1">Tỷ Lệ Trả Lời Đúng</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-space">{accuracyRate}%</div>
          <div className="text-[10px] text-slate-500 mt-1">{totalCorrect} / {totalQuestionsDone} câu</div>
        </div>

        <div className="p-4 rounded-2xl cosmic-card border border-white/5">
          <div className="text-xs text-slate-400 mb-1">Bài Học Đã Hoàn Thành</div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-space">{completedLessonIds.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Chuẩn GDPT 2018</div>
        </div>

        <div className="p-4 rounded-2xl cosmic-card border border-white/5">
          <div className="text-xs text-slate-400 mb-1">Chuỗi Thiên Hà Liên Tiếp</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-space">{currentUser.streakDays}</div>
          <div className="text-[10px] text-slate-500 mt-1">Ngày học đều đặn</div>
        </div>
      </div>

      {/* Target Scores Radar / Comparison (FR-PROG-06) */}
      <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Khoảng Cách So Với Điểm Mục Tiêu Đại Học (FR-PROG-06)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(currentUser.targetScores).map(([subId, targetScore]) => {
            const sub = subjects.find(s => s.id === subId);
            const subSubmissions = examSubmissions.filter(s => s.subjectId === subId);
            const currentSubAvg =
              subSubmissions.length > 0
                ? Number((subSubmissions.reduce((a, b) => a + b.score, 0) / subSubmissions.length).toFixed(1))
                : 7.0;

            const diff = Number((targetScore - currentSubAvg).toFixed(1));
            const progressPct = Math.min(100, Math.round((currentSubAvg / targetScore) * 100));

            return (
              <div key={subId} className="p-4 rounded-xl bg-[#090d20] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{sub?.name || subId.toUpperCase()}</span>
                  <span className="text-cyan-300 font-bold font-mono">Mục tiêu: {targetScore}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-200 font-space">{currentSubAvg}</span>
                  <span className={`text-xs font-semibold ${diff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {diff > 0 ? `Còn thiếu ${diff}đ` : 'Đạt mục tiêu 🎉'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Row: Mức Thành Thạo Chủ Đề (BR-PERS-01) + Lộ Trình Cá Nhân Hóa (FR-PERS-04) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Levels by Topic */}
        <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Mức Độ Thành Thạo Chủ Đề (BR-PERS-01)
            </h3>
            <span className="text-xs text-slate-400">Đo lường thời gian thực</span>
          </div>

          <div className="space-y-3">
            {weakTopics.map((wt, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#090d20] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{wt.topic}</span>
                    <span className="text-[10px] text-slate-400">({wt.sampleCount} câu đã làm)</span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      wt.status === 'Yếu'
                        ? 'bg-rose-500/20 text-rose-300'
                        : wt.status === 'Trung bình'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {wt.status} ({wt.masteryPercentage}%)
                  </span>
                </div>

                {/* Meter */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      wt.status === 'Yếu'
                        ? 'bg-rose-500'
                        : wt.status === 'Trung bình'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${wt.masteryPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Adaptive Roadmap (FR-PERS-04, 06) */}
        <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Lộ Trình Tuần Cá Nhân Hóa (Tuần {weeklyPlan.weekNumber})
            </h3>
            <span className="text-xs text-cyan-300 font-semibold">{weeklyPlan.startDate} - {weeklyPlan.endDate}</span>
          </div>

          {/* Daily Study Hours Slider (FR-PERS-06) */}
          <div className="p-3.5 rounded-xl bg-[#090d20] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Điều chỉnh giờ học/ngày:
              </span>
              <strong className="text-cyan-300 font-mono">{hoursInput} giờ/ngày</strong>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={hoursInput}
                onChange={e => setHoursInput(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <button
                onClick={handleSaveHours}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg whitespace-nowrap transition"
              >
                Cập nhật
              </button>
            </div>
          </div>

          {/* Task list with checkboxes */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {weeklyPlan.tasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTaskCompletion(task.id)}
                className={`p-3 rounded-xl cursor-pointer border transition flex items-start gap-3 ${
                  task.completed
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                    : 'bg-[#090d20] border-white/5 hover:border-indigo-500/30'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 transition ${
                    task.completed ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold uppercase text-cyan-400">{task.dayOfWeek} ({task.dateStr})</span>
                    <span>{task.durationMinutes} phút</span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 leading-snug ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-200'
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
