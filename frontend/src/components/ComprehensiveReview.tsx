import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  Download,
  Target,
  Clock,
  Compass,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACADEMIC_CONFIG, getUpcomingMilestones, BRAND_CONFIG } from '../config/examConfig';

export const ComprehensiveReview: React.FC = () => {
  const { subjects, currentUser, setActiveNavTab } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('toan');

  const milestones = getUpcomingMilestones();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-indigo-500/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
            <Layers className="w-4 h-4" />
            <span>Chuyên Đề Ôn Tập Tổng Hợp ({BRAND_CONFIG.name} UNI)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Chuyên Đề Trọng Tâm & Lộ Trình Thi THPT {ACADEMIC_CONFIG.targetYear}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gắn kết nội dung ôn luyện bám sát ngày thi và mục tiêu điểm số đại học (Năm học {ACADEMIC_CONFIG.academicYear})
          </p>
        </div>
      </div>

      {/* Target Milestone Calendar (FR-UNI-03) */}
      <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Mốc Thời Gian Tuyển Sinh & Thi THPT {ACADEMIC_CONFIG.targetYear}
          </h3>
          <span className="text-[11px] text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {ACADEMIC_CONFIG.officialDisclaimer}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {milestones.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                m.isGoal
                  ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                  : 'bg-[#090d20] border-white/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                    {m.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">{m.date}</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">{m.title}</h4>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSubjectId(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedSubjectId === s.id
                ? 'bg-indigo-600 text-white border-cyan-400/50 shadow-md shadow-indigo-600/30'
                : 'bg-[#0a0e22] text-slate-300 border-white/5 hover:text-white'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Focus Cheat Sheets & Summary Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white mb-1">
              Sổ Tay Công Thức Vàng
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tổng hợp toàn bộ công thức cốt lõi lớp 10, 11 và 12 phục vụ xử lý nhanh câu trắc nghiệm.
            </p>
          </div>
          <button
            onClick={() => setActiveNavTab('lessons')}
            className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mở Bảng Công Thức</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white mb-1">
              Bộ Đề Trọng Tâm Chống Sai Ngu
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tuyển tập 100 bẫy lý thuyết phổ biến nhất thường xuất hiện trong đề thi tốt nghiệp THPT.
            </p>
          </div>
          <button
            onClick={() => setActiveNavTab('practice')}
            className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-500/30 transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Luyện Trọng Điểm</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white mb-1">
              Kỹ Thuật Sử Dụng Máy Tính Casio
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bí quyết bấm máy tính giải hệ phương trình, tích phân, số phức và ma trận trong 30 giây.
            </p>
          </div>
          <button
            onClick={() => setActiveNavTab('ai')}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/30 transition flex items-center justify-center gap-1.5"
          >
            <span>Hỏi Mẹo Casio Với AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
