import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Orbit, Info } from 'lucide-react';
import { ACADEMIC_CONFIG, BRAND_CONFIG } from '../config/examConfig';

interface CountdownProps {
  targetDateStr?: string;
  className?: string;
}

export const CosmicCountdown: React.FC<CountdownProps> = ({
  targetDateStr,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const targetDateISO = targetDateStr || ACADEMIC_CONFIG.targetExamDate;
  const targetYear = ACADEMIC_CONFIG.targetYear;
  const targetFormatted = ACADEMIC_CONFIG.targetExamFormattedDate;

  useEffect(() => {
    const target = new Date(targetDateISO).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateISO]);

  return (
    <div className={`relative overflow-hidden rounded-2xl cosmic-card p-5 border border-indigo-500/20 ${className}`}>
      {/* Background decorative glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600/40 to-cyan-500/30 flex items-center justify-center border border-indigo-500/30 text-cyan-300 shadow-inner">
            <Orbit className="w-6 h-6 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Đếm Ngược Thiên Hà {BRAND_CONFIG.name}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                GDPT 2018 • Năm học {ACADEMIC_CONFIG.academicYear}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-100 font-space flex items-center gap-2">
              Kỳ Thi Tốt Nghiệp THPT {targetYear}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Dự kiến: {targetFormatted}
              </p>
              <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1" title={ACADEMIC_CONFIG.officialDisclaimer}>
                <Info className="w-2.5 h-2.5" /> Chờ lịch chính thức Bộ GD&ĐT
              </span>
            </div>
          </div>
        </div>

        {/* Astronomical Digit Units */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center w-full sm:w-auto">
          <div className="bg-[#0b0f24]/80 px-3 py-2 rounded-xl border border-white/5 min-w-[58px]">
            <span className="block text-2xl font-extrabold text-cyan-400 font-space leading-tight">
              {timeLeft.days}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ngày</span>
          </div>
          <div className="bg-[#0b0f24]/80 px-3 py-2 rounded-xl border border-white/5 min-w-[58px]">
            <span className="block text-2xl font-extrabold text-indigo-300 font-space leading-tight">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Giờ</span>
          </div>
          <div className="bg-[#0b0f24]/80 px-3 py-2 rounded-xl border border-white/5 min-w-[58px]">
            <span className="block text-2xl font-extrabold text-purple-300 font-space leading-tight">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Phút</span>
          </div>
          <div className="bg-[#0b0f24]/80 px-3 py-2 rounded-xl border border-white/5 min-w-[58px]">
            <span className="block text-2xl font-extrabold text-amber-400 font-space leading-tight">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Giây</span>
          </div>
        </div>
      </div>
    </div>
  );
};
