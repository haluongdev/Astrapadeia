/**
 * Scholyx - Types definition following ISO/IEC/IEEE 29148 SRS
 */

export type UserRole = 'guest' | 'student' | 'qtnd' | 'qtv';
export type VIPTier = 'free' | 'vip';
export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung';
export type QuestionType = 'choice' | 'true_false' | 'short_answer' | 'essay';
export type ContentAccessTier = 'public' | 'free' | 'vip';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type AccountStatus = 'pending' | 'active' | 'locked' | 'disabled';

export type ScreenId =
  | 'home'
  | 'auth-login'
  | 'auth-register'
  | 'auth-otp'
  | 'auth-forgot'
  | 'onboarding'
  | 'overview-free'
  | 'lessons'
  | 'lesson-detail'
  | 'practice-setup'
  | 'practice-room'
  | 'practice-result'
  | 'exam-catalog'
  | 'exam-room'
  | 'exam-result'
  | 'review-progress'
  | 'vip-roadmap'
  | 'ai'
  | 'vip-pricing'
  | 'profile-settings'
  | 'cms-lessons'
  | 'cms-questions'
  | 'cms-matrix'
  | 'cms-grading'
  | 'cms-rag'
  | 'cms-feedback'
  | 'admin-overview'
  | 'admin-roles'
  | 'admin-config-audit'
  | 'system-flow';

export interface ScreenMetadata {
  id: ScreenId;
  screenNumber: string;
  title: string;
  path: string;
  category: string;
  description: string;
  iconName: string;
  allowedRoles: Array<UserRole | 'all'>;
  badge?: string;
  isVIPOnly?: boolean;
  sourceScreens?: string;
  targetScreens?: string;
  implementationStatus?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  grade: 10 | 11 | 12;
  school: string;
  province: string;
  role: UserRole;
  vipTier: VIPTier;
  vipExpiresAt?: string; // ISO date
  targetSubjects: string[];
  targetScores: Record<string, number>; // subjectId -> target score
  examDate: string; // e.g. "2026-06-25"
  allowAIPersonalization: boolean;
  studyHoursPerDay: number;
  streakDays: number;
  lastActive: string;
  status: AccountStatus;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  isCompulsory: boolean; // Toán, Văn bắt buộc
  description: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  grade: 10 | 11 | 12;
  title: string;
  order: number;
  description: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  subjectId: string;
  grade: 10 | 11 | 12;
  title: string;
  content: string; // Markdown / HTML with formulas
  accessTier: ContentAccessTier;
  status: ContentStatus;
  order: number;
  summary: string;
  keyFormulas?: string[];
  videoUrl?: string;
  createdAt: string;
}

export interface TrueFalseProposition {
  id: string;
  text: string;
  isCorrect: boolean; // true = Đúng, false = Sai
}

export interface Question {
  id: string;
  subjectId: string;
  grade: 10 | 11 | 12;
  chapterId: string;
  topic: string;
  type: QuestionType;
  level: CognitiveLevel;
  content: string; // De bai
  options?: string[]; // Cho choice (A, B, C, D)
  correctOptionIndex?: number; // 0, 1, 2, 3
  propositions?: TrueFalseProposition[]; // Cho true_false (4 ý a, b, c, d)
  shortAnswerKey?: string; // Cho short_answer (chấp nhận cả . và ,)
  essayGuide?: string; // Hướng dẫn chấm tự luận
  explanation: string; // Lời giải chi tiết
  accessTier: ContentAccessTier;
  status: ContentStatus;
  points: number;
  tags?: string[];
}

export interface ExamPart {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
  durationMinutes?: number;
  maxScore: number;
}

export interface Exam {
  id: string;
  title: string;
  code: string;
  subjectId: string;
  grade: 10 | 11 | 12;
  year: number;
  durationMinutes: number;
  maxScore: number;
  accessTier: ContentAccessTier;
  status: ContentStatus;
  description: string;
  parts: ExamPart[];
  isStandardTHPT: boolean; // Chuẩn cấu trúc đề tốt nghiệp THPT 2025-2026
  maxAttempts?: number;
  totalSubmissions?: number;
  averageScore?: number;
}

export interface UserExamAnswer {
  questionId: string;
  selectedOptionIndex?: number; // choice
  selectedPropositions?: Record<string, boolean>; // propositionId -> true/false
  shortAnswerText?: string;
  essayText?: string;
  isFlagged?: boolean;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  subjectId: string;
  userId: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  answers: Record<string, UserExamAnswer>;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  partScores: Record<string, number>;
  essayStatus?: 'pending' | 'graded';
  essayGrade?: number;
  essayFeedback?: string;
  topicBreakdown: Record<string, { total: number; correct: number }>;
}

export interface MistakeItem {
  id: string;
  questionId: string;
  subjectId: string;
  topic: string;
  failedCount: number;
  lastFailedAt: string;
  resolved: boolean;
  userLastAnswer: string;
}

