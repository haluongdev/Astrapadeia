import React, { useState } from 'react';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { ScreenId } from '../../types';
import { useApp } from '../../context/AppContext';

interface AuthLoginScreenProps {
  onNavigate: (screenId: ScreenId) => void;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onNavigate }) => {
  const { loginWithCredentials } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SCHOLYX_REAL_LOGIN_V1: send credentials to the backend.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await loginWithCredentials(identifier, password);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
      setPassword('');
      onNavigate(res.targetScreen || 'home');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 p-6 sm:p-8 rounded-3xl cosmic-card border border-indigo-500/30 relative shadow-2xl">
      {/* Decorative gradient glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600/30 via-purple-600/30 to-cyan-500/30 border border-indigo-500/40 text-cyan-300 shadow-inner">
            <LogIn className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-cyan-400">
            <span className="font-mono">Màn hình 02</span>
            <span>•</span>
            <span>Xác thực Scholyx (UC001)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-space">
            Đăng Nhập Tài Khoản
          </h2>
          <p className="text-xs text-slate-400">
            Học tập, luyện thi THPT và kết nối Trợ lý AI theo chuẩn GDPT 2018
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Email hoặc Số điện thoại:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="name@scholyx.edu.vn hoặc 0981234567"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Mật khẩu:</label>
              <button
                type="button"
                onClick={() => onNavigate('auth-forgot')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-400"
              />
              <span>Ghi nhớ đăng nhập trên thiết bị này</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition interactive-bounce disabled:opacity-50"
          >
            {isLoading ? (
              <span>Đang xác thực thông tin...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Vào Scholyx</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Links to Register & OTP */}
        <div className="text-center space-y-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div>
            Chưa có tài khoản?{' '}
            <button
              onClick={() => onNavigate('auth-register')}
              className="text-cyan-300 font-bold hover:underline"
            >
              Đăng ký tài khoản mới ngay
            </button>
          </div>
          <div>
            Có mã kích hoạt?{' '}
            <button
              onClick={() => onNavigate('auth-otp')}
              className="text-indigo-300 hover:underline"
            >
              Nhập mã OTP kích hoạt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
