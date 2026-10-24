import { ScreenId, ScreenMetadata, UserRole, VIPTier } from '../types';

export const SCREEN_REGISTRY: ScreenMetadata[] = [
  // 1. Xác thực & Khởi đầu
  {
    id: 'home',
    screenNumber: '01',
    title: 'Trang chủ Scholyx',
    path: '/home',
    category: 'Trang chủ & Khởi đầu',
    description: 'Hero vũ trụ, đếm ngược ngày thi THPT 2026, KPI cá nhân, flashcard 3D và nhiệm vụ trong ngày.',
    iconName: 'Compass',
    allowedRoles: ['all'],
    sourceScreens: 'Mọi màn hình (Logo, Navbar, Breadcrumbs)',
    targetScreens: 'Khóa ôn (08), Luyện tập (10), Thi thử (13), AI (18), Tiến độ (16)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'auth-login',
    screenNumber: '02',
    title: 'Đăng nhập',
    path: '/auth/login',
    category: 'Xác thực & Tài khoản',
    description: 'Đăng nhập bằng Email/SĐT và mật khẩu, hỗ trợ Google OAuth, ghi nhớ đăng nhập.',
    iconName: 'LogIn',
    allowedRoles: ['guest', 'student', 'qtnd', 'qtv'],
    sourceScreens: 'Trang chủ (01), Navbar (Khách), Đăng ký (03)',
    targetScreens: 'Trang chủ (01), Quên mật khẩu (05), Đăng ký (03), Tổng quan (07)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'auth-register',
    screenNumber: '03',
    title: 'Đăng ký',
    path: '/auth/register',
    category: 'Xác thực & Tài khoản',
    description: 'Đăng ký tài khoản học sinh lớp 10, 11, 12, đồng ý Điều khoản & Chính sách bảo vệ dữ liệu.',
    iconName: 'UserPlus',
    allowedRoles: ['guest', 'student'],
    sourceScreens: 'Trang chủ (01), Đăng nhập (02), Navbar',
    targetScreens: 'Kích hoạt OTP (04), Đăng nhập (02)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'auth-otp',
    screenNumber: '04',
    title: 'Kích hoạt OTP',
    path: '/auth/verify-otp',
    category: 'Xác thực & Tài khoản',
    description: 'Xác thực mã OTP 6 số gửi qua Email/SMS với đồng hồ đếm lùi 10 phút (BR-ACC-04).',
    iconName: 'ShieldCheck',
    allowedRoles: ['guest', 'student'],
    sourceScreens: 'Đăng ký (03), Quên mật khẩu (05)',
    targetScreens: 'Hồ sơ ban đầu (06), Tổng quan (07), Trang chủ (01)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'auth-forgot',
    screenNumber: '05',
    title: 'Khôi phục & đặt lại mật khẩu',
    path: '/auth/forgot-password',
    category: 'Xác thực & Tài khoản',
    description: 'Khôi phục mật khẩu an toàn qua email hoặc OTP, tuân thủ tiêu chuẩn tối thiểu 8 ký tự.',
    iconName: 'Key',
    allowedRoles: ['guest', 'student', 'qtnd', 'qtv'],
    sourceScreens: 'Đăng nhập (02)',
    targetScreens: 'Kích hoạt OTP (04), Đăng nhập (02)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'onboarding',
    screenNumber: '06',
    title: 'Hồ sơ & mục tiêu ban đầu',
    path: '/onboarding',
    category: 'Khởi tạo mục tiêu',
    description: 'Thiết lập khối lớp, trường THPT, môn tổ hợp mục tiêu (Toán, Lý, Hóa...) và điểm mong muốn.',
    iconName: 'Target',
    allowedRoles: ['student'],
    sourceScreens: 'Kích hoạt OTP (04), Cài đặt hồ sơ (20), Trang chủ (01)',
    targetScreens: 'Tổng quan FREE (07), Trang chủ (01), Khóa ôn luyện (08)',
    implementationStatus: 'Hoàn thành'
  },

  // 2. Học sinh - Không gian học tập
  {
    id: 'overview-free',
    screenNumber: '07',
    title: 'Tổng quan FREE',
    path: '/overview',
    category: 'Học tập Học sinh',
    description: 'Bảng điều khiển cho học sinh gói Miễn phí: theo dõi hạn mức ngày (30 câu, 10 lượt AI), chẩn đoán radar điểm yếu.',
    iconName: 'LayoutDashboard',
    allowedRoles: ['student', 'guest'],
    sourceScreens: 'Trang chủ (01), Navbar Khám Phá, Hồ sơ ban đầu (06)',
    targetScreens: 'Khóa ôn (08), Luyện tập (10), Gói VIP (19)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'lessons',
    screenNumber: '08',
    title: 'Thư viện học tập',
    path: '/lessons',
    category: 'Học tập Học sinh',
    description: 'Kho học liệu chuẩn GDPT 2018 theo môn học, khối lớp 10-11-12, tìm kiếm tiếng Việt và phân loại theo chương.',
    iconName: 'BookOpen',
    allowedRoles: ['student', 'guest'],
    sourceScreens: 'Trang chủ (01), Navbar, Chi tiết bài học (09), Lộ trình VIP (17)',
    targetScreens: 'Chi tiết bài học (09), Luyện tập (10), Trợ lý AI (18)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'lesson-detail',
    screenNumber: '09',
    title: 'Chi tiết bài học',
    path: '/lessons/detail',
    category: 'Học tập Học sinh',
    description: 'Không gian học tập chuyên sâu: Lý thuyết trọng tâm, công thức toán/lý có Lightbox phóng to, video bài giảng, ghi chú cá nhân.',
    iconName: 'FileText',
    allowedRoles: ['student'],
    sourceScreens: 'Thư viện bài học (08), Trang chủ (01 - Bento bài học gần đây)',
    targetScreens: 'Thư viện bài học (08), Luyện tập chuyên đề (10), Trợ lý AI (18)',
    implementationStatus: 'Hoàn thành'
  },

  // 3. Luyện tập & Sổ lỗi
  {
    id: 'practice-setup',
    screenNumber: '10',
    title: 'Thiết lập luyện tập',
    path: '/practice/setup',
    category: 'Luyện tập & Sổ lỗi',
    description: 'Bộ tạo đề tùy chỉnh: chọn môn, 3 mức tư duy (Nhận biết, Thông hiểu, Vận dụng), 3 dạng câu chuẩn 764, số lượng và chế độ học.',
    iconName: 'PenTool',
    allowedRoles: ['student'],
    sourceScreens: 'Trang chủ (01), Navbar, Chi tiết bài học (09), Sổ câu sai (12)',
    targetScreens: 'Không gian luyện tập (11), Kết quả luyện & sổ lỗi (12)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'practice-room',
    screenNumber: '11',
    title: 'Không gian luyện tập',
    path: '/practice/room',
    category: 'Luyện tập & Sổ lỗi',
    description: 'Phòng luyện tập tương tác cao: đồng hồ bấm giờ, trả lời trắc nghiệm 4 lựa chọn, đúng/sai 4 ý, trả lời ngắn, ghim câu hỏi và hỏi AI.',
    iconName: 'Zap',
    allowedRoles: ['student'],
    sourceScreens: 'Thiết lập luyện tập (10)',
    targetScreens: 'Kết quả luyện & sổ lỗi (12), Thiết lập luyện tập (10), Trợ lý AI (18)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'practice-result',
    screenNumber: '12',
    title: 'Kết quả luyện & sổ lỗi',
    path: '/practice/results',
    category: 'Luyện tập & Sổ lỗi',
    description: 'Điểm số theo thang chuẩn, phân tích đúng/sai, lời giải chi tiết và sổ câu sai tự động thu thập (FR-PRAC-09).',
    iconName: 'AlertOctagon',
    allowedRoles: ['student'],
    sourceScreens: 'Không gian luyện tập (11), Kết quả thi thử (15), Trang chủ (01), Navbar',
    targetScreens: 'Thiết lập luyện tập (10), Trợ lý AI (18), Trang chủ (01)',
    implementationStatus: 'Hoàn thành'
  },

  // 4. Thi thử THPT
  {
    id: 'exam-catalog',
    screenNumber: '13',
    title: 'Danh mục đề & trước khi thi',
    path: '/exams',
    category: 'Thi thử THPT',
    description: 'Danh mục đề thi thử THPT chuẩn Quyết định 764/QĐ-BGDĐT, xem trước ma trận 3 phần thi và quy định thời gian làm bài.',
    iconName: 'Award',
    allowedRoles: ['student'],
    sourceScreens: 'Trang chủ (01), Navbar, Kết quả đề thi (15)',
    targetScreens: 'Phiên thi đang làm (14), Kết quả đề thi (15), Gói VIP (19)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'exam-room',
    screenNumber: '14',
    title: 'Phiên thi đang làm',
    path: '/exams/room',
    category: 'Thi thử THPT',
    description: 'Phòng thi nghiêm túc: đồng hồ đếm ngược phía máy chủ, tự động lưu đáp án, phiếu trả lời trắc nghiệm điện tử, cảnh báo câu chưa làm.',
    iconName: 'Clock',
    allowedRoles: ['student'],
    sourceScreens: 'Danh mục đề thi (13)',
    targetScreens: 'Kết quả đề thi (15)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'exam-result',
    screenNumber: '15',
    title: 'Kết quả đề thi',
    path: '/exams/results',
    category: 'Thi thử THPT',
    description: 'Bảng điểm chính xác 3 phần, biểu đồ phổ điểm toàn quốc mô phỏng, phân tích chuyên đề và cơ chế xem lại bài làm.',
    iconName: 'BarChart3',
    allowedRoles: ['student'],
    sourceScreens: 'Phiên thi đang làm (14), Danh mục đề thi (13)',
    targetScreens: 'Danh mục đề thi (13), Sổ câu sai (12), Trang chủ (01)',
    implementationStatus: 'Hoàn thành'
  },

  // 5. Cá nhân hóa & Lộ trình
  {
    id: 'review-progress',
    screenNumber: '16',
    title: 'Ôn tập tổng hợp & tiến độ',
    path: '/review-progress',
    category: 'Cá nhân hóa & Lộ trình',
    description: 'Mốc thời gian kỳ thi 2026, sổ tay công thức cốt lõi, bẫy lý thuyết thường gặp và bảng đánh giá mức độ thành thạo chủ đề.',
    iconName: 'Layers',
    allowedRoles: ['student'],
    sourceScreens: 'Trang chủ (01), Navbar',
    targetScreens: 'Lộ trình tuần VIP (17), Thiết lập luyện tập (10), Danh mục đề (13)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'vip-roadmap',
    screenNumber: '17',
    title: 'Lộ trình tuần VIP',
    path: '/roadmap',
    category: 'Cá nhân hóa & Lộ trình',
    description: 'Lộ trình học thích ứng từng tuần do thuật toán cá nhân hóa sinh ra, điều chỉnh theo số giờ học/ngày và ngày thi mục tiêu.',
    iconName: 'Calendar',
    badge: 'VIP',
    isVIPOnly: true,
    allowedRoles: ['student'],
    sourceScreens: 'Trang chủ (01), Navbar Khám Phá, Ôn tập tổng hợp (16)',
    targetScreens: 'Thư viện bài học (08), Thiết lập luyện tập (10), Gói VIP (19)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'ai',
    screenNumber: '18',
    title: 'Trợ lý AI',
    path: '/ai-assistant',
    category: 'Trí tuệ nhân tạo',
    description: 'Trợ lý học tập thông minh dựa trên kho tri thức chuẩn GDPT 2018 (RAG), trích dẫn nguồn sách giáo khoa, cảnh báo tham khảo.',
    iconName: 'Bot',
    badge: 'AI',
    allowedRoles: ['student'],
    sourceScreens: 'Trang chủ (01), Navbar, Chi tiết bài học (09), Sổ câu sai (12), Luyện tập (11)',
    targetScreens: 'Trang chủ (01), Thư viện bài học (08), Thiết lập luyện tập (10)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'vip-pricing',
    screenNumber: '19',
    title: 'So sánh VIP & thanh toán',
    path: '/vip',
    category: 'Gói VIP & Thanh toán',
    description: 'So sánh chi tiết quyền lợi Miễn phí vs VIP, thanh toán VietQR động có mô phỏng quét app ngân hàng tức thì và hóa đơn điện tử.',
    iconName: 'Crown',
    badge: 'HOT',
    allowedRoles: ['student', 'guest'],
    sourceScreens: 'Trang chủ (01), Navbar, Modal nâng cấp VIP, Tổng quan (07)',
    targetScreens: 'Tổng quan FREE (07), Trang chủ (01)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'profile-settings',
    screenNumber: '20',
    title: 'Tài khoản, cài đặt & thuê bao',
    path: '/settings',
    category: 'Tài khoản cá nhân',
    description: 'Thông tin cá nhân, cập nhật mục tiêu điểm số, tùy chọn quyền riêng tư, tải bản sao dữ liệu (Luật 2025) và trạng thái gói thuê bao.',
    iconName: 'Settings',
    allowedRoles: ['student', 'qtnd', 'qtv'],
    sourceScreens: 'Trang chủ (01), Avatar Menu',
    targetScreens: 'Hồ sơ ban đầu (06), Gói VIP (19), Trang chủ (01)',
    implementationStatus: 'Hoàn thành'
  },

  // 6. Quản trị nội dung (QTND)
  {
    id: 'cms-lessons',
    screenNumber: '21',
    title: 'Không gian nội dung & bài học',
    path: '/cms/lessons',
    category: 'Quản trị nội dung (QTND)',
    description: 'Quản lý cây chương mục môn học, biên soạn và xuất bản bài học với công thức, video và tài liệu đính kèm.',
    iconName: 'BookOpen',
    allowedRoles: ['qtnd', 'qtv'],
    sourceScreens: 'Navbar (QTND), Hệ thống phân quyền',
    targetScreens: 'Ngân hàng câu hỏi (22), Ma trận đề (23), Xem trước bài học (08)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'cms-questions',
    screenNumber: '22',
    title: 'Ngân hàng câu hỏi, soạn & nhập',
    path: '/cms/questions',
    category: 'Quản trị nội dung (QTND)',
    description: 'Ngân hàng câu hỏi đa định dạng, công cụ biên soạn câu hỏi chi tiết và nhập liệu hàng loạt qua file mẫu Excel/CSV.',
    iconName: 'HelpCircle',
    allowedRoles: ['qtnd', 'qtv'],
    sourceScreens: 'Navbar (QTND), Bài học CMS (21)',
    targetScreens: 'Ma trận đề thi (23), Phản hồi chất lượng (26)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'cms-matrix',
    screenNumber: '23',
    title: 'Ma trận & cấu trúc đề thi',
    path: '/cms/matrix',
    category: 'Quản trị nội dung (QTND)',
    description: 'Thiết lập ma trận nhận thức 4:3:3 theo Quyết định 764 và công cụ sinh đề tự động bằng AI từ ngân hàng câu hỏi.',
    iconName: 'Sparkles',
    allowedRoles: ['qtnd', 'qtv'],
    sourceScreens: 'Navbar (QTND), Ngân hàng câu hỏi (22)',
    targetScreens: 'Xem trước đề thi (13), Chấm tự luận (24)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'cms-grading',
    screenNumber: '24',
    title: 'Chấm tự luận & chấm lại',
    path: '/cms/grading',
    category: 'Quản trị nội dung (QTND)',
    description: 'Không gian chấm bài thi tự luận Ngữ văn/Toán, nhập điểm theo từng tiêu chí, nhận xét và lưu vết lịch sử chấm lại.',
    iconName: 'Edit3',
    allowedRoles: ['qtnd', 'qtv'],
    sourceScreens: 'Navbar (QTND)',
    targetScreens: 'Phản hồi chất lượng (26), Ngân hàng câu hỏi (22)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'cms-rag',
    screenNumber: '25',
    title: 'Tài liệu tri thức RAG',
    path: '/cms/rag',
    category: 'Quản trị nội dung (QTND)',
    description: 'Quản lý tài liệu nguồn phục vụ RAG cho Trợ lý AI: tải lên tài liệu, kiểm duyệt bản quyền và thu hồi tài liệu.',
    iconName: 'Upload',
    allowedRoles: ['qtnd', 'qtv'],
    sourceScreens: 'Navbar (QTND)',
    targetScreens: 'Trợ lý AI (18 - Kiểm thử RAG), Phản hồi chất lượng (26)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'cms-feedback',
    screenNumber: '26',
    title: 'Phản hồi & chất lượng nội dung',
    path: '/cms/feedback',
    category: 'Quản trị nội dung (QTND)',
    description: 'Xử lý báo lỗi câu hỏi từ học sinh, tỷ lệ đúng thực tế và phản hồi trực tiếp cho người học.',
    iconName: 'MessageSquare',
    allowedRoles: ['qtnd', 'qtv'],
    sourceScreens: 'Navbar (QTND - Menu Khám Phá)',
    targetScreens: 'Ngân hàng câu hỏi (22), Bài học CMS (21)',
    implementationStatus: 'Hoàn thành'
  },

  // 7. Quản trị hệ thống (QTV)
  {
    id: 'admin-overview',
    screenNumber: '27',
    title: 'Tổng quan & tài khoản',
    path: '/admin/overview',
    category: 'Quản trị hệ thống (QTV)',
    description: 'Thống kê vận hành hệ thống, danh sách tài khoản người dùng, chức năng khóa/mở khóa bắt buộc nhập lý do (BR-ACC-03) và cấp VIP.',
    iconName: 'Users',
    allowedRoles: ['qtv'],
    sourceScreens: 'Navbar (QTV), Đăng nhập (02)',
    targetScreens: 'Vai trò & phân quyền (28), Tham số & Audit Log (29), Gói VIP (19)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'admin-roles',
    screenNumber: '28',
    title: 'Vai trò & phân quyền',
    path: '/admin/roles',
    category: 'Quản trị hệ thống (QTV)',
    description: 'Ma trận phân quyền vai trò RBAC (Khách, Học sinh, QTND, QTV) tuân thủ tách biệt quyền nội dung và hệ thống.',
    iconName: 'ShieldCheck',
    allowedRoles: ['qtv'],
    sourceScreens: 'Navbar (QTV), Tổng quan quản trị (27)',
    targetScreens: 'Tổng quan tài khoản (27), Tham số & Audit Log (29)',
    implementationStatus: 'Hoàn thành'
  },
  {
    id: 'admin-config-audit',
    screenNumber: '29',
    title: 'Cấu hình, nhật ký & quyền riêng tư',
    path: '/admin/config-audit',
    category: 'Quản trị hệ thống (QTV)',
    description: 'Cấu hình tham số hệ thống, nhật ký kiểm toán bất biến (Audit Log) lưu vết mọi thao tác nhạy cảm và đối soát doanh thu.',
    iconName: 'Sliders',
    allowedRoles: ['qtv'],
    sourceScreens: 'Navbar (QTV), Tổng quan quản trị (27)',
    targetScreens: 'Tổng quan tài khoản (27), Phân quyền RBAC (28)',
    implementationStatus: 'Hoàn thành'
  },

  // 8. Bản đồ luồng hệ thống
  {
    id: 'system-flow',
    screenNumber: '30',
    title: '00 · Tổng quan hệ thống & bản đồ luồng',
    path: '/system-flow',
    category: 'Sitemap & Kiến trúc',
    description: 'Bản đồ trực quan toàn diện 30 màn hình theo chuẩn Figma và ISO/IEC/IEEE 29148 với điều hướng 1-click đến bất kỳ màn hình nào.',
    iconName: 'Network',
    badge: 'MAP',
    allowedRoles: ['all'],
    sourceScreens: 'Mọi màn hình (Navbar, Breadcrumbs, Footer, Command Palette ⌘K)',
    targetScreens: 'Tất cả 30 màn hình hệ thống Scholyx',
    implementationStatus: 'Hoàn thành'
  }
];

