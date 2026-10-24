import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { ScreenId } from '../../types';
import { useApp } from '../../context/AppContext';

interface AuthRegisterScreenProps {
  onNavigate: (screenId: ScreenId) => void;
}

export const AuthRegisterScreen: React.FC<AuthRegisterScreenProps> = ({ onNavigate }) => {
  const { setPendingRegistration } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState<'10' | '11' | '12'>('12');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tất cả các trường thông tin bắt buộc.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Định dạng email không hợp lệ (ví dụ: hocsinh@gmail.com).');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có tối thiểu 8 ký tự theo quy định BR-ACC-02.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setErrorMessage('Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo vệ dữ liệu cá nhân theo Luật 2025.');
      return;
    }

    setIsLoading(true);
    // Temporarily store registration data to complete the demo flow (Requirement 4)
    setPendingRegistration({
      name: name.trim(),
      email: email.trim(),
      grade: parseInt(grade, 10) as 10 | 11 | 12,
      password: password.trim()
    });

    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP verification screen
      onNavigate('auth-otp');
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto my-6 p-6 sm:p-8 rounded-3xl cosmic-card border border-indigo-500/30 relative shadow-2xl">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-indigo-600/30 to-purple-600/30 border border-cyan-500/40 text-cyan-300 shadow-inner">
            <UserPlus className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-cyan-400">
            <span className="font-mono">Màn hình 03</span>
            <span>•</span>
            <span>Đăng ký Học sinh (UC002)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-space">
            Tạo Tài Khoản Mới
          </h2>
          <p className="text-xs text-slate-400">
            Bắt đầu hành trình chinh phục kỳ thi tốt nghiệp THPT chuẩn GDPT 2018
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Họ và tên học sinh: <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Email đăng ký: <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hocsinh@scholyx.edu.vn"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Khối lớp đang học (GDPT 2018): <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['10', '11', '12'] as const).map(g => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    grade === g
                      ? 'bg-indigo-600 border-cyan-400 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-[#0a0e22] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Lớp {g}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Mật khẩu: <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, chữ & số"
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

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Xác nhận mật khẩu: <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại chính xác mật khẩu"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Legal Compliance (FR-AUTH-02, Law 91/2025/QH15) */}
          <div className="space-y-2 pt-1 border-t border-white/5">
            <label className="flex items-start gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-cyan-400"
              />
              <span className="leading-snug">
                Tôi đồng ý với <strong className="text-cyan-300">Điều khoản sử dụng</strong> của hệ thống học tập Scholyx.
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={e => setAgreePrivacy(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-cyan-400"
              />
              <span className="leading-snug">
                Đồng ý với <strong className="text-cyan-300">Chính sách bảo vệ dữ liệu cá nhân</strong> theo Luật số 91/2025/QH15.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition interactive-bounce disabled:opacity-50"
          >
            {isLoading ? (
              <span>Đang gửi mã kích hoạt...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Đăng Ký & Nhận Mã OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link back to login */}
        <div className="text-center pt-2 border-t border-white/5 text-xs text-slate-400">
          Đã có tài khoản?{' '}
          <button
            onClick={() => onNavigate('auth-login')}
            className="text-cyan-300 font-bold hover:underline"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};
