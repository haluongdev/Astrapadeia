import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { StarfieldBackground } from './components/StarfieldBackground';
import { Navbar } from './components/Navbar';
import { Breadcrumbs } from './components/common/Breadcrumbs';
import { CosmicSidebar } from './components/common/CosmicSidebar';
import { ScreenNavigatorModal } from './components/common/ScreenNavigatorModal';

// Screen Components
import { StudentHome } from './components/StudentHome';
import { AuthLoginScreen } from './components/screens/AuthLoginScreen';
import { AuthRegisterScreen } from './components/screens/AuthRegisterScreen';
import { AuthOtpScreen } from './components/screens/AuthOtpScreen';
import { AuthForgotPasswordScreen } from './components/screens/AuthForgotPasswordScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { FreeOverviewScreen } from './components/screens/FreeOverviewScreen';
import { SystemFlowMapScreen } from './components/screens/SystemFlowMapScreen';
import { ScreenPlaceholder } from './components/common/ScreenPlaceholder';

import { LearningModule } from './components/LearningModule';
import { PracticeModule } from './components/PracticeModule';
import { MistakeNotebook } from './components/MistakeNotebook';
import { MockExamModule } from './components/MockExamModule';
import { ComprehensiveReview } from './components/ComprehensiveReview';
import { ProgressModule } from './components/ProgressModule';
import { AIAssistantModule } from './components/AIAssistantModule';
import { ContentAdminModule } from './components/ContentAdminModule';
import { SystemAdminModule } from './components/SystemAdminModule';

// Modals
import { VIPPaymentModal } from './components/VIPPaymentModal';
import { UserProfileModal } from './components/UserProfileModal';
import { GuestTrialModal } from './components/GuestTrialModal';
import { FeedbackModal } from './components/FeedbackModal';

import { Question } from './types';
import { Sparkles, Network, ArrowUpRight, MessageSquare, Crown, ShieldCheck, LogIn, Lock, UserPlus, Play, BarChart3, Layers, AlertCircle } from 'lucide-react';
import { getScreenMetadata, canAccessScreen } from './routes/screenRegistry';

