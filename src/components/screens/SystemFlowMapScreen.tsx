import React, { useState } from 'react';
import {
  Network,
  Compass,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
  Crown,
  BookOpen,
  PenTool,
  Award,
  Layers,
  Bot,
  Settings,
  HelpCircle,
  FileText,
  Key,
  Shield,
  Upload,
  MessageSquare,
  Sliders,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { ScreenId, UserRole } from '../../types';
import { SCREEN_REGISTRY, SCREEN_CATEGORIES, getScreenMetadata } from '../../routes/screenRegistry';
import { useApp } from '../../context/AppContext';

interface SystemFlowMapScreenProps {
  onNavigate: (screenId: ScreenId) => void;
}

export const SystemFlowMapScreen: React.FC<SystemFlowMapScreenProps> = ({ onNavigate }) => {
  const { currentUser, switchRole } = useApp();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScreens = SCREEN_REGISTRY.filter(screen => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      screen.title.toLowerCase().includes(q) ||
      screen.screenNumber.includes(q) ||
      screen.path.toLowerCase().includes(q) ||
      screen.category.toLowerCase().includes(q);

    const matchRole =
      selectedRoleFilter === 'all' ||
      screen.allowedRoles.includes('all') ||
      screen.allowedRoles.includes(selectedRoleFilter);

    return matchQuery && matchRole;
  });

  const flows = [
    {
      id: 'guest',
      title: '1. Luồng Khách Tham Quan (Guest)',
      color: 'border-slate-500/30 bg-slate-900/40 text-slate-300',
      description: 'Tiếp cận nội dung công khai, trải nghiệm làm thử 10 câu, đăng ký tài khoản mới và xác minh OTP.',
      screenIds: ['home', 'auth-login', 'auth-register', 'auth-otp', 'auth-forgot'] as ScreenId[]
    },
    {
      id: 'student_core',
      title: '2. Luồng Học Sinh: Học Tập & Luyện Đề (Core Student)',
      color: 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300',
      description: 'Khởi tạo mục tiêu điểm số, học bài giảng GDPT 2018, luyện tập 3 dạng câu chuẩn 764, thu thập sổ lỗi.',
      screenIds: ['onboarding', 'overview-free', 'lessons', 'lesson-detail', 'practice-setup', 'practice-room', 'practice-result'] as ScreenId[]
    },
    {
      id: 'student_exam_ai',
      title: '3. Luồng Học Sinh: Thi Thử & Trợ Lý AI (Exam & AI)',
      color: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300',
      description: 'Làm đề thi thử 3 phần, xem phổ điểm toàn quốc, tra cứu Trợ lý AI có trích dẫn nguồn sách giáo khoa.',
      screenIds: ['exam-catalog', 'exam-room', 'exam-result', 'review-progress', 'ai'] as ScreenId[]
    },
    {
      id: 'student_vip',
      title: '4. Luồng Học Sinh: VIP & Thuê Bao (Premium Services)',
      color: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
      description: 'Lộ trình tuần cá nhân hóa thích ứng, nâng cấp gói VIP qua VietQR tự động, quản lý hóa đơn và quyền riêng tư.',
      screenIds: ['vip-roadmap', 'vip-pricing', 'profile-settings'] as ScreenId[]
    },
    {
      id: 'qtnd',
      title: '5. Luồng Quản Trị Nội Dung: Giáo Viên & Ban Biên Tập (QTND)',
      color: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
      description: 'Biên soạn bài học, quản lý ngân hàng câu hỏi, sinh đề AI theo ma trận, chấm bài tự luận, duyệt kho RAG.',
      screenIds: ['cms-lessons', 'cms-questions', 'cms-matrix', 'cms-grading', 'cms-rag', 'cms-feedback'] as ScreenId[]
    },
    {
      id: 'qtv',
      title: '6. Luồng Quản Trị Hệ Thống: Vận Hành & An Ninh (QTV)',
      color: 'border-rose-500/30 bg-rose-950/40 text-rose-300',
      description: 'Quản trị người dùng, khóa/mở tài khoản, phân quyền RBAC, cấu hình hệ thống, kiểm toán Audit Log và đối soát doanh thu.',
      screenIds: ['admin-overview', 'admin-roles', 'admin-config-audit', 'system-flow'] as ScreenId[]
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl cosmic-card border border-indigo-500/25 relative overflow-hidden box-lift">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400 mb-2">
            <Network className="w-4 h-4" />
            <span>Màn hình 30 • 00 · Tổng quan hệ thống & Bản đồ luồng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
            Bản Đồ Kiến Trúc & Điều Hướng 30 Màn Hình Figma
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Hệ thống hóa toàn bộ các màn hình chức năng của dự án Scholyx theo quy chuẩn ISO/IEC/IEEE 29148. Bạn có thể bấm vào bất kỳ màn hình nào để điều hướng ngay lập tức.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#090d20] border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
            30 MÀN HÌNH CHUẨN
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs">
            ISO/IEC/IEEE 29148
          </div>
        </div>
      </div>

      {/* Role Switcher & Filter Controls */}
      <div className="p-4 rounded-2xl cosmic-card border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số thứ tự (01-30) hoặc tên chức năng..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
            Lọc theo vai trò:
          </span>
          {[
            { id: 'all', label: 'Tất cả (30)' },
            { id: 'guest', label: 'Khách' },
            { id: 'student', label: 'Học Sinh' },
            { id: 'qtnd', label: 'QTND (Giáo viên)' },
            { id: 'qtv', label: 'QTV (Admin)' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleFilter(r.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedRoleFilter === r.id
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-[#090d20] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Structured User Journey Flows */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-white font-space flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Bản Đồ 6 Luồng Nghiệp Vụ Chuẩn (User Journey Flows)</span>
        </h3>

        <div className="space-y-6">
          {flows.map(flow => {
            const flowScreens = flow.screenIds
              .map(id => SCREEN_REGISTRY.find(s => s.id === id))
              .filter(Boolean) as typeof SCREEN_REGISTRY;

            return (
              <div
                key={flow.id}
                className={`p-5 rounded-2xl border ${flow.color} cosmic-glass space-y-4`}
              >
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white">{flow.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{flow.description}</p>
                </div>

                {/* Flow steps container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {flowScreens.map((screen, idx) => (
                    <div
                      key={screen.id}
                      onClick={() => onNavigate(screen.id)}
                      className="group p-3.5 rounded-xl bg-[#080c1d]/90 hover:bg-[#111736] border border-white/10 hover:border-cyan-400 transition cursor-pointer flex flex-col justify-between space-y-2 box-lift-subtle"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center font-mono font-bold text-cyan-300 text-xs">
                            {screen.screenNumber}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            #{screen.path}
                          </span>
                        </div>

                        {screen.badge && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {screen.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-white group-hover:text-cyan-300 transition line-clamp-1">
                          {screen.title.replace(/^\d+\s*·\s*/, '')}
                        </h5>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {screen.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-cyan-400 font-semibold">
                        <span>Truy cập</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Alphabetical/Numerical Registry Table */}
      <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white font-space flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Danh Sách Đầy Đủ 30 Màn Hình ({filteredScreens.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Click để chuyển ngay màn hình</span>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#090d20] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Số</th>
                  <th className="py-3 px-4">Tên Màn Hình Figma</th>
                  <th className="py-3 px-3">Vai Trò</th>
                  <th className="py-3 px-3">Đường Dẫn</th>
                  <th className="py-3 px-3">Màn Hình Nguồn</th>
                  <th className="py-3 px-3">Màn Hình Đích</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                  <th className="py-3 px-3 text-right">Điều Hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredScreens.map(screen => (
                  <tr
                    key={screen.id}
                    onClick={() => onNavigate(screen.id)}
                    className="hover:bg-white/5 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      {screen.screenNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-white max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{screen.title}</span>
                        {screen.badge && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 shrink-0">
                            {screen.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">{screen.category}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {screen.allowedRoles.includes('all') ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200">
                            Tất cả
                          </span>
                        ) : (
                          screen.allowedRoles.map(role => (
                            <span
                              key={role}
                              className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            >
                              {role}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400 text-[11px] whitespace-nowrap">
                      #{screen.path}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-300 max-w-xs">
                      {screen.sourceScreens || 'Trang chủ, Navbar'}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-cyan-200 max-w-xs">
                      {screen.targetScreens || 'Trang chủ'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{screen.implementationStatus || 'Hoàn thành'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onNavigate(screen.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-cyan-300 hover:text-white text-xs font-bold transition inline-flex items-center gap-1 interactive-bounce"
                      >
                        <span>Mở</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
