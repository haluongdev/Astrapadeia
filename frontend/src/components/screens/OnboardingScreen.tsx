import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Check,
  Calendar,
  Clock,
  ArrowRight,
  GraduationCap,
  Sliders,
  Award,
  BookOpen
} from 'lucide-react';
import { ScreenId } from '../../types';
import { useApp } from '../../context/AppContext';

interface OnboardingScreenProps {
  onNavigate: (screenId: ScreenId) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  const { currentUser, updateProfile, subjects } = useApp();
  const [grade, setGrade] = useState<10 | 11 | 12>(currentUser.grade || 12);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentUser.targetSubjects?.length ? currentUser.targetSubjects : ['toan', 'van', 'ly', 'anh']
  );
  const [targetScores, setTargetScores] = useState<Record<string, number>>(
    currentUser.targetScores || { toan: 9.0, van: 8.5, ly: 9.0, anh: 9.0 }
  );
  const [studyHours, setStudyHours] = useState<number>(currentUser.studyHoursPerDay || 3.5);
  const [examDate, setExamDate] = useState<string>(currentUser.examDate || '2026-06-25');

  const handleToggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 2) {
        setSelectedSubjects(prev => prev.filter(s => s !== subId));
      }
    } else {
      setSelectedSubjects(prev => [...prev, subId]);
      if (!targetScores[subId]) {
        setTargetScores(prev => ({ ...prev, [subId]: 8.5 }));
      }
    }
  };

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleScoreChange = (subId: string, val: number) => {
    setTargetScores(prev => ({ ...prev, [subId]: val }));
  };

  const handleCompleteOnboarding = () => {
    updateProfile({
      grade,
      targetSubjects: selectedSubjects,
      targetScores,
      studyHoursPerDay: studyHours,
      examDate
    });
    setIsSaved(true);
    setTimeout(() => {
      onNavigate('home');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 rounded-3xl cosmic-card border border-indigo-500/30 relative shadow-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-400/20 via-indigo-600/30 to-purple-600/20 border border-cyan-500/40 text-cyan-300">
          <Target className="w-8 h-8" />
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-cyan-400">
          <span className="font-mono">Màn hình 06</span>
          <span>•</span>
          <span>Hồ sơ & Mục tiêu ban đầu (FR-PRO-03..05)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
          Thiết Lập Mục Tiêu Thi THPT 2026
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Hệ thống sẽ dựa vào cấu hình này để cá nhân hóa lộ trình tuần và chẩn đoán kiến thức cho bạn.
        </p>
      </div>

      <div className="space-y-5 text-xs">
        {/* 1. Khối lớp */}
        <div className="p-4 rounded-2xl bg-[#090d20] border border-white/5 space-y-2">
          <label className="text-slate-300 font-bold block flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>1. Bạn đang học khối lớp nào?</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[10, 11, 12].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g as any)}
                className={`py-2.5 rounded-xl font-bold border transition ${
                  grade === g
                    ? 'bg-indigo-600 text-white border-cyan-400 shadow-md shadow-indigo-600/30'
                    : 'bg-[#0a0e22] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Lớp {g} (GDPT 2018)
              </button>
            ))}
          </div>
        </div>

        {/* 2. Môn thi tổ hợp */}
        <div className="p-4 rounded-2xl bg-[#090d20] border border-white/5 space-y-3">
          <label className="text-slate-300 font-bold block flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>2. Chọn tổ hợp môn thi tốt nghiệp THPT:</span>
            </span>
            <span className="text-[11px] text-slate-400">Đã chọn: {selectedSubjects.length} môn</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {subjects.map(s => {
              const isSelected = selectedSubjects.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleToggleSubject(s.id)}
                  className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/30 border-cyan-400 text-white shadow-sm'
                      : 'bg-[#0c1126] border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="truncate">
                    <div>{s.name}</div>
                    {s.isCompulsory && (
                      <span className="text-[9px] text-amber-400 block font-normal">Bắt buộc</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Điểm mục tiêu */}
        <div className="p-4 rounded-2xl bg-[#090d20] border border-white/5 space-y-3">
          <label className="text-slate-300 font-bold block flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>3. Thiết lập điểm mục tiêu từng môn (Thang điểm 10):</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedSubjects.map(subId => {
              const sub = subjects.find(s => s.id === subId);
              return (
                <div
                  key={subId}
                  className="p-3 rounded-xl bg-[#0c1126] border border-white/5 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-white text-xs">{sub?.name}</span>
                    <span className="text-[10px] text-slate-400 block">Mục tiêu đỗ ĐH top</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={0.25}
                      min={5}
                      max={10}
                      value={targetScores[subId] || 8.5}
                      onChange={e => handleScoreChange(subId, parseFloat(e.target.value))}
                      className="w-16 p-1 rounded-lg bg-[#070913] border border-white/10 text-cyan-300 font-mono font-bold text-center text-sm focus:border-cyan-400 outline-none"
                    />
                    <span className="text-slate-400 text-xs">/10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Giờ học mỗi ngày & Ngày thi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#090d20] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>4. Thời gian học/ngày:</span>
              </label>
              <span className="text-cyan-300 font-bold font-mono text-sm">{studyHours} giờ</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={studyHours}
              onChange={e => setStudyHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <p className="text-[10px] text-slate-500">Khuyến nghị: 3.5 - 4.5 giờ/ngày cho khối 12</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d20] border border-white/5 space-y-2">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>5. Ngày thi THPT 2026:</span>
            </label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#070913] border border-white/10 text-white font-mono text-xs focus:border-cyan-400 outline-none"
            />
            <p className="text-[10px] text-slate-500">Dự kiến chính thức: 25/06/2026</p>
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        {isSaved ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-sm font-bold animate-fadeIn">
            ✓ Khởi tạo mục tiêu thành công! Đang chuyển đến Trang Chủ...
          </div>
        ) : (
          <button
            onClick={handleCompleteOnboarding}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 hover:brightness-110 transition interactive-bounce cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Lưu Mục Tiêu & Khám Phá Không Gian Học Tập</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