const MainAppContent: React.FC = () => {
  const {
    activeScreenId,
    navigateTo,
    switchRole,
    currentUser,
    isSidebarOpen,
    setSidebarOpen,
    isSearchPaletteOpen,
    setSearchPaletteOpen,
    screenParams
  } = useApp();

  // Modals state
  const [showVIPModal, setShowVIPModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showTrialModal, setShowTrialModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Injected context for AI assistant
  const [aiContextQuestion, setAiContextQuestion] = useState<Question | null>(null);

  const handleAskAIWithQuestion = (q: Question) => {
    setAiContextQuestion(q);
    navigateTo('ai');
  };

  const handleStartPracticeWithSubject = (subjectId?: string) => {
    navigateTo('practice-setup', { subjectId: subjectId || 'toan' });
  };

  const screenMeta = getScreenMetadata(activeScreenId);
  const accessResult = canAccessScreen(currentUser, activeScreenId);
  const isRoleAuthorized = accessResult.allowed;

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between cosmic-grid selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Twinkling Astronomical Starfield and Shooting Stars Canvas */}
      <StarfieldBackground />

      {/* 2. Collapsible Cosmic Navigation Sidebar (All 30 Screens) */}
      <CosmicSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeScreenId={activeScreenId}
        onNavigate={navigateTo}
      />

      {/* 3. Persistent Unified Header/Navbar */}
      <Navbar
        onOpenVIPModal={() => setShowVIPModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenFeedbackModal={() => setShowFeedbackModal(true)}
      />

      {/* 4. Quick Screen Navigator Modal (⌘K Command Palette) */}
      <ScreenNavigatorModal
        isOpen={isSearchPaletteOpen}
        onClose={() => setSearchPaletteOpen(false)}
        onSelectScreen={navigateTo}
      />

      {/* 5. Main Dynamic Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {/* Dynamic Breadcrumbs Navigation Bar */}
        <Breadcrumbs currentScreenId={activeScreenId} onNavigate={navigateTo} />

        {/* RBAC Authorization Guard with 3 specific guidance modes */}
        {!isRoleAuthorized ? (
          <div className="p-8 sm:p-12 rounded-3xl cosmic-card border text-center space-y-4 max-w-2xl mx-auto my-12 animate-fadeIn shadow-2xl">
            {/* Case A: Guest needs to Login or Register */}
            {accessResult.reason === 'not_logged_in' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto">
                  <LogIn className="w-8 h-8" />
                </div>
                <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                  Yêu Cầu Xác Thực • Khách Tham Quan (BR-ACC-01)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-space">
                  Vui Lòng Đăng Nhập Để Tiếp Tục
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                  Màn hình <span className="font-bold text-white">[{screenMeta?.title || activeScreenId}]</span> yêu cầu tài khoản học sinh Scholyx để lưu trữ tiến trình học, điểm số và dữ liệu câu sai cá nhân.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => navigateTo('auth-login')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition interactive-bounce shadow-lg shadow-cyan-500/25"
                  >
                    <LogIn className="w-4 h-4 text-slate-950" />
                    <span>Đăng Nhập Tài Khoản</span>
                  </button>
                  <button
                    onClick={() => navigateTo('auth-register')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition interactive-bounce"
                  >
                    <UserPlus className="w-4 h-4 text-cyan-300" />
                    <span>Đăng Ký Miễn Phí (30 câu/ngày)</span>
                  </button>
                  <button
                    onClick={() => setShowTrialModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition interactive-bounce"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Làm Thử 10 Câu (Khách)</span>
                  </button>
                  <button
                    onClick={() => navigateTo('home')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition interactive-bounce"
                  >
                    <span>Về Trang Chủ</span>
                  </button>
                </div>
              </>
            )}

            {/* Case B: VIP Required */}
            {accessResult.reason === 'vip_required' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                  <Crown className="w-8 h-8" />
                </div>
                <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Đặc Quyền Hội Viên • Yêu Cầu Gói VIP Pass (BR-VIP-01)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-space">
                  Nâng Cấp Gói VIP Để Mở Khóa Màn Hình Này
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                  Màn hình <span className="font-bold text-white">[{screenMeta?.title || activeScreenId}]</span> bao gồm các tính năng nâng cao: lộ trình thích ứng tuần, ngân hàng câu hỏi mở rộng và 50 lượt hỏi Trợ lý AI Cosmos/ngày.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setShowVIPModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition interactive-bounce shadow-xl shadow-amber-400/25"
                  >
                    <Crown className="w-4 h-4 text-slate-950" />
                    <span>Nâng Cấp VIP Ngay (Chỉ từ 79k)</span>
                  </button>
                  <button
                    onClick={() => navigateTo('vip-pricing')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition interactive-bounce"
                  >
                    <span>Xem Bảng Giá & So Sánh Quyền Lợi</span>
                  </button>
                  <button
                    onClick={() => navigateTo('home')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition interactive-bounce"
                  >
                    <span>Về Trang Chủ</span>
                  </button>
                </div>
              </>
            )}

            {/* Case C: Role Restricted (RBAC 403) */}
            {accessResult.reason === 'role_restricted' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                  Phân Quyền RBAC • Giới Hạn Quyền Truy Cập (HTTP 403)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-space">
                  Không Có Quyền Truy Cập Màn Hình Này
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                  Màn hình <span className="font-bold text-white">[{screenMeta?.title || activeScreenId}]</span> yêu cầu vai trò <span className="font-bold text-cyan-300">[{screenMeta?.allowedRoles.join(', ')}]</span> theo quy chuẩn phân quyền BR-RBAC-02.
                </p>
                <div className="p-3 bg-white/5 rounded-xl text-xs text-slate-400 max-w-md mx-auto">
                  <em>Lưu ý: Bạn đang ở môi trường DEMO. Bạn có thể nhanh chóng chuyển đổi vai trò bên dưới để kiểm tra chức năng.</em>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  {screenMeta?.allowedRoles.includes('qtnd') && (
                    <button
                      onClick={() => switchRole('qtnd')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition interactive-bounce"
                    >
                      <span>Chuyển Sang Vai Trò QTND (Demo)</span>
                    </button>
                  )}
                  {screenMeta?.allowedRoles.includes('qtv') && (
                    <button
                      onClick={() => switchRole('qtv')}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition interactive-bounce"
                    >
                      <span>Chuyển Sang Vai Trò QTV (Demo)</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigateTo('home')}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition interactive-bounce"
                  >
                    <span>Quay Về Trang Chủ</span>
                  </button>
                </div>
              </>
            )}

            {/* Case D: Screen Not Found (HTTP 404) */}
            {accessResult.reason === 'not_found' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                  HTTP 404 • Màn Hình Không Tồn Tại
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-space">
                  Không Tìm Thấy Màn Hình Yêu Cầu
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                  Mã màn hình <span className="font-mono text-cyan-300 font-bold bg-white/5 px-2 py-0.5 rounded">[{activeScreenId}]</span> không hợp lệ hoặc không có trong hệ thống 30 màn hình của Scholyx.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => navigateTo('home')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition interactive-bounce shadow-lg shadow-cyan-500/25"
                  >
                    <span>Quay Về Trang Chủ (01)</span>
                  </button>
                  <button
                    onClick={() => setSearchPaletteOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition interactive-bounce"
                  >
                    <span>Mở Sơ Đồ Điều Hướng (⌘K)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Screen Routing Resolution (30 Screens per Figma & SRS) */}

            {/* 01 · Trang chủ Scholyx */}
            {activeScreenId === 'home' && (
              <StudentHome
                onStartPractice={handleStartPracticeWithSubject}
                onOpenExam={() => navigateTo('exam-catalog')}
                onOpenGuestTrial={() => setShowTrialModal(true)}
                onOpenVIPModal={() => setShowVIPModal(true)}
              />
            )}

        {/* 02 · Đăng nhập */}
        {activeScreenId === 'auth-login' && (
          <AuthLoginScreen onNavigate={navigateTo} />
        )}

        {/* 03 · Đăng ký */}
        {activeScreenId === 'auth-register' && (
          <AuthRegisterScreen onNavigate={navigateTo} />
        )}

        {/* 04 · Kích hoạt OTP */}
        {activeScreenId === 'auth-otp' && (
          <AuthOtpScreen onNavigate={navigateTo} />
        )}

        {/* 05 · Khôi phục & đặt lại mật khẩu */}
        {activeScreenId === 'auth-forgot' && (
          <AuthForgotPasswordScreen onNavigate={navigateTo} />
        )}

        {/* 06 · Hồ sơ & mục tiêu ban đầu */}
        {activeScreenId === 'onboarding' && (
          <OnboardingScreen onNavigate={navigateTo} />
        )}

        {/* 07 · Tổng quan FREE */}
        {activeScreenId === 'overview-free' && (
          <FreeOverviewScreen
            onNavigate={navigateTo}
            onOpenVIPModal={() => setShowVIPModal(true)}
          />
        )}

        {/* 08 · Thư viện học tập & 09 · Chi tiết bài học */}
        {(activeScreenId === 'lessons' || activeScreenId === 'lesson-detail') && (
          <LearningModule
            onOpenVIPModal={() => setShowVIPModal(true)}
            onAskAIWithContext={() => navigateTo('ai')}
          />
        )}

        {/* 10 · Thiết lập luyện tập & 11 · Không gian luyện tập */}
        {(activeScreenId === 'practice-setup' || activeScreenId === 'practice-room') && (
          <PracticeModule
            onOpenVIPModal={() => setShowVIPModal(true)}
            onAskAIQuestion={handleAskAIWithQuestion}
          />
        )}

        {/* 12 · Kết quả luyện & sổ lỗi */}
        {activeScreenId === 'practice-result' && (
          <MistakeNotebook
            onAskAIQuestion={handleAskAIWithQuestion}
            onOpenPracticeWithMistakes={() => navigateTo('practice-setup')}
          />
        )}

        {/* 13 · Danh mục đề & 14 · Phiên thi đang làm & 15 · Kết quả đề thi */}
        {(activeScreenId === 'exam-catalog' ||
          activeScreenId === 'exam-room' ||
          activeScreenId === 'exam-result') && (
          <MockExamModule
            onOpenVIPModal={() => setShowVIPModal(true)}
            onAskAIQuestion={handleAskAIWithQuestion}
          />
        )}

        {/* 16 · Tiến độ học tập & Ôn tập tổng hợp (Phân biệt rõ ràng theo yêu cầu Ưu tiên 2.2) */}
        {activeScreenId === 'review-progress' && (
          <div className="space-y-6">
            {/* Tab Switcher between Tiến Độ Học Tập & Ôn Tập Tổng Hợp */}
            <div className="p-2 rounded-2xl cosmic-card border border-white/10 flex items-center gap-2 max-w-md mx-auto">
              <button
                onClick={() => navigateTo('review-progress', { tab: 'progress' })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  (screenParams?.tab || 'progress') === 'progress'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Tiến Độ Học Tập</span>
              </button>

              <button
                onClick={() => navigateTo('review-progress', { tab: 'review' })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  screenParams?.tab === 'review'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Ôn Tập Tổng Hợp</span>
              </button>
            </div>

            {/* Render appropriate module based on active sub-tab */}
            {(screenParams?.tab || 'progress') === 'progress' ? (
              <ProgressModule
                focusRoadmapOnly={false}
                onOpenVIPModal={() => setShowVIPModal(true)}
              />
            ) : (
              <ComprehensiveReview />
            )}
          </div>
        )}

        {/* 17 · Lộ trình cá nhân hóa tuần VIP */}
        {activeScreenId === 'vip-roadmap' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl cosmic-card border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase font-bold text-amber-400">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Màn hình 17 • Lộ Trình Tuần Cá Nhân Hóa (VIP Adaptive Planner)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-space">
                  Kế Hoạch Ôn Luyện Thích Ứng Theo Năng Lực
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Thuật toán BR-PERS-02 tự động tính toán thời gian đến ngày thi THPT 2026, phân bổ khối lượng bài tập theo số giờ học mỗi ngày và ưu tiên cải thiện các chuyên đề yếu.
                </p>
              </div>

              {currentUser.vipTier !== 'vip' && (
                <button
                  onClick={() => setShowVIPModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/25 shrink-0 interactive-bounce"
                >
                  Mở Khóa Toàn Bộ Lộ Trình VIP
                </button>
              )}
            </div>

            <ProgressModule
              focusRoadmapOnly={true}
              onOpenVIPModal={() => setShowVIPModal(true)}
            />
          </div>
        )}

        {/* 18 · Trợ lý AI */}
        {activeScreenId === 'ai' && (
          <AIAssistantModule
            onOpenVIPModal={() => setShowVIPModal(true)}
            injectedQuestion={aiContextQuestion}
            onClearInjectedQuestion={() => setAiContextQuestion(null)}
          />
        )}

        {/* 19 · So sánh VIP & thanh toán */}
        {activeScreenId === 'vip-pricing' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl cosmic-card border border-amber-500/30 text-center space-y-3">
              <span className="text-xs uppercase font-bold text-amber-400">
                Màn hình 19 • Bảng Giá Gói VIP & Cổng Thanh Toán
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
                Gói Thuê Bao VIP Scholyx
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Mở toàn bộ ngân hàng câu hỏi nâng cao, đề thi thử chuẩn 2026 và 50 lượt hỏi Trợ lý AI Cosmos mỗi ngày.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowVIPModal(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-400/20 hover:brightness-110 transition interactive-bounce inline-flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>Mở Cổng Thanh Toán VietQR Tự Động</span>
                </button>
              </div>
            </div>
            {/* Embed the plans grid for instant viewing */}
            <FreeOverviewScreen
              onNavigate={navigateTo}
              onOpenVIPModal={() => setShowVIPModal(true)}
            />
          </div>
        )}

        {/* 20 · Tài khoản, cài đặt & thuê bao */}
        {activeScreenId === 'profile-settings' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl cosmic-card border border-indigo-500/30 text-center space-y-3">
              <span className="text-xs uppercase font-bold text-cyan-400">
                Màn hình 20 • Quản Lý Hồ Sơ & Quyền Riêng Tư (Luật 2025)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
                Tài Khoản & Quyền Riêng Tư
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mx-auto">
                Cập nhật thông tin học tập, khối lớp, môn thi tổ hợp và quản lý dữ liệu cá nhân theo Luật 91/2025/QH15.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition interactive-bounce inline-flex items-center gap-2"
                >
                  <span>Chỉnh Sửa Hồ Sơ & Tải Dữ Liệu</span>
                </button>
              </div>
            </div>
            <OnboardingScreen onNavigate={navigateTo} />
          </div>
        )}

        {/* 21 · Không gian nội dung & bài học (QTND) */}
        {activeScreenId === 'cms-lessons' && (
          <ContentAdminModule initialTab="lessons" />
        )}

        {/* 22 · Ngân hàng câu hỏi, soạn & nhập (QTND) */}
        {activeScreenId === 'cms-questions' && (
          <ContentAdminModule initialTab="questions" />
        )}

        {/* 23 · Ma trận & cấu trúc đề thi (QTND) */}
        {activeScreenId === 'cms-matrix' && (
          <ContentAdminModule initialTab="exam_matrix" />
        )}

        {/* 24 · Chấm tự luận & chấm lại (QTND) */}
        {activeScreenId === 'cms-grading' && (
          <ContentAdminModule initialTab="essay_grading" />
        )}

        {/* 25 · Tài liệu tri thức RAG (QTND) */}
        {activeScreenId === 'cms-rag' && (
          <ContentAdminModule initialTab="rag" />
        )}

        {/* 26 · Phản hồi & chất lượng nội dung (QTND) */}
        {activeScreenId === 'cms-feedback' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl cosmic-card border border-emerald-500/30 space-y-3">
              <span className="text-xs uppercase font-bold text-emerald-400">
                Màn hình 26 • Quản lý Phản Hồi & Chất Lượng Nội Dung (FR-FB-03)
              </span>
              <h2 className="text-2xl font-bold text-white font-space">
                Phản Hồi & Đánh Giá Chất Lượng Câu Hỏi
              </h2>
              <p className="text-xs text-slate-300">
                Theo dõi các báo lỗi câu hỏi từ học sinh, tỷ lệ đúng thực tế và phản hồi trực tiếp cho người học.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Mở Form Góp Ý & Phản Hồi</span>
                </button>
              </div>
            </div>
            <ContentAdminModule initialTab="questions" />
          </div>
        )}

        {/* 27 · Tổng quan & tài khoản (QTV) */}
        {activeScreenId === 'admin-overview' && (
          <SystemAdminModule initialTab="overview" />
        )}

        {/* 28 · Vai trò & phân quyền (QTV) */}
        {activeScreenId === 'admin-roles' && (
          <SystemAdminModule initialTab="roles" />
        )}

        {/* 29 · Cấu hình, nhật ký & quyền riêng tư (QTV) */}
        {activeScreenId === 'admin-config-audit' && (
          <SystemAdminModule initialTab="config" />
        )}

        {/* 30 · 00 · Tổng quan hệ thống & bản đồ luồng */}
        {activeScreenId === 'system-flow' && (
          <SystemFlowMapScreen onNavigate={navigateTo} />
        )}

        {/* Fallback Screen Placeholder */}
        {![
          'home', 'auth-login', 'auth-register', 'auth-otp', 'auth-forgot',
          'onboarding', 'overview-free', 'lessons', 'lesson-detail',
          'practice-setup', 'practice-room', 'practice-result',
          'exam-catalog', 'exam-room', 'exam-result', 'review-progress',
          'vip-roadmap', 'ai', 'vip-pricing', 'profile-settings',
          'cms-lessons', 'cms-questions', 'cms-matrix', 'cms-grading',
          'cms-rag', 'cms-feedback', 'admin-overview', 'admin-roles',
          'admin-config-audit', 'system-flow'
        ].includes(activeScreenId) && (
          <ScreenPlaceholder screenId={activeScreenId} onNavigate={navigateTo} />
        )}
          </>
        )}
      </main>

      {/* 6. Cosmic Footer */}
      <footer className="relative z-10 border-t border-indigo-950/60 bg-[#060814]/90 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-200 tracking-wider">SCHOLYX</span>
            <span className="text-slate-500">•</span>
            <span>Hệ thống Ôn Thi THPT Chuẩn GDPT 2018 (ISO/IEC/IEEE 29148)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => navigateTo('system-flow')}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold transition interactive-bounce"
            >
              <Network className="w-3.5 h-3.5" />
              <span>00 · Bản Đồ 30 Màn Hình</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="hover:text-cyan-300 transition interactive-bounce"
            >
              Góp ý & Báo lỗi
            </button>
            <span>•</span>
            <button
              onClick={() => setShowVIPModal(true)}
              className="text-amber-300 font-semibold hover:underline interactive-bounce"
            >
              Gói VIP Trả Phí
            </button>
            <span>•</span>
            <span className="text-slate-500">Bản quyền © 2025–2026 Scholyx</span>
          </div>
        </div>
      </footer>

      {/* 7. Reusable Cosmic Modals */}
      <VIPPaymentModal isOpen={showVIPModal} onClose={() => setShowVIPModal(false)} />
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <GuestTrialModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onSignUpAsStudent={() => {
          switchRole('student', 'free');
          navigateTo('onboarding');
        }}
      />
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
