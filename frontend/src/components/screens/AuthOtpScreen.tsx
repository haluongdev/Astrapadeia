import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { ScreenId } from '../../types';
import { useApp } from '../../context/AppContext';

interface AuthOtpScreenProps {
  onNavigate: (screenId: ScreenId) => void;
}

export const AuthOtpScreen: React.FC<AuthOtpScreenProps> = ({ onNavigate }) => {
  const { completeRegistrationWithOtp, pendingRegistration } = useApp();
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes per BR-ACC-04
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val[val.length - 1];
    }
    const copy = [...otpDigits];
    copy[index] = val;
    setOtpDigits(copy);

    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullOtp = otpDigits.join('');

    if (fullOtp.length < 6) {
      setErrorMessage('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('Mã OTP đã hết hạn sau 10 phút. Vui lòng bấm Gửi lại mã mới (BR-ACC-04).');
      return;
    }

    // Strictly validate against configured demo OTP codes
    const result = completeRegistrationWithOtp(fullOtp);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      // Go to screen 06: Hồ sơ & mục tiêu ban đầu
      onNavigate('onboarding');
    }, 800);
  };

  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const handleResend = () => {
    setTimeLeft(600);
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMessage('');
    inputsRef.current[0]?.focus();
    setResendNotice('Mã OTP mới (123456) đã được gửi đến email/SĐT của bạn!');
    setTimeout(() => setResendNotice(null), 4000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto my-6 p-6 sm:p-8 rounded-3xl cosmic-card border border-indigo-500/30 relative shadow-2xl">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-indigo-600/30 to-purple-600/30 border border-cyan-500/40 text-cyan-300 shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-cyan-400">
          <span className="font-mono">Màn hình 04</span>
          <span>•</span>
          <span>Xác thực OTP (BR-ACC-04)</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white font-space">
          Kích Hoạt Tài Khoản
        </h2>
        <p className="text-xs text-slate-300">
          Nhập mã xác thực 6 số gửi tới <strong className="text-cyan-300">{pendingRegistration?.email || 'hocsinh@scholyx.edu.vn'}</strong>
        </p>
      </div>

      {/* Demo Sandbox notice banner */}
      <div className="mb-5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
        <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-0.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Mã OTP Thử Nghiệm Mô Phỏng</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Trong môi trường Sandbox, sử dụng mã OTP: <span className="font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">123456</span> hoặc <span className="font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">888888</span>.
        </p>
      </div>

      {isSuccess ? (
        <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-3 animate-fadeIn">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Xác Thực Thành Công!</h3>
          <p className="text-xs text-slate-300">
            Tài khoản đã chuyển sang trạng thái <strong>Hoạt động</strong>. Đang chuyển tới bước thiết lập mục tiêu học tập ban đầu...
          </p>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resendNotice && (
            <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>{resendNotice}</span>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputsRef.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl bg-[#0a0e22] border border-white/10 text-cyan-300 focus:border-cyan-400 focus:bg-[#0e1430] focus:ring-2 focus:ring-cyan-500/30 outline-none transition"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Hiệu lực còn:</span>
              <strong className={`font-mono ${timeLeft < 60 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {formatTime(timeLeft)}
              </strong>
            </div>

            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Gửi lại mã</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition interactive-bounce"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Xác Thực & Vào Học Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="text-center pt-5 mt-6 border-t border-white/5 text-xs text-slate-400">
        Cần trợ giúp?{' '}
        <button
          onClick={() => onNavigate('auth-login')}
          className="text-cyan-300 hover:underline"
        >
          Quay lại Đăng nhập
        </button>
      </div>
    </div>
  );
};
