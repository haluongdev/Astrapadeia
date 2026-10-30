import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Zap,
  Bot,
  AlertOctagon,
  Award,
  Crown,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ScreenId } from '../../types';
import { useApp } from '../../context/AppContext';
import { CosmicCountdown } from '../CosmicCountdown';

interface FreeOverviewScreenProps {
  onNavigate: (screenId: ScreenId) => void;
  onOpenVIPModal: () => void;
}

export const FreeOverviewScreen: React.FC<FreeOverviewScreenProps> = ({
  onNavigate,
  onOpenVIPModal
}) => {
  const { currentUser, aiDailyUsage, maxAIDailyUsage, mistakeItems, weakTopics, completedLessonIds, subjects } = useApp();

  const isFree = currentUser.vipTier === 'free';
  const practiceUsedToday = 18;
  const practiceMaxDaily = 30; // BR-VIP-02
  const practicePct = Math.round((practiceUsedToday / practiceMaxDaily) * 100);
  const aiPct = Math.round((aiDailyUsage / maxAIDailyUsage) * 100);
  const unresolvedMistakes = mistakeItems.filter(m => !m.resolved);

  return (
    <div className="space-y-6 pb-16">
      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
            <LayoutDashboard className="w-4 h-4" />
            <span>Màn hình 07 • Bảng Điều Khiển Học Sinh</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Tổng Quan Gói Miễn Phí (FREE Tier)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Theo dõi định mức luyện tập hằng ngày, câu hỏi còn lại và chẩn đoán kiến thức trọng tâm
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {isFree ? (
            <button
              onClick={onOpenVIPModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 hover:brightness-110 transition interactive-bounce"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>Nâng Cấp VIP Không Giới Hạn</span>
            </button>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>VIP Đang Hoạt Động</span>
            </span>
          )}
        </div>
      </div>

      {/* Countdown strip */}
      <CosmicCountdown />

      {/* Quota Tracking Grid (BR-VIP-02) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Practice Quota */}
        <div className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-3 box-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Luyện tập hôm nay</span>
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-space">
              {practiceUsedToday} <span className="text-sm font-normal text-slate-400">/ {practiceMaxDaily} câu</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Còn lại {practiceMaxDaily - practiceUsedToday} câu hôm nay</p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${practicePct}%` }}
            />
          </div>
        </div>

        {/* AI Queries Quota */}
        <div className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-3 box-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Trợ lý AI Cosmos</span>
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Bot className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300 font-space">
              {aiDailyUsage} <span className="text-sm font-normal text-slate-400">/ {maxAIDailyUsage} lượt</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Hỏi đáp theo SGK chuẩn 2018</p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${aiPct}%` }}
            />
          </div>
        </div>

        {/* Mistake Notebook Quota */}
        <div className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-3 box-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Sổ câu sai tự động</span>
            <span className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400 font-space">
              {unresolvedMistakes.length} <span className="text-sm font-normal text-slate-400">/ 50 câu</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Tối đa 50 câu (VIP không giới hạn)</p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (unresolvedMistakes.length / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Mock Exams Quota */}
        <div className="p-5 rounded-2xl cosmic-card border border-white/5 space-y-3 box-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Thi thử chuẩn 2025</span>
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-300 font-space">
              1 <span className="text-sm font-normal text-slate-400">/ 2 đề/tháng</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Đề thi cấu trúc 3 phần QĐ 764</p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `50%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Diagnosis & Action shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weak Topics Diagnosis (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white font-space">
                  Chẩn Đoán Điểm Yếu & Khuyến Nghị Khắc Phục (BR-PERS-02)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('review-progress')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {weakTopics.map((wt, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#090d20] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 box-lift-subtle"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{wt.topic}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('practice-setup')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Luyện Ngay</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick learning actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate('lessons')}
              className="p-5 rounded-2xl cosmic-card border border-white/5 hover:border-cyan-500/40 cursor-pointer transition space-y-2 box-lift group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                Thư Viện Bài Học Chuẩn 2018
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đã hoàn thành {completedLessonIds.length} bài học. Tiếp tục học lý thuyết trọng tâm và công thức.
              </p>
            </div>

            <div
              onClick={() => onNavigate('exam-catalog')}
              className="p-5 rounded-2xl cosmic-card border border-white/5 hover:border-indigo-500/40 cursor-pointer transition space-y-2 box-lift group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                Đề Thi Thử Tốt Nghiệp THPT
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Làm đề thi thử định dạng 3 phần: Trắc nghiệm 4 lựa chọn, Đúng/Sai 4 ý, Trả lời ngắn.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: VIP Comparison Banner (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border-tracing-box space-y-4 box-lift">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Đặc Quyền Scholyx VIP</span>
            </div>
            <h4 className="font-extrabold text-base text-white leading-snug">
              Bứt Phá Điểm 9+ Không Còn Giới Hạn Hằng Ngày
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Luyện tập không giới hạn (không bị chặn ở 30 câu)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>50 lượt hỏi Trợ lý AI Cosmos mỗi ngày</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Mở toàn bộ đề thi thử độc quyền 2025–2026</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Lộ trình tuần cá nhân hóa thích ứng theo ngày</span>
              </div>
            </div>

            <button
              onClick={onOpenVIPModal}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-400/20 hover:brightness-105 transition interactive-bounce"
            >
              Xem Bảng Giá & Nâng Cấp VIP (Từ 79k)
            </button>
          </div>

          {/* Quick tips */}
          <div className="p-5 rounded-2xl bg-[#090d20] border border-white/5 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Mẹo học tập thông minh:</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Hãy duy trì chuỗi học tập mỗi ngày ít nhất 30 phút để kích hoạt thuật toán lặp lại ngắt quãng (Spaced Repetition), giúp ghi nhớ kiến thức công thức đến tận ngày thi 25/06/2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
