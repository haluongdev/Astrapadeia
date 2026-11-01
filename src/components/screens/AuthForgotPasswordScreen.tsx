import React, { useState } from 'react';
import {
  Key,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { ScreenId } from '../../types';
import { authApi } from '../../services/authApi';

interface AuthForgotPasswordScreenProps {
  onNavigate: (screenId: ScreenId) => void;
}

export const AuthForgotPasswordScreen: React.FC<AuthForgotPasswordScreenProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devResetOtp, setDevResetOtp] = useState('');
  const [showDevResetOtp, setShowDevResetOtp] = useState(false);

  // SCHOLYX_REAL_PASSWORD_RESET_V1
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ đã đăng ký.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authApi.forgotPassword(normalizedEmail);
      setEmail(normalizedEmail);
      setStep(2);

      // Only show test OTP on a locally served development frontend.
      const localFrontend = ['localhost', '127.0.0.1']
        .includes(window.location.hostname);

      if (import.meta.env.DEV && localFrontend && result.devOtp) {
        setDevResetOtp(result.devOtp);
        setShowDevResetOtp(true);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không thể gửi yêu cầu khôi phục mật khẩu.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!/^\d{6}$/.test(resetCode.trim())) {
      setErrorMessage('Vui lòng nhập mã xác nhận gồm đúng 6 chữ số.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(
        email.trim().toLowerCase(),
        resetCode.trim(),
        newPassword
      );

      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setDevResetOtp('');
      setShowDevResetOtp(false);
      setStep(3);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Đặt lại mật khẩu thất bại.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto my-6 p-6 sm:p-8 rounded-3xl cosmic-card border border-indigo-500/30 relative shadow-2xl">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-indigo-600/30 to-cyan-500/30 border border-amber-500/40 text-amber-300 shadow-inner">
          <Key className="w-7 h-7" />
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-cyan-400">
          <span className="font-mono">Màn hình 05</span>
          <span>•</span>
          <span>Khôi phục Mật khẩu</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white font-space">
          {step === 1 && 'Khôi Phục Mật Khẩu'}
          {step === 2 && 'Đặt Lại Mật Khẩu Mới'}
          {step === 3 && 'Hoàn Tất Đặt Mật Khẩu'}
        </h2>
        <p className="text-xs text-slate-400">
          {step === 1 && 'Nhập email hoặc SĐT để nhận mã đặt lại mật khẩu an toàn'}
          {step === 2 && 'Nhập mã xác nhận và mật khẩu mới đủ độ phức tạp'}
          {step === 3 && 'Mật khẩu của bạn đã được cập nhật thành công'}
        </p>
      </div>

      {import.meta.env.DEV &&
        ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
        showDevResetOtp &&
        devResetOtp &&
        step === 2 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="OTP khôi phục thử nghiệm"
              className="w-full max-w-sm rounded-3xl border border-cyan-500/40 bg-[#11172e] p-6 shadow-2xl text-center space-y-4"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                Scholyx - DEV RESET OTP
              </div>

              <p className="text-sm text-slate-300">
                Mã khôi phục mật khẩu thử nghiệm:
              </p>

              <div className="rounded-2xl bg-black/30 border border-white/10 p-4 text-3xl font-mono font-extrabold tracking-[0.25em] text-cyan-200">
                {devResetOtp}
              </div>

              <p className="text-xs text-slate-400">
                Có hiệu lực 10 phút. Chỉ sử dụng trên localhost development.
              </p>

              <button
                type="button"
                onClick={() => setShowDevResetOtp(false)}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-white text-sm font-bold transition"
              >
                Đóng và nhập OTP
              </button>
            </div>
          </div>
        )}
      {errorMessage && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Địa chỉ Email hoặc SĐT đã đăng ký:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hocsinh@scholyx.edu.vn"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition interactive-bounce disabled:opacity-50"
          >
            {isLoading ? <span>Đang kiểm tra tài khoản...</span> : <span>Gửi Mã Đặt Lại Mật Khẩu</span>}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Mã xác nhận (gửi qua email):
            </label>
            <input
              type="text"
              value={resetCode}
              onChange={e => setResetCode(e.target.value)}
              placeholder="VD: 849201"
              className="w-full p-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-cyan-300 font-mono font-bold text-center tracking-widest text-base focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Mật khẩu mới:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, chữ & số"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Xác nhận mật khẩu mới:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại chính xác mật khẩu mới"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition interactive-bounce disabled:opacity-50"
          >
            {isLoading ? <span>Đang cập nhật...</span> : <span>Lưu Mật Khẩu & Đăng Xuất Mọi Thiết Bị</span>}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center space-y-4 py-2 animate-fadeIn">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Đổi Mật Khẩu Thành Công!</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Các phiên đăng nhập cũ trên thiết bị khác đã được thu hồi an toàn. Bạn có thể đăng nhập ngay với mật khẩu mới.
          </p>
          <button
            onClick={() => onNavigate('auth-login')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 transition interactive-bounce"
          >
            <span>Đến Trang Đăng Nhập</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="text-center pt-4 border-t border-white/5 text-xs text-slate-400">
        <button
          onClick={() => onNavigate('auth-login')}
          className="text-cyan-300 hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Đăng nhập</span>
        </button>
      </div>
    </div>
  );
};