export const SCREEN_CATEGORIES = [
  'Trang chủ & Khởi đầu',
  'Xác thực & Tài khoản',
  'Học tập Học sinh',
  'Luyện tập & Sổ lỗi',
  'Thi thử THPT',
  'Cá nhân hóa & Lộ trình',
  'Trí tuệ nhân tạo',
  'Gói VIP & Thanh toán',
  'Tài khoản cá nhân',
  'Quản trị nội dung (QTND)',
  'Quản trị hệ thống (QTV)',
  'Sitemap & Kiến trúc'
];

export function getScreenMetadata(screenId: ScreenId): ScreenMetadata | undefined {
  return SCREEN_REGISTRY.find(s => s.id === screenId);
}

export function getScreenByPath(path: string): ScreenMetadata | undefined {
  const cleanPath = path.replace(/^#/, '');
  return SCREEN_REGISTRY.find(s => s.path === cleanPath);
}

export interface ScreenAccessResult {
  allowed: boolean;
  reason?: 'not_found' | 'not_logged_in' | 'role_restricted' | 'vip_required';
  message: string;
  requiredRoles?: Array<UserRole | 'all'>;
}

export function canAccessScreen(
  user: { role: UserRole; vipTier: VIPTier; vipExpiresAt?: string | null },
  screen: ScreenId | ScreenMetadata
): ScreenAccessResult {
  const meta: ScreenMetadata | undefined =
    typeof screen === 'string' ? SCREEN_REGISTRY.find(s => s.id === screen) : screen;

  // Invalid screen ID must return not_found instead of falling back to Home
  if (!meta) {
    return {
      allowed: false,
      reason: 'not_found',
      message: `Màn hình không tồn tại trong hệ thống (ID: ${typeof screen === 'string' ? screen : 'không xác định'})`
    };
  }

  // 1. Public screens for all roles
  if (meta.allowedRoles.includes('all')) {
    return { allowed: true, message: 'Khả dụng cho mọi người' };
  }

  // 2. Guest user
  if (user.role === 'guest') {
    if (meta.allowedRoles.includes('guest')) {
      return { allowed: true, message: 'Khả dụng cho Khách tham quan' };
    }
    return {
      allowed: false,
      reason: 'not_logged_in',
      message: 'Tính năng này yêu cầu đăng nhập hoặc đăng ký tài khoản SCHOLYX để sử dụng và lưu tiến trình.',
      requiredRoles: meta.allowedRoles
    };
  }

  // 3. Role authorization check: user's role must be listed in allowedRoles
  if (!meta.allowedRoles.includes(user.role as any)) {
    let msg = 'Bạn không có quyền truy cập màn hình này theo chính sách phân quyền BR-RBAC-02.';
    if (user.role === 'qtnd') {
      msg = 'Tài khoản Quản Trị Nội Dung (QTND) chỉ có quyền biên soạn và kiểm duyệt học liệu, không có quyền quản trị hệ thống hay làm bài thi của học sinh.';
    } else if (user.role === 'student') {
      msg = 'Tài khoản Học sinh không có quyền truy cập không gian Quản trị theo quy định phân quyền BR-RBAC-02.';
    } else if (user.role === 'qtv') {
      msg = 'Màn hình này không nằm trong phạm vi chức năng quản trị hệ thống của QTV theo phân quyền SRS.';
    }
    return {
      allowed: false,
      reason: 'role_restricted',
      message: msg,
      requiredRoles: meta.allowedRoles
    };
  }

  // 4. VIP requirement check for screens marked isVIPOnly
  // Check VIP expiration date: if user.vipTier is 'vip' but expired, treat as expired
  const isVipActive =
    user.vipTier === 'vip' &&
    (!user.vipExpiresAt || new Date(user.vipExpiresAt).getTime() > Date.now());

  if (meta.isVIPOnly && !isVipActive) {
    return {
      allowed: false,
      reason: 'vip_required',
      message: 'Màn hình này thuộc đặc quyền gói VIP Pass (Lộ trình tuần thích ứng và tính năng chuyên sâu).',
      requiredRoles: meta.allowedRoles
    };
  }

  // 5. Authorized
  return { allowed: true, message: `Khả dụng cho vai trò ${user.role}` };
}