export interface WeakTopic {
  topic: string;
  subjectId: string;
  masteryPercentage: number; // 0 - 100
  status: 'Yếu' | 'Trung bình' | 'Khá' | 'Tốt';
  sampleCount: number;
  recommendedLessonId?: string;
}

export interface StudyTask {
  id: string;
  dayOfWeek: string; // Thứ 2, Thứ 3, ...
  dateStr: string;
  title: string;
  subjectId: string;
  type: 'lesson' | 'practice' | 'review' | 'exam';
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'normal';
}

export interface WeeklyStudyPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  focusTopics: string[];
  tasks: StudyTask[];
}

export interface RAGDocument {
  id: string;
  title: string;
  subjectId: string;
  grade: 10 | 11 | 12;
  source: string; // e.g., "SGK Toán 12 Kết Nối Tri Thức - NXB GDVN"
  license: string;
  status: 'pending' | 'approved' | 'revoked';
  uploadedAt: string;
  snippetCount: number;
  contentSnippet: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  feedback?: 'helpful' | 'not_helpful';
  reported?: boolean;
}

export interface VIPPlan {
  id: string;
  name: string;
  tagline: string;
  durationDays: number;
  priceVND: number;
  originalPriceVND: number;
  isPopular?: boolean;
  features: string[];
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  amountVND: number;
  discountVND: number;
  paymentMethod: 'vnpay' | 'momo' | 'zalopay' | 'credit' | 'vietqr';
  status: 'success' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
  refundReason?: string;
  qrCodeUrl?: string;
  transferSyntax?: string;
  expiresAt?: string;
  approvedBy?: string;
  invoiceNumber?: string;
  accountNumber?: string;
  bankName?: string;
  vatAmount?: number;
  qrPayload?: string;
  customerNote?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetObject: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface FeedbackReport {
  id: string;
  userId: string;
  type: 'question_error' | 'lesson_error' | 'general';
  relatedId?: string;
  content: string;
  status: 'new' | 'processing' | 'resolved';
  createdAt: string;
  response?: string;
}

/* GAMIFIED RANKED & COMBAT POWER (CHIẾN LỰC) TYPES */
export type RankTier = 
  | 'bronze'       // Đồng (Quỹ Đạo Đồng)
  | 'silver'       // Bạc (Tinh Vân Bạc)
  | 'gold'         // Vàng (Thái Dương Vàng)
  | 'platinum'     // Bạch Kim (Tinh Cầu Bạch Kim)
  | 'diamond'      // Kim Cương (Siêu Tân Tinh)
  | 'master'       // Tinh Anh (Hố Đen Tinh Anh)
  | 'grandmaster'  // Cao Thủ (Thiên Hà Cao Thủ)
  | 'challenger'   // Thách Đấu (Tinh Cầu Tối Thượng)
  | 'novice' | 'orbital' | 'comet' | 'nebula' | 'cosmic_legend';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar: string;
  school: string;
  province?: string;
  rankTier: RankTier;
  rankDivision: 1 | 2 | 3 | 4;
  rankPoints: number; // Điểm xếp hạng LP/RP (0 - 100)
  combatPower: number; // Chiến lực tri thức CP
  winStreak: number;
  badge: string;
}

export interface GameQuest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'season' | 'achievement';
  subjectId?: string;
  rewardCP: number; // Điểm chiến lực
  rewardCrystals: number; // Tinh thể vũ trụ
  currentProgress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
  actionTab?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'celestial';
  combatPowerBonus: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserGameStats {
  combatPower: number; // Tổng Chiến Lực CP
  level: number; // Cấp nhân vật (1 - 50)
  currentExp: number;
  maxExp: number;
  rankTier: RankTier;
  rankDivision: 1 | 2 | 3 | 4;
  rankPoints: number; // LP (0 - 100)
  crystals: number; // Tinh thể vũ trụ
  winStreak: number;
  totalMatches: number;
  winCount: number;
  title: string;
  dailyEnergy: number; // 0 - 100%
  claimedEnergyChests: number[]; // e.g. [20, 40]
  mathCP: number;
  physicsCP: number;
  chemistryCP: number;
  litCP: number;
  engCP: number;
  bioCP?: number;
}

export interface PlanetStage {
  id: string;
  planetId: string; // 'toan' | 'ly' | 'hoa' | 'van' | 'anh'
  planetName: string;
  stageNumber: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  starsEarned: number; // 0 - 3
  isUnlocked: boolean;
  isCompleted: boolean;
  rewardCP: number;
  questionIds: string[];
}

export interface CelestialPassReward {
  level: number;
  freeReward: {
    title: string;
    cp: number;
    crystals: number;
    icon: string;
  };
  vipReward: {
    title: string;
    cp: number;
    crystals: number;
    badge?: string;
    icon: string;
  };
  freeClaimed: boolean;
  vipClaimed: boolean;
}

export interface RankedOpponent {
  id: string;
  name: string;
  avatar: string;
  school: string;
  province: string;
  rankTier: RankTier;
  rankDivision: 1 | 2 | 3 | 4;
  combatPower: number;
  winStreak: number;
  accuracyRate: number; // 0 - 100
  avgAnswerSeconds: number;
}


