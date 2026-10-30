import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  PenTool,
  Award,
  BarChart3,
  Bot,
  Crown,
  Layers,
  ShieldCheck,
  User,
  ChevronDown,
  Compass,
  AlertOctagon,
  LogOut,
  Settings,
  Bell,
  Menu,
  X,
  Search,
  Network,
  PanelLeft,
  GraduationCap,
  ExternalLink,
  Shield,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Users,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, ScreenId } from '../types';
import { getScreenMetadata, SCREEN_REGISTRY, canAccessScreen } from '../routes/screenRegistry';

interface NavbarProps {
  onOpenVIPModal: () => void;
  onOpenProfileModal: () => void;
  onOpenFeedbackModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVIPModal,
  onOpenProfileModal,
  onOpenFeedbackModal
}) => {
  const {
    currentUser,
    switchRole,
    activeScreenId,
    navigateTo,
    mistakeItems,
    toggleSidebar,
    setSearchPaletteOpen
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unresolvedMistakesCount = mistakeItems.filter(m => !m.resolved).length;

  // Dynamic role-based navigation items (Yêu cầu 6, 7, 8)
  const getRoleBasedNavItems = (): {
    primary: Array<{ id: ScreenId; label: string; icon: React.ElementType; isAura?: boolean; params?: Record<string, any> }>;
    more: Array<{ id: ScreenId; label: string; icon: React.ElementType; badge?: string; desc: string; params?: Record<string, any> }>;
  } => {
    // 1. Quản trị viên (QTV)
    if (currentUser.role === 'qtv') {
      return {
        primary: [
          { id: 'home', label: 'Trang Chủ', icon: Compass },
          { id: 'admin-overview', label: 'Tài Khoản', icon: Users },
          { id: 'admin-roles', label: 'Phân Quyền RBAC', icon: ShieldCheck },
          { id: 'admin-config-audit', label: 'Audit Log & Cấu Hình', icon: Sliders },
          { id: 'vip-pricing', label: 'Gói VIP & Giao Dịch', icon: Crown }
        ],
        more: [
          {
            id: 'cms-lessons',
            label: 'Giám Sát Bài Giảng',
            icon: BookOpen,
            desc: 'Theo dõi tiến độ xuất bản của đội ngũ QTND'
          },
          {
            id: 'overview-free',
            label: 'Thống Kê Học Sinh',
            icon: LayoutDashboard,
            desc: 'Theo dõi lưu lượng và hạn mức hệ thống'
          },
          {
            id: 'system-flow',
            label: '00 · Bản Đồ 30 Màn Hình',
            icon: Network,
            badge: 'MAP',
            desc: 'Sơ đồ luồng toàn hệ thống theo chuẩn Figma'
          }
        ]
      };
    }

    // 2. Quản trị nội dung (QTND - Giáo viên)
    if (currentUser.role === 'qtnd') {
      return {
        primary: [
          { id: 'home', label: 'Trang Chủ', icon: Compass },
          { id: 'cms-lessons', label: 'Soạn Bài Học', icon: BookOpen },
          { id: 'cms-questions', label: 'Ngân Hàng Câu Hỏi', icon: PenTool },
          { id: 'cms-matrix', label: 'Ma Trận & AI', icon: Sparkles },
          { id: 'cms-grading', label: 'Chấm Tự Luận', icon: Award },
          { id: 'cms-rag', label: 'Kho Tri Thức RAG', icon: Settings }
        ],
        more: [
          {
            id: 'cms-feedback',
            label: 'Phản Hồi & Báo Lỗi',
            icon: AlertOctagon,
            desc: 'Xử lý báo lỗi câu hỏi từ học sinh'
          },
          {
            id: 'lessons',
            label: 'Xem Trước Bài Học',
            icon: BookOpen,
            desc: 'Kiểm tra hiển thị giao diện học sinh'
          },
          {
            id: 'exam-catalog',
            label: 'Xem Trước Đề Thi',
            icon: Award,
            desc: 'Kiểm tra hiển thị đề thi tốt nghiệp'
          },
          {
            id: 'system-flow',
            label: '00 · Bản Đồ 30 Màn Hình',
            icon: Network,
            badge: 'MAP',
            desc: 'Sơ đồ luồng toàn hệ thống theo chuẩn Figma'
          }
        ]
      };
    }

    // 3. Khách tham quan (Guest)
    if (currentUser.role === 'guest') {
      return {
        primary: [
          { id: 'home', label: 'Trang Chủ', icon: Compass },
          { id: 'lessons', label: 'Khóa Ôn Luyện', icon: BookOpen },
          { id: 'practice-setup', label: 'Luyện Tập', icon: PenTool },
          { id: 'exam-catalog', label: 'Thi Thử', icon: Award },
          { id: 'vip-pricing', label: 'Bảng Giá VIP', icon: Crown },
          { id: 'auth-login', label: 'Đăng Nhập', icon: User }
        ],
        more: [
          {
            id: 'auth-register',
            label: 'Đăng Ký Tài Khoản Mới',
            icon: Sparkles,
            badge: 'FREE',
            desc: 'Đăng ký tài khoản nhận ngay 30 câu/ngày'
          },
          {
            id: 'auth-forgot',
            label: 'Khôi Phục Mật Khẩu',
            icon: Settings,
            desc: 'Đặt lại mật khẩu an toàn qua email/OTP'
          },
          {
            id: 'overview-free',
            label: 'Giới Thiệu Gói Free',
            icon: LayoutDashboard,
            desc: 'Xem quyền lợi và radar điểm yếu mẫu'
          },
          {
            id: 'system-flow',
            label: '00 · Bản Đồ 30 Màn Hình',
            icon: Network,
            badge: 'MAP',
            desc: 'Sơ đồ luồng toàn hệ thống theo chuẩn Figma'
          }
        ]
      };
    }

    // 4. Học sinh (Student - Free & VIP)
    return {
      primary: [
        { id: 'home', label: 'Trang Chủ', icon: Compass },
        { id: 'lessons', label: 'Khóa Ôn Luyện', icon: BookOpen },
        { id: 'practice-setup', label: 'Luyện Tập', icon: PenTool },
        { id: 'exam-catalog', label: 'Thi Thử', icon: Award },
        { id: 'ai', label: 'Trợ Lý AI', icon: Bot, isAura: true },
        { id: 'review-progress', label: 'Tiến Độ Học Tập', icon: BarChart3, params: { tab: 'progress' } }
      ],
      more: [
        {
          id: 'practice-result',
          label: 'Sổ Câu Sai Tự Động',
          icon: AlertOctagon,
          badge: unresolvedMistakesCount > 0 ? `${unresolvedMistakesCount}` : undefined,
          desc: 'Tập hợp câu trả lời sai để rèn luyện củng cố'
        },
        {
          id: 'review-progress',
          label: 'Ôn Tập Tổng Hợp',
          icon: Layers,
          params: { tab: 'review' },
          desc: 'Sổ tay công thức cốt lõi và mốc thời gian thi 2026'
        },
        {
          id: 'vip-roadmap',
          label: 'Lộ Trình Tuần VIP',
          icon: Calendar,
          badge: 'VIP',
          desc: 'Kế hoạch học tập thích ứng cá nhân hóa'
        },
        {
          id: 'overview-free',
          label: 'Tổng Quan Gói FREE',
          icon: LayoutDashboard,
          desc: 'Theo dõi hạn mức 30 câu/ngày và radar điểm yếu'
        },
        {
          id: 'vip-pricing',
          label: 'Gói VIP & Thanh Toán',
          icon: Crown,
          badge: 'HOT',
          desc: 'Bảng giá và thanh toán VietQR tự động'
        },
        {
          id: 'system-flow',
          label: '00 · Bản Đồ 30 Màn Hình',
          icon: Network,
          badge: 'MAP',
          desc: 'Sơ đồ luồng toàn hệ thống theo chuẩn Figma'
        }
      ]
    };
  };

  const { primary: primaryNavItems, more: moreNavItems } = getRoleBasedNavItems();

  const notifications = [
    {
      id: 'notif-1',
      title: 'Bộ GD&ĐT công bố định dạng đề thi 2026',
      desc: 'Cấu trúc 3 phần chuẩn QĐ 764 đã được tích hợp đầy đủ vào hệ thống Scholyx.',
      time: '10 phút trước',
      unread: true,
      actionScreen: 'exam-catalog' as ScreenId
    },
    {
      id: 'notif-2',
      title: 'Nhắc nhở lộ trình học tập tuần 12',
      desc: 'Bạn còn 2 bài tập cần hoàn thành hôm nay để giữ chuỗi học 14 ngày!',
      time: '2 giờ trước',
      unread: true,
      actionScreen: 'home' as ScreenId
    },
    {
      id: 'notif-3',
      title: 'Trợ lý AI Cosmos cập nhật kho tri thức RAG',
      desc: 'Đã bổ sung bộ công thức Giải tích Oxyz và Vật lí nhiệt lớp 12 mới nhất.',
      time: 'Hôm qua',
      unread: false,
      actionScreen: 'ai' as ScreenId
    }
  ];

  const roleLabels: Record<string, { title: string; color: string; desc: string }> = {
    guest: { title: 'Khách Tham Quan', color: 'text-slate-400 bg-slate-800/80', desc: 'Chưa đăng nhập, làm thử 10 câu' },
    'student-free': { title: 'Học Sinh (Free)', color: 'text-indigo-400 bg-indigo-950/60 border border-indigo-500/30', desc: 'Gói Miễn phí chuẩn' },
    'student-vip': { title: 'Học Sinh (VIP)', color: 'text-amber-300 bg-amber-950/60 border border-amber-500/40', desc: 'Đặc quyền vũ trụ không giới hạn' },
    qtnd: { title: 'QTND (Giáo Viên)', color: 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/40', desc: 'Quản lý ngân hàng đề & RAG' },
    qtv: { title: 'Quản Trị Viên (QTV)', color: 'text-rose-300 bg-rose-950/60 border border-rose-500/40', desc: 'Hệ thống, phân quyền, giao dịch' }
  };

  const getCurrentRoleKey = () => {
    if (currentUser.role === 'guest') return 'guest';
    if (currentUser.role === 'student') return currentUser.vipTier === 'vip' ? 'student-vip' : 'student-free';
    if (currentUser.role === 'qtnd') return 'qtnd';
    return 'qtv';
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-indigo-900/30 cosmic-glass backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left Section: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sidebar Drawer Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition interactive-bounce"
            title="Mở menu 30 màn hình (Sidebar)"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          {/* Brand Logo - Click quay về Trang chủ */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left group transition shrink-0"
            title="Quay về Trang chủ Scholyx"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-cyan-500/40 transition">
              <div className="w-full h-full bg-[#090d1f] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl font-space tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent group-hover:brightness-110 transition">
                  SCHOLYX
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                  GDPT 2018
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block -mt-0.5">
                Vũ Trụ Ôn Thi THPT 2026
              </p>
            </div>
          </button>
        </div>

        {/* Center Section: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive =
              activeScreenId === item.id ||
              (item.id === 'lessons' && activeScreenId === 'lesson-detail') ||
              (item.id === 'practice-setup' && activeScreenId === 'practice-room') ||
              (item.id === 'exam-catalog' && (activeScreenId === 'exam-room' || activeScreenId === 'exam-result'));

            return (
              <button
                key={item.id + (item.params?.tab || '')}
                onClick={() => navigateTo(item.id, item.params)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 interactive-bounce ${
                  isActive
                    ? 'text-cyan-300 bg-indigo-500/25 border border-indigo-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 box-lift-subtle'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.isAura && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}

          {/* Menu mở rộng (Dropdown for additional features) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowNotifications(false);
                setShowRoleMenu(false);
                setShowUserMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1 interactive-bounce"
              title="Menu mở rộng cho các chức năng khác"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
              <span>Khám Phá</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showMoreMenu && (
              <div
                onMouseLeave={() => setShowMoreMenu(false)}
                className="absolute left-0 mt-2 w-72 rounded-2xl cosmic-card p-2 border border-indigo-500/40 shadow-2xl z-50 text-xs animate-fadeIn"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                  Chức Năng Mở Rộng
                </div>

                <div className="space-y-1">
                  {moreNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id + (item.params?.tab || '')}
                        onClick={() => {
                          navigateTo(item.id, item.params);
                          setShowMoreMenu(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-white/5 transition flex items-start gap-2.5 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-white group-hover:text-cyan-300 transition truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Notification, Role Switcher, VIP Pill & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick 30-Screen Switcher / Command Palette trigger */}
          <button
            onClick={() => setSearchPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-cyan-300 text-xs font-semibold transition interactive-bounce"
            title="Mở bảng điều hướng 30 màn hình Figma (Phím tắt: ⌘K hoặc Ctrl+K)"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">30 Màn hình</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-white/10 rounded text-slate-300">
              ⌘K
            </kbd>
          </button>

          {/* Biểu tượng thông báo (Notification Bell) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMoreMenu(false);
                setShowRoleMenu(false);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-xl bg-[#0e1329] border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 transition relative interactive-bounce"
              title="Thông báo học tập & đề thi mới"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute top-1.5 right-1.5" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5" />
            </button>

            {showNotifications && (
              <div
                onMouseLeave={() => setShowNotifications(false)}
                className="absolute right-0 mt-2 w-80 rounded-2xl cosmic-card p-3 border border-indigo-500/40 shadow-2xl z-50 text-xs animate-fadeIn"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Thông Báo Mới</span>
                  </div>
                  <span className="text-[10px] text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded font-mono">
                    2 Chưa đọc
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        navigateTo(n.actionScreen);
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition border ${
                        n.unread
                          ? 'bg-indigo-950/40 border-indigo-500/30 hover:border-cyan-400'
                          : 'bg-white/5 border-transparent hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`font-bold text-[11px] ${n.unread ? 'text-cyan-200' : 'text-slate-300'}`}>
                          {n.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-white/10 text-center">
                  <button
                    onClick={() => {
                      onOpenFeedbackModal();
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-indigo-300 hover:text-white font-medium"
                  >
                    Báo lỗi hoặc góp ý cho ban biên tập
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher (Essential for testing all roles per SRS) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowMoreMenu(false);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/10 bg-[#0e1329] hover:border-indigo-500/40 transition"
              title="Chế độ thử nghiệm vai trò DEMO (Khách, Học sinh Free/VIP, QTND, QTV)"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="font-bold text-slate-200 text-[11px] sm:text-xs">
                {roleLabels[getCurrentRoleKey()]?.title.split(' ')[0]}
              </span>
              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden md:inline">
                DEMO
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl cosmic-card p-2 border border-indigo-500/40 shadow-2xl z-50 animate-fadeIn">
                <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-white/10 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Chuyển Vai Trò (Chế độ DEMO)
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PROTOTYPE
                  </span>
                </div>

                <button
                  onClick={() => {
                    switchRole('guest');
                    setShowRoleMenu(false);
                    navigateTo('home');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition mb-1 flex items-start gap-2 ${
                    currentUser.role === 'guest' ? 'bg-indigo-600/30 text-cyan-300 font-bold' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold">1. Khách Tham Quan</div>
                    <div className="text-[11px] text-slate-400">Xem công khai, làm thử 10 câu</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('student', 'free');
                    setShowRoleMenu(false);
                    navigateTo('overview-free');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition mb-1 flex items-start gap-2 ${
                    currentUser.role === 'student' && currentUser.vipTier === 'free'
                      ? 'bg-indigo-600/30 text-cyan-300 font-bold'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold">2. Học Sinh (Miễn Phí)</div>
                    <div className="text-[11px] text-slate-400">30 câu/ngày, 10 lượt hỏi AI/ngày</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('student', 'vip');
                    setShowRoleMenu(false);
                    navigateTo('home');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition mb-1 flex items-start gap-2 ${
                    currentUser.role === 'student' && currentUser.vipTier === 'vip'
                      ? 'bg-indigo-600/30 text-amber-300 font-bold'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-amber-300">3. Học Sinh (VIP Pass)</div>
                    <div className="text-[11px] text-slate-400">Luyện không giới hạn, 50 AI/ngày</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('qtnd');
                    setShowRoleMenu(false);
                    navigateTo('cms-lessons');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition mb-1 flex items-start gap-2 ${
                    currentUser.role === 'qtnd' ? 'bg-indigo-600/30 text-emerald-300 font-bold' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <Settings className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-300">4. QTND (Giáo Viên)</div>
                    <div className="text-[11px] text-slate-400">Quản lý bài học, đề, RAG</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('qtv');
                    setShowRoleMenu(false);
                    navigateTo('admin-overview');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-start gap-2 ${
                    currentUser.role === 'qtv' ? 'bg-indigo-600/30 text-rose-300 font-bold' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-rose-300">5. Quản Trị Viên (QTV)</div>
                    <div className="text-[11px] text-slate-400">Tài khoản, quyền, audit log</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User profile avatar & menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 overflow-hidden hover:ring-cyan-400 transition"
              title="Menu tài khoản cá nhân"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl cosmic-card p-2 border border-white/10 shadow-2xl z-50 text-xs animate-fadeIn">
                <div className="p-2 border-b border-white/10 mb-1">
                  <div className="font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-300">
                    <span className="capitalize">{currentUser.role}</span>
                    <span>•</span>
                    <span className="capitalize">{currentUser.vipTier}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigateTo('onboarding');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>06 · Hồ sơ & Mục tiêu</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigateTo('profile-settings');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  <span>20 · Cài đặt & Quyền riêng tư</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigateTo('system-flow');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-cyan-300 hover:bg-white/5 transition flex items-center gap-2 font-semibold"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>00 · Bản đồ 30 màn hình</span>
                </button>

                <div className="border-t border-white/10 my-1 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigateTo('auth-login');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>02 · Đăng nhập / Đổi tài khoản</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white lg:hidden"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-[#090d1f] border-b border-indigo-900/40 animate-fadeIn">
          <div className="p-2 mb-2 bg-[#0e1329] rounded-xl flex items-center justify-between">
            <button
              onClick={() => {
                setShowMobileMenu(false);
                setSearchPaletteOpen(true);
              }}
              className="text-xs font-bold text-cyan-300 flex items-center gap-1.5"
            >
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Khám phá 30 màn hình Figma</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">⌘K</span>
          </div>

          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeScreenId === item.id;
            return (
              <button
                key={item.id + (item.params?.tab || '')}
                onClick={() => {
                  navigateTo(item.id, item.params);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                  isActive ? 'bg-indigo-600/30 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          <div className="pt-2 border-t border-white/5 mt-2 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1">Khám phá thêm</div>
            {moreNavItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id + (item.params?.tab || '')}
                  onClick={() => {
                    navigateTo(item.id, item.params);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
