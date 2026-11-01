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
import { authApi } from '../../services/authApi';

interface AuthOtpScreenProps {
  onNavigate: (screenId: ScreenId) => void;
}

export const AuthOtpScreen: React.FC<AuthOtpScreenProps> = ({ onNavigate }) => {
  const { pendingRegistration, setPendingRegistration } = useApp();
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes per BR-ACC-04
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState('');
  const [devOtpLoading, setDevOtpLoading] = useState(false);
  const [devOtpError, setDevOtpError] = useState('');
  const [devOtpModalOpen, setDevOtpModalOpen] = useState(false);
  const devOtpAutoFetchedEmail = useRef<string | null>(null);

  const showDevOtp = async () => {
    if (!pendingRegistration?.email) return;

    setDevOtpLoading(true);
    setDevOtpError('');
    setDevOtpCode('');

    try {
      const result = await authApi.devOtp(pendingRegistration.email);
      setDevOtpCode(result.code);
      setDevOtpModalOpen(true);
    } catch (error) {
      setDevOtpError(
        error instanceof Error ? error.message : 'Cannot load DEV OTP'
      );
    } finally {
      setDevOtpLoading(false);
    }
  };

  // SCHOLYX_AUTO_DEV_OTP_POPUP_V1
  useEffect(() => {
    const email = pendingRegistration?.email;
    if (!import.meta.env.DEV || !email) return;
    if (devOtpAutoFetchedEmail.current === email) return;

    devOtpAutoFetchedEmail.current = email;
    void showDevOtp();
  }, [pendingRegistration?.email]);
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullOtp = otpDigits.join('');
    if (!/^\d{6}$/.test(fullOtp)) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    if (!pendingRegistration?.email) {
      setErrorMessage('Thiếu email đăng ký. Hãy quay lại trang Đăng ký.');
      return;
    }
    if (timeLeft <= 0) {
      setErrorMessage('OTP đã hết hạn. Vui lòng đăng ký lại để nhận mã mới.');
      return;
    }
    setIsVerifying(true);
    try {
      await authApi.activate(pendingRegistration.email, fullOtp);
      setIsSuccess(true);
      setPendingRegistration(null);
      // Activation does not create a login session. Explicit login is required.
      setTimeout(() => onNavigate('auth-login'), 900);
    } catch (error) {
      setAttemptsLeft(prev => Math.max(0, prev - 1));
      setErrorMessage(error instanceof Error ? error.message : 'Không thể xác thực OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const handleResend = () => {
    setResendNotice('Chức năng gửi lại OTP chưa có API. Vui lòng quay lại Đăng ký để lấy mã mới.');
    setTimeout(() => setResendNotice(null), 6000);
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
          <span>Xác thực OTP</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white font-space">
          Kích Hoạt Tài Khoản
        </h2>
        <p className="text-xs text-slate-300">
          Nhập mã xác thực 6 số gửi tới <strong className="text-cyan-300">{pendingRegistration?.email || 'hocsinh@scholyx.edu.vn'}</strong>
        </p>
      </div>

      {import.meta.env.DEV && devOtpModalOpen && devOtpCode && !isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Development OTP"
            className="w-full max-w-sm rounded-3xl border border-cyan-500/40 bg-[#11172e] p-6 shadow-2xl text-center space-y-4"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Scholyx - DEV OTP
            </div>
            <p className="text-sm text-slate-300">
              Ma OTP thu nghiem cua ban:
            </p>
            <div className="rounded-2xl bg-black/30 border border-white/10 p-4 text-3xl font-mono font-extrabold tracking-[0.25em] text-cyan-200">
              {devOtpCode}
            </div>
            <p className="text-xs text-slate-400">
              Hieu luc 10 phut. Chi dung trong moi truong phat trien.
            </p>
            <button
              type="button"
              onClick={() => setDevOtpModalOpen(false)}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-white text-sm font-bold transition"
            >
              Dong va nhap OTP
            </button>
          </div>
        </div>
      )}
      {isSuccess ? (
        <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-3 animate-fadeIn">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Xác Thực Thành Công!</h3>
          <p className="text-xs text-slate-300">
            Tài khoản đã chuyển sang trạng thái <strong>Hoạt động</strong>. Đang chuyển tới Đăng nhập để bắt đầu học...
          </p>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          {import.meta.env.DEV && pendingRegistration?.email && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 space-y-2">
              <p className="text-xs font-bold text-cyan-300">
                DEV ONLY - Hop thu OTP thu nghiem
              </p>
              <button
                type="button"
                disabled={devOtpLoading}
                onClick={showDevOtp}
                className="text-xs px-3 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
              >
                {devOtpLoading ? 'Dang lay ma...' : 'Xem OTP thu nghiem'}
              </button>
              {devOtpCode && (
                <div className="text-center text-2xl font-mono font-bold tracking-widest text-cyan-200">
                  {devOtpCode}
                </div>
              )}
              {devOtpError && (
                <p className="text-xs text-rose-300">{devOtpError}</p>
              )}
              <p className="text-[10px] text-slate-400">
                Chi dung tren localhost. Khong su dung OTP nay trong production.
              </p>
            </div>
          )}
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
              <span>Hướng dẫn nhận OTP mới</span>
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
