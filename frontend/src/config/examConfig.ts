/**
 * SCHOLYX Centralized Examination & Academic Configuration
 * Standardized according to MoET 2018 General Education Program (GDPT 2018)
 * and Decision 764/QD-BGDDT format specification.
 */

export const BRAND_CONFIG = {
  name: 'SCHOLYX',
  tagline: 'Vũ Trụ Tri Thức & Ôn Thi Tốt Nghiệp THPT Chuẩn GDPT 2018',
  appVersion: '2.5.0-sandbox',
  isDemoEnvironment: true,
  environmentNotice: 'Hệ thống đang hoạt động ở chế độ Mô phỏng Kiểm thử (Demo Sandbox). Mọi dữ liệu xác thực, câu hỏi, điểm thi và thanh toán đều là dữ liệu thử nghiệm cục bộ.'
};

export const ACADEMIC_CONFIG = {
  academicYear: '2026 - 2027',
  currentAcademicYear: '2026 - 2027',
  grade: 12,
  targetYear: 2027,
  targetExamDate: '2027-06-25T07:30:00',
  targetExamFormattedDate: '25/06/2027 (Dự kiến)',
  officialDisclaimer: 'Ngày thi dự kiến theo khung kế hoạch năm học của Bộ GD&ĐT, chưa phải lịch thi chính thức ấn định.',
  nextExamTarget: {
    year: 2027,
    // Expected exam date based on MoET standard academic calendar (late June)
    targetDateStr: '2027-06-25T07:30:00',
    displayDate: '25/06/2027 (Dự kiến)',
    isOfficialConfirmed: false,
    disclaimer: 'Ngày thi dự kiến theo khung kế hoạch năm học của Bộ GD&ĐT, chưa phải lịch thi chính thức được ấn định.'
  },
  // Upcoming examination timeline milestones
  milestones: [
    {
      id: 'm1',
      dateStr: '2027-04-15',
      displayDate: '15/04/2027',
      title: 'Đăng Ký Dự Thi Tốt Nghiệp THPT 2027',
      desc: 'Nộp hồ sơ trực tuyến trên cổng thông tin thi tuyển sinh của Bộ GD&ĐT (Dự kiến)',
      badge: 'Thủ tục hành chính',
      isGoal: false
    },
    {
      id: 'm2',
      dateStr: '2027-05-10',
      displayDate: '10/05/2027',
      title: 'Kỳ Khảo Sát Năng Lực Toàn Diện - Đợt 1',
      desc: 'Thi thử trực tuyến chuẩn định dạng đề thi mới trên nền tảng SCHOLYX',
      badge: 'Thi thử thử thách',
      isGoal: false
    },
    {
      id: 'm3',
      dateStr: '2027-06-15',
      displayDate: '15/06/2027',
      title: 'Nhận Giấy Báo Dự Thi & Địa Điểm Thi',
      desc: 'Kiểm tra thông tin điểm thi, số báo danh và phòng thi chính thức',
      badge: 'Thông báo chính thức',
      isGoal: false
    },
    {
      id: 'm4',
      dateStr: '2027-06-25',
      displayDate: '25/06/2027',
      title: 'Kỳ Thi Tốt Nghiệp THPT 2027 Chính Thức',
      desc: 'Ngày thi tốt nghiệp THPT toàn quốc (Toán, Ngữ văn và 2 môn tự chọn)',
      badge: 'Kỳ thi quốc gia',
      isGoal: true
    }
  ]
};

/**
 * Filter milestones to only include upcoming or active milestones
 */
export function getUpcomingMilestones() {
  const now = new Date();
  return ACADEMIC_CONFIG.milestones.map(m => {
    const isPast = new Date(m.dateStr).getTime() < now.getTime();
    return {
      ...m,
      date: m.displayDate,
      isPast,
      isUpcoming: !isPast
    };
  });
}
