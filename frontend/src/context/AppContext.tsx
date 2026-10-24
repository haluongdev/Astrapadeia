import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  VIPTier,
  Subject,
  Chapter,
  Lesson,
  Question,
  Exam,
  ExamSubmission,
  MistakeItem,
  WeakTopic,
  WeeklyStudyPlan,
  RAGDocument,
  AIChatMessage,
  Transaction,
  AuditLog,
  FeedbackReport,
  UserGameStats,
  GameQuest,
  PlanetStage,
  CelestialPassReward,
  LeaderboardEntry,
  RankTier,
  ScreenId
} from '../types';
import { getScreenMetadata } from '../routes/screenRegistry';
import { screenFromLocation, hashForScreen } from '../routes/navigation';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_LESSONS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_RAG_DOCS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FEEDBACKS,
  INITIAL_GAME_STATS,
  INITIAL_GAME_QUESTS,
  INITIAL_PLANET_STAGES,
  INITIAL_CELESTIAL_PASS_REWARDS,
  INITIAL_LEADERBOARD,
  MOCK_PAYMENT_CONFIG,
  RANK_TIER_CONFIG
} from '../data/mockData';

interface SystemConfig {
  minPasswordLength: number;
  sessionTimeoutMinutes: number;
  failedLoginThreshold: number;
  allowRegistration: boolean;
  enableAI: boolean;
  enableVIPSale: boolean;
  maxFreePracticeDaily: number;
  maxFreeAIQueriesDaily: number;
  maxVIPAIQueriesDaily: number;
}

interface AppContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole, vip?: VIPTier) => void;
  users: UserProfile[];
  subjects: Subject[];
  chapters: Chapter[];
  lessons: Lesson[];
  questions: Question[];
  exams: Exam[];
  ragDocs: RAGDocument[];
  completedLessonIds: string[];
  favoriteLessonIds: string[];
  lessonNotes: Record<string, string>;
  mistakeItems: MistakeItem[];
  examSubmissions: ExamSubmission[];
  weakTopics: WeakTopic[];
  weeklyPlan: WeeklyStudyPlan;
  aiMessages: AIChatMessage[];
  aiDailyUsage: number;
  maxAIDailyUsage: number;
  transactions: Transaction[];
  auditLogs: AuditLog[];
  feedbacks: FeedbackReport[];
  systemConfig: SystemConfig;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeScreenId: ScreenId;
  navigateTo: (screenId: ScreenId, params?: Record<string, any>) => void;
  screenParams: Record<string, any>;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isSearchPaletteOpen: boolean;
  setSearchPaletteOpen: (open: boolean) => void;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;

  // Gamification & Ranked Arena
  userGameStats: UserGameStats;
  gameQuests: GameQuest[];
  planetStages: PlanetStage[];
  celestialPassRewards: CelestialPassReward[];
  leaderboard: LeaderboardEntry[];
  claimQuestReward: (questId: string) => void;
  claimDailyEnergyChest: (chestPercent: number) => void;
  completePlanetStage: (stageId: string, stars: number, earnedCP: number) => void;
  claimPassReward: (level: number, isVip: boolean) => void;
  recordRankedMatchResult: (won: boolean, lpDelta: number, earnedCP: number, matchQuestions?: number) => void;
  createPendingQRTransaction: (planId: string, method: 'vietqr' | 'momo' | 'zalopay' | 'vnpay', coupon?: string) => Promise<Transaction>;
  simulateScanAndPay: (transactionId: string) => Promise<boolean>;
  approveTransaction: (transactionId: string) => void;
  rejectTransaction: (transactionId: string) => void;

  // Demo Authentication & Pending Registration (Requirement 4)
  pendingRegistration: {
    name: string;
    email: string;
    grade: 10 | 11 | 12;
    password?: string;
    school?: string;
    province?: string;
    phone?: string;
  } | null;
  setPendingRegistration: (data: any) => void;
  completeRegistrationWithOtp: (otp: string) => { success: boolean; message: string; user?: UserProfile };
  loginWithCredentials: (identifier: string, password: string) => { success: boolean; message: string; targetScreen?: ScreenId; user?: UserProfile };

  // Active Session Persistence (Requirement 5)
  activeExamSession: any;
  setActiveExamSession: (session: any) => void;
  clearActiveExamSession: () => void;
  activePracticeSession: any;
  setActivePracticeSession: (session: any) => void;
  clearActivePracticeSession: () => void;

  // Actions
  toggleLessonCompleted: (lessonId: string) => void;
  toggleLessonFavorite: (lessonId: string) => void;
  saveLessonNote: (lessonId: string, note: string) => void;
  submitExamOrPractice: (submission: ExamSubmission) => void;
  resolveMistake: (mistakeId: string) => void;
  sendAIMessage: (text: string, contextQuestion?: Question) => Promise<void>;
  rateAIMessage: (messageId: string, feedback: 'helpful' | 'not_helpful') => void;
  reportAIMessage: (messageId: string) => void;
  clearAIChat: () => void;
  purchaseVIP: (planId: string, method: 'vnpay' | 'momo' | 'zalopay' | 'vietqr', coupon?: string) => Promise<boolean>;
  requestRefund: (transactionId: string, reason: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleTaskCompletion: (taskId: string) => void;
  updateStudyHours: (hours: number) => void;
  
  // QTND actions
  addOrUpdateLesson: (lesson: Lesson) => void;
  addOrUpdateQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  addOrUpdateExam: (exam: Exam) => void;
  uploadRAGDoc: (doc: Partial<RAGDocument>) => void;
  toggleRAGDocStatus: (id: string, status: 'approved' | 'revoked') => void;
  gradeEssay: (submissionId: string, score: number, feedback: string) => void;
  regradeExam: (submissionId: string, newScore: number, reason: string) => void;
  replyFeedback: (id: string, response: string) => void;

  // QTV actions
  lockUnlockUser: (userId: string, reason: string) => void;
  resetUserPassword: (userId: string) => void;
  deleteUser: (userId: string) => void;
  updateSystemConfig: (updates: Partial<SystemConfig>) => void;
  manualGrantVIP: (userId: string, days: number, reason: string) => void;
  approveRefund: (transactionId: string) => void;
  rejectRefund: (transactionId: string) => void;
  addAuditLog: (action: string, target: string, details: string) => void;
  submitFeedback: (type: 'question_error' | 'lesson_error' | 'general', content: string, relatedId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FREE_USER_SEEDS = {
  completedLessons: ['les-toan-1'],
  favoriteLessons: ['les-toan-2'],
  lessonNotes: { 'les-toan-1': 'Nhớ chú ý điều kiện dấu bằng xảy ra tại hữu hạn điểm.' },
  mistakes: [
    {
      id: 'mistake-free-1',
      questionId: 'q-toan-04',
      subjectId: 'toan',
      topic: 'Khảo sát hàm phân thức hữu tỉ',
      failedCount: 2,
      lastFailedAt: 'Hôm qua, 21:15',
      resolved: false,
      userLastAnswer: 'Chọn đồng biến trên R'
    }
  ],
  submissions: [
    {
      id: 'sub-demo-free-001',
      examId: 'exam-thpt-toan-2025',
      examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 Môn Toán',
      subjectId: 'toan',
      userId: 'user-student-free',
      startedAt: '2026-03-14T09:00:00Z',
      submittedAt: '2026-03-14T10:15:20Z',
      durationSeconds: 4520,
      score: 7.25,
      maxScore: 10,
      correctCount: 4,
      wrongCount: 1,
      unansweredCount: 0,
      answers: {},
      partScores: { p1: 2.25, p2: 2.5, p3: 2.5 },
      topicBreakdown: {
        'Tính đơn điệu hàm số': { total: 1, correct: 1 },
        'Khảo sát hàm phân thức hữu tỉ': { total: 1, correct: 0 }
      }
    }
  ]
};

const VIP_USER_SEEDS = {
  completedLessons: ['les-toan-1', 'les-toan-2', 'les-ly-1', 'les-ly-2'],
  favoriteLessons: ['les-toan-1', 'les-toan-3'],
  lessonNotes: {
    'les-toan-2': 'Công thức toạ độ hình chiếu vuông góc lên trục và mặt phẳng Oxyz.',
    'les-ly-1': 'Định luật I nhiệt động lực học: Delta U = Q + A.'
  },
  mistakes: [],
  submissions: [
    {
      id: 'sub-demo-vip-001',
      examId: 'exam-thpt-toan-2025',
      examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 Môn Toán',
      subjectId: 'toan',
      userId: 'user-student-vip',
      startedAt: '2026-04-02T14:00:00Z',
      submittedAt: '2026-04-02T15:25:00Z',
      durationSeconds: 5100,
      score: 9.5,
      maxScore: 10,
      correctCount: 5,
      wrongCount: 0,
      unansweredCount: 0,
      answers: {},
      partScores: { p1: 3.0, p2: 3.5, p3: 3.0 },
      topicBreakdown: {
        'Tính đơn điệu hàm số': { total: 1, correct: 1 },
        'Khảo sát hàm phân thức hữu tỉ': { total: 1, correct: 1 }
      }
    }
  ]
};

function getUserScopedKey(userId: string, key: string): string {
  return `scholyx_u_${userId}_${key}`;
}

function loadUserScopedData<T>(userId: string, key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(getUserScopedKey(userId, key));
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveUserScopedData<T>(userId: string, key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserScopedKey(userId, key), JSON.stringify(value));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user & role
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('scholyx_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('scholyx_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [chapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('scholyx_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('scholyx_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('scholyx_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });
  const [ragDocs, setRagDocs] = useState<RAGDocument[]>(() => {
    const saved = localStorage.getItem('scholyx_rag');
    return saved ? JSON.parse(saved) : INITIAL_RAG_DOCS;
  });

  // User learning state (strictly partitioned by userId)
  const initialUid = currentUser.id;
  const initialSeeds =
    initialUid === 'user-student-vip'
      ? VIP_USER_SEEDS
      : initialUid === 'user-student-free'
      ? FREE_USER_SEEDS
      : { completedLessons: [], favoriteLessons: [], lessonNotes: {}, mistakes: [], submissions: [] };

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() =>
    loadUserScopedData(initialUid, 'completed_lessons', initialSeeds.completedLessons)
  );
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<string[]>(() =>
    loadUserScopedData(initialUid, 'fav_lessons', initialSeeds.favoriteLessons)
  );
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>(() =>
    loadUserScopedData(initialUid, 'notes', initialSeeds.lessonNotes)
  );

  // Mistake Notebook partitioned by userId
  const [mistakeItems, setMistakeItems] = useState<MistakeItem[]>(() =>
    loadUserScopedData(initialUid, 'mistakes', initialSeeds.mistakes)
  );

  // Submissions partitioned by userId
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>(() =>
    loadUserScopedData(initialUid, 'submissions', initialSeeds.submissions)
  );

  // Pending Registration & Auth (Requirement 4)
  const [pendingRegistration, setPendingRegistration] = useState<any>(() => {
    const saved = localStorage.getItem('scholyx_pending_registration');
    return saved ? JSON.parse(saved) : null;
  });

  // In-Progress Session persistence (Requirement 5)
  const [activeExamSession, setActiveExamSessionState] = useState<any>(() => {
    return loadUserScopedData(initialUid, 'active_exam', null);
  });
  const [activePracticeSession, setActivePracticeSessionState] = useState<any>(() => {
    return loadUserScopedData(initialUid, 'active_practice', null);
  });

  const setActiveExamSession = (session: any) => {
    setActiveExamSessionState(session);
    saveUserScopedData(currentUser.id, 'active_exam', session);
  };

  const clearActiveExamSession = () => {
    setActiveExamSessionState(null);
    saveUserScopedData(currentUser.id, 'active_exam', null);
  };

  const setActivePracticeSession = (session: any) => {
    setActivePracticeSessionState(session);
    saveUserScopedData(currentUser.id, 'active_practice', session);
  };

  const clearActivePracticeSession = () => {
    setActivePracticeSessionState(null);
    saveUserScopedData(currentUser.id, 'active_practice', null);
  };

  // Weak Topics
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([
    {
      topic: 'Khảo sát hàm phân thức hữu tỉ',
      subjectId: 'toan',
      masteryPercentage: 42,
      status: 'Yếu',
      sampleCount: 12,
      recommendedLessonId: 'les-toan-1'
    },
    {
      topic: 'Xác suất có điều kiện & Bayes',
      subjectId: 'toan',
      masteryPercentage: 58,
      status: 'Trung bình',
      sampleCount: 8,
      recommendedLessonId: 'les-toan-2'
    },
    {
      topic: 'Nhiệt động học & Phương trình trạng thái',
      subjectId: 'ly',
      masteryPercentage: 48,
      status: 'Yếu',
      sampleCount: 15,
      recommendedLessonId: 'les-ly-1'
    },
    {
      topic: 'Toạ độ không gian Oxyz',
      subjectId: 'toan',
      masteryPercentage: 88,
      status: 'Tốt',
      sampleCount: 22,
      recommendedLessonId: 'les-toan-3'
    }
  ]);

  // Weekly study plan
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyStudyPlan>({
    weekNumber: 12,
    startDate: '16/03/2026',
    endDate: '22/03/2026',
    focusTopics: ['Hàm phân thức & Tiệm cận', 'Nhiệt dung riêng & Khí lý tưởng', 'Toạ độ Oxyz nâng cao'],
    tasks: [
      {
        id: 'task-1',
        dayOfWeek: 'Thứ Hai',
        dateStr: '16/03',
        title: 'Ôn tập tính đơn điệu & giải lại 5 câu sai phần Khảo sát hàm số',
        subjectId: 'toan',
        type: 'review',
        durationMinutes: 45,
        completed: true,
        priority: 'high'
      },
      {
        id: 'task-2',
        dayOfWeek: 'Thứ Ba',
        dateStr: '17/03',
        title: 'Học lý thuyết Bài 1 Vật lí nhiệt & làm bài luyện tập mức Vận dụng',
        subjectId: 'ly',
        type: 'lesson',
        durationMinutes: 60,
        completed: false,
        priority: 'high'
      },
      {
        id: 'task-3',
        dayOfWeek: 'Thứ Tư',
        dateStr: '18/03',
        title: 'Làm đề thi thử Toán THPT 2025 Phần II Đúng/Sai',
        subjectId: 'toan',
        type: 'practice',
        durationMinutes: 45,
        completed: false,
        priority: 'medium'
      },
      {
        id: 'task-4',
        dayOfWeek: 'Thứ Năm',
        dateStr: '19/03',
        title: 'Tra cứu Trợ lý AI Scholyx Cosmos các công thức xác suất toàn phần',
        subjectId: 'toan',
        type: 'review',
        durationMinutes: 30,
        completed: false,
        priority: 'normal'
      },
      {
        id: 'task-5',
        dayOfWeek: 'Thứ Bảy',
        dateStr: '21/03',
        title: 'Thi thử trọn vẹn 90 phút Đề Toán Mã M101',
        subjectId: 'toan',
        type: 'exam',
        durationMinutes: 90,
        completed: false,
        priority: 'high'
      }
    ]
  });

  // AI chat
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    {
      id: 'ai-init',
      role: 'assistant',
      content: 'Xin chào bạn! Mình là **Cosmos** - Trợ lý AI học tập & ôn thi THPT của Scholyx. Mình được trang bị kho tri thức chuẩn GDPT 2018 (SGK Kết nối tri thức, Cánh diều, QĐ 764 Bộ GD&ĐT). Bạn có câu hỏi nào về Toán, Lí, Hóa, Văn hay cấu trúc đề thi mới không?',
      timestamp: '08:00',
      sources: ['Hệ tri thức Scholyx THPT 2018']
    }
  ]);
  const [aiDailyUsage, setAiDailyUsage] = useState<number>(3);

  // E-Commerce & Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [feedbacks, setFeedbacks] = useState<FeedbackReport[]>(INITIAL_FEEDBACKS);

  // System Config
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    minPasswordLength: 8,
    sessionTimeoutMinutes: 30,
    failedLoginThreshold: 5,
    allowRegistration: true,
    enableAI: true,
    enableVIPSale: true,
    maxFreePracticeDaily: 30,
    maxFreeAIQueriesDaily: 10,
    maxVIPAIQueriesDaily: 50
  });

  const [activeNavTab, setActiveNavTab] = useState<string>('home');
  const [activeScreenId, setActiveScreenId] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const match = screenFromLocation(window.location.hash);
      if (match) return match;
    }
    return 'home';
  });
  const [screenParams, setScreenParams] = useState<Record<string, any>>({});
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSearchPaletteOpen, setSearchPaletteOpen] = useState<boolean>(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>('les-toan-1');
  const [activeExamId, setActiveExamId] = useState<string | null>('exam-thpt-toan-2025');

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const navigateTo = (screenId: ScreenId, params?: Record<string, any>) => {
    setActiveScreenId(screenId);
    setActiveNavTab(screenId);
    // Clear screen-specific parameters when changing pages to avoid leaking
    // a previous practice subject or AI context into an unrelated flow.
    setScreenParams(params ?? {});
    const meta = getScreenMetadata(screenId);
    if (meta && typeof window !== 'undefined') {
      if (window.location.hash !== hashForScreen(screenId)) {
        window.location.hash = hashForScreen(screenId);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync hash changes from browser history
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const match = screenFromLocation(window.location.hash);
        if (match && match !== activeScreenId) {
          setActiveScreenId(match);
          setActiveNavTab(match);
          setScreenParams({});
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [activeScreenId]);

  // Gamification & Ranked Arena state
  const [userGameStats, setUserGameStats] = useState<UserGameStats>(() => {
    const saved = localStorage.getItem('scholyx_game_stats');
    return saved ? JSON.parse(saved) : INITIAL_GAME_STATS;
  });

  const [gameQuests, setGameQuests] = useState<GameQuest[]>(() => {
    const saved = localStorage.getItem('scholyx_game_quests');
    return saved ? JSON.parse(saved) : INITIAL_GAME_QUESTS;
  });

  const [planetStages, setPlanetStages] = useState<PlanetStage[]>(() => {
    const saved = localStorage.getItem('scholyx_planet_stages');
    return saved ? JSON.parse(saved) : INITIAL_PLANET_STAGES;
  });

  const [celestialPassRewards, setCelestialPassRewards] = useState<CelestialPassReward[]>(() => {
    const saved = localStorage.getItem('scholyx_celestial_pass');
    return saved ? JSON.parse(saved) : INITIAL_CELESTIAL_PASS_REWARDS;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('scholyx_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('scholyx_game_stats', JSON.stringify(userGameStats));
  }, [userGameStats]);

  useEffect(() => {
    localStorage.setItem('scholyx_game_quests', JSON.stringify(gameQuests));
  }, [gameQuests]);

  useEffect(() => {
    localStorage.setItem('scholyx_planet_stages', JSON.stringify(planetStages));
  }, [planetStages]);

  useEffect(() => {
    localStorage.setItem('scholyx_celestial_pass', JSON.stringify(celestialPassRewards));
  }, [celestialPassRewards]);

  // Synchronize user learning states whenever currentUser changes
  useEffect(() => {
    const uid = currentUser.id;
    let fallbackSeeds: {
      completedLessons: string[];
      favoriteLessons: string[];
      lessonNotes: Record<string, string>;
      mistakes: any[];
      submissions: ExamSubmission[];
    } = { completedLessons: [], favoriteLessons: [], lessonNotes: {}, mistakes: [], submissions: [] };
    if (uid === 'user-student-free') {
      fallbackSeeds = FREE_USER_SEEDS;
    } else if (uid === 'user-student-vip') {
      fallbackSeeds = VIP_USER_SEEDS;
    }

    setCompletedLessonIds(loadUserScopedData(uid, 'completed_lessons', fallbackSeeds.completedLessons));
    setFavoriteLessonIds(loadUserScopedData(uid, 'fav_lessons', fallbackSeeds.favoriteLessons));
    setLessonNotes(loadUserScopedData(uid, 'notes', fallbackSeeds.lessonNotes));
    setMistakeItems(loadUserScopedData(uid, 'mistakes', fallbackSeeds.mistakes));
    setExamSubmissions(loadUserScopedData(uid, 'submissions', fallbackSeeds.submissions));
    setActiveExamSessionState(loadUserScopedData(uid, 'active_exam', null));
    setActivePracticeSessionState(loadUserScopedData(uid, 'active_practice', null));
  }, [currentUser.id]);

  // Persist user-scoped data
  useEffect(() => {
    saveUserScopedData(currentUser.id, 'completed_lessons', completedLessonIds);
  }, [completedLessonIds, currentUser.id]);

  useEffect(() => {
    saveUserScopedData(currentUser.id, 'fav_lessons', favoriteLessonIds);
  }, [favoriteLessonIds, currentUser.id]);

  useEffect(() => {
    saveUserScopedData(currentUser.id, 'notes', lessonNotes);
  }, [lessonNotes, currentUser.id]);

  useEffect(() => {
    saveUserScopedData(currentUser.id, 'mistakes', mistakeItems);
  }, [mistakeItems, currentUser.id]);

  useEffect(() => {
    saveUserScopedData(currentUser.id, 'submissions', examSubmissions);
  }, [examSubmissions, currentUser.id]);

  useEffect(() => {
    if (pendingRegistration) {
      localStorage.setItem('scholyx_pending_registration', JSON.stringify(pendingRegistration));
    } else {
      localStorage.removeItem('scholyx_pending_registration');
    }
  }, [pendingRegistration]);

  // Complete registration via demo OTP (Requirement 4)
  const completeRegistrationWithOtp = (otp: string): { success: boolean; message: string; user?: UserProfile } => {
    const validOtps = ['123456', '888888'];
    if (!validOtps.includes(otp.trim())) {
      return {
        success: false,
        message: 'Mã OTP không chính xác. Trong chế độ Demo Sandbox, vui lòng nhập mã thử nghiệm: 123456 hoặc 888888.'
      };
    }

    const regData = pendingRegistration || {
      name: 'Học Sinh Mới',
      email: 'hocsinh.moi@scholyx.edu.vn',
      grade: 12,
      school: 'THPT Quốc Gia',
      province: 'Hà Nội'
    };

    const newUser: UserProfile = {
      id: `user-student-${Date.now()}`,
      name: regData.name || 'Học Sinh Mới',
      email: regData.email || 'hocsinh.moi@scholyx.edu.vn',
      phone: regData.phone || '0988776655',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      grade: regData.grade || 12,
      school: regData.school || 'THPT Quốc Gia',
      province: regData.province || 'Việt Nam',
      role: 'student',
      vipTier: 'free',
      targetSubjects: ['toan', 'van'],
      targetScores: { toan: 8.5, van: 8.0 },
      examDate: '2027-06-25',
      allowAIPersonalization: true,
      studyHoursPerDay: 3,
      streakDays: 1,
      lastActive: 'Vừa xong',
      status: 'active'
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setPendingRegistration(null);

    // Initial empty learning records for the new student
    saveUserScopedData(newUser.id, 'completed_lessons', []);
    saveUserScopedData(newUser.id, 'fav_lessons', []);
    saveUserScopedData(newUser.id, 'notes', {});
    saveUserScopedData(newUser.id, 'mistakes', []);
    saveUserScopedData(newUser.id, 'submissions', []);

    return {
      success: true,
      message: 'Kích hoạt tài khoản thành công! Chuyển tiếp tới bước thiết lập mục tiêu ban đầu.',
      user: newUser
    };
  };

  // Demo Login with credentials validation and proper role dashboard routing (Requirement 4)
  const loginWithCredentials = (identifier: string, password: string): { success: boolean; message: string; targetScreen?: ScreenId; user?: UserProfile } => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.' };
    }

    if (trimmedPass.length < 8) {
      return { success: false, message: 'Mật khẩu phải có tối thiểu 8 ký tự theo quy định bảo mật BR-ACC-02.' };
    }

    // Match with existing users
    let matchedUser = users.find(u =>
      u.email.toLowerCase() === trimmedId || (u.phone && u.phone === trimmedId) || u.id === trimmedId
    );

    // Support demo aliases
    if (!matchedUser) {
      if (trimmedId.includes('haidang') || trimmedId.includes('vip')) {
        matchedUser = users.find(u => u.id === 'user-student-vip') || INITIAL_USERS[1];
      } else if (trimmedId.includes('admin') || trimmedId.includes('qtv')) {
        matchedUser = users.find(u => u.id === 'user-qtv') || INITIAL_USERS[3];
      } else if (trimmedId.includes('an.le') || trimmedId.includes('qtnd') || trimmedId.includes('teacher')) {
        matchedUser = users.find(u => u.id === 'user-qtnd') || INITIAL_USERS[2];
      } else if (trimmedId.includes('quan') || trimmedId.includes('free') || trimmedId.includes('student')) {
        matchedUser = users.find(u => u.id === 'user-student-free') || INITIAL_USERS[0];
      }
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'Tài khoản không tồn tại trong hệ thống Demo. Vui lòng sử dụng tài khoản mẫu gợi ý hoặc tạo tài khoản mới.'
      };
    }

    setCurrentUser(matchedUser);

    // Navigate to role-specific dashboard (Requirement 4)
    let targetScreen: ScreenId = 'home';
    if (matchedUser.role === 'student') {
      targetScreen = 'home';
    } else if (matchedUser.role === 'qtnd') {
      targetScreen = 'cms-lessons';
    } else if (matchedUser.role === 'qtv') {
      targetScreen = 'admin-overview';
    }

    return {
      success: true,
      message: 'Đăng nhập thành công trong môi trường Demo Sandbox!',
      targetScreen,
      user: matchedUser
    };
  };

  // Role Switcher helper
  const switchRole = (role: UserRole, vip?: VIPTier) => {
    if (role === 'guest') {
      const guestUser: UserProfile = {
        id: 'guest',
        name: 'Khách Tham Quan',
        email: 'guest@scholyx.vn',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        grade: 12,
        school: 'Khách Vãng Lai',
        province: 'Việt Nam',
        role: 'guest',
        vipTier: 'free',
        targetSubjects: ['toan'],
        targetScores: {},
        examDate: '2027-06-25',
        allowAIPersonalization: false,
        studyHoursPerDay: 0,
        streakDays: 0,
        lastActive: 'Hiện tại',
        status: 'active'
      };
      setCurrentUser(guestUser);
      navigateTo('home');
      return;
    }

    if (role === 'qtnd') {
      const teacher = users.find(u => u.role === 'qtnd') || INITIAL_USERS[2];
      setCurrentUser(teacher);
      navigateTo('cms-lessons');
      return;
    }

    if (role === 'qtv') {
      const admin = users.find(u => u.role === 'qtv') || INITIAL_USERS[3];
      setCurrentUser(admin);
      navigateTo('admin-overview');
      return;
    }

    // student
    if (vip === 'vip') {
      const vipUser = users.find(u => u.id === 'user-student-vip') || INITIAL_USERS[1];
      setCurrentUser(vipUser);
    } else {
      const freeUser = users.find(u => u.id === 'user-student-free') || INITIAL_USERS[0];
      setCurrentUser(freeUser);
    }
    navigateTo('overview-free');
  };

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds(prev => {
      const isCompleting = !prev.includes(lessonId);
      if (isCompleting) {
        // Advance Daily Quest for new lesson
        setGameQuests(quests => quests.map(q => {
          if (q.id === 'quest-d3') {
            const nextProg = Math.min(q.maxProgress, q.currentProgress + 1);
            return { ...q, currentProgress: nextProg, completed: nextProg >= q.maxProgress };
          }
          return q;
        }));
        setUserGameStats(gs => {
          const newExp = gs.currentExp + 50;
          const levelUp = newExp >= gs.maxExp;
          return {
            ...gs,
            combatPower: gs.combatPower + 150,
            currentExp: levelUp ? newExp - gs.maxExp : newExp,
            level: levelUp ? gs.level + 1 : gs.level,
            dailyEnergy: Math.min(100, gs.dailyEnergy + 15)
          };
        });
      }
      return isCompleting ? [...prev, lessonId] : prev.filter(id => id !== lessonId);
    });
  };

  const toggleLessonFavorite = (lessonId: string) => {
    setFavoriteLessonIds(prev =>
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  };

  const saveLessonNote = (lessonId: string, note: string) => {
    setLessonNotes(prev => ({ ...prev, [lessonId]: note }));
  };

  const submitExamOrPractice = (submission: ExamSubmission) => {
    setExamSubmissions(prev => [submission, ...prev]);

    // Check for wrong answers to add into Mistake Notebook automatically (FR-PRAC-09)
    Object.entries(submission.answers).forEach(([questionId, ans]) => {
      const q = questions.find(item => item.id === questionId);
      if (!q) return;

      let isWrong = false;
      let wrongSummary = '';

      if (q.type === 'choice') {
        if (ans.selectedOptionIndex !== undefined && ans.selectedOptionIndex !== q.correctOptionIndex) {
          isWrong = true;
          wrongSummary = `Chọn đáp án ${ans.selectedOptionIndex !== undefined ? ['A', 'B', 'C', 'D'][ans.selectedOptionIndex] : 'trống'}`;
        }
      } else if (q.type === 'true_false' && q.propositions && ans.selectedPropositions) {
        const correctProps = q.propositions.every(p => ans.selectedPropositions?.[p.id] === p.isCorrect);
        if (!correctProps) {
          isWrong = true;
          wrongSummary = 'Sai một hoặc nhiều ý trong câu Đúng/Sai';
        }
      } else if (q.type === 'short_answer' && q.shortAnswerKey) {
        const normalizedUser = (ans.shortAnswerText || '').trim().replace(',', '.');
        const normalizedKey = q.shortAnswerKey.trim().replace(',', '.');
        if (normalizedUser !== normalizedKey) {
          isWrong = true;
          wrongSummary = `Nhập: "${ans.shortAnswerText || 'trống'}" (Đáp án đúng: ${q.shortAnswerKey})`;
        }
      }

      if (isWrong) {
        setMistakeItems(prev => {
          const existing = prev.find(m => m.questionId === questionId);
          if (existing) {
            return prev.map(m =>
              m.questionId === questionId
                ? { ...m, failedCount: m.failedCount + 1, lastFailedAt: 'Vừa xong', resolved: false, userLastAnswer: wrongSummary }
                : m
            );
          } else {
            return [
              {
                id: `mistake-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                questionId,
                subjectId: q.subjectId,
                topic: q.topic,
                failedCount: 1,
                lastFailedAt: 'Vừa xong',
                resolved: false,
                userLastAnswer: wrongSummary
              },
              ...prev
            ];
          }
        });
      }
    });

    // Advance Gamification Quests (Daily & Weekly)
    const totalQ = submission.correctCount + submission.wrongCount;
    setGameQuests(quests => quests.map(q => {
      if (q.id === 'quest-d2') { // Xạ thủ trắc nghiệm
        const next = Math.min(q.maxProgress, q.currentProgress + submission.correctCount);
        return { ...q, currentProgress: next, completed: next >= q.maxProgress };
      }
      if (q.id === 'quest-w1') { // Đại đột phá tuần
        const next = Math.min(q.maxProgress, q.currentProgress + totalQ);
        return { ...q, currentProgress: next, completed: next >= q.maxProgress };
      }
      if (q.id === 'quest-w2' && submission.score >= 8.0) { // Đạt 8+ điểm
        return { ...q, currentProgress: 1, completed: true };
      }
      return q;
    }));

    // Grant Combat Power (Chiến Lực) proportional to score and correct answers
    const earnedCP = Math.round(submission.score * 35) + submission.correctCount * 20;
    setUserGameStats(gs => {
      const newExp = gs.currentExp + Math.round(submission.score * 10);
      const levelUp = newExp >= gs.maxExp;
      const subKey = submission.subjectId === 'toan' ? 'mathCP' : submission.subjectId === 'ly' ? 'physicsCP' : 'chemistryCP';
      return {
        ...gs,
        combatPower: gs.combatPower + earnedCP,
        currentExp: levelUp ? newExp - gs.maxExp : newExp,
        level: levelUp ? gs.level + 1 : gs.level,
        [subKey]: (gs as any)[subKey] + earnedCP,
        dailyEnergy: Math.min(100, gs.dailyEnergy + 20)
      };
    });

    // Update study streak & hours
    setCurrentUser(prev => ({
      ...prev,
      streakDays: prev.streakDays + 1
    }));
  };

  const resolveMistake = (mistakeId: string) => {
    setMistakeItems(prev =>
      prev.map(item => item.id === mistakeId ? { ...item, resolved: true } : item)
    );
    // Advance quest and award CP
    setGameQuests(quests => quests.map(q => {
      if (q.id === 'quest-d5') {
        const next = Math.min(q.maxProgress, q.currentProgress + 1);
        return { ...q, currentProgress: next, completed: next >= q.maxProgress };
      }
      return q;
    }));
    setUserGameStats(gs => ({
      ...gs,
      combatPower: gs.combatPower + 120,
      dailyEnergy: Math.min(100, gs.dailyEnergy + 10)
    }));
  };

  const sendAIMessage = async (text: string, contextQuestion?: Question) => {
    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages(prev => [...prev, userMsg]);
    setAiDailyUsage(prev => prev + 1);

    // AI Guardrail check: Self-harm or safety (BR-AI-07)
    const lower = text.toLowerCase();
    if (lower.includes('tự tử') || lower.includes('chết') || lower.includes('làm hại bản thân') || lower.includes('tổn thương')) {
      const safetyResponse: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `❤️ **Scholyx luôn bên bạn và lắng nghe bạn!**\n\nMình nhận thấy bạn có thể đang trải qua cảm xúc căng thẳng hoặc khó khăn. Bạn không hề đơn độc! Hãy chia sẻ ngay với người thân, thầy cô hoặc liên hệ:\n\n- 📞 **Tổng đài Quốc gia Bảo vệ Trẻ em & Học sinh: 111** (Miễn phí 24/7)\n- 📞 **Đường dây nóng hỗ trợ tâm lý Ngày Mai: 096 306 1414**\n\nCuộc sống này còn rất nhiều điều tươi đẹp đang chờ đón bạn. Hãy chăm sóc sức khỏe của mình bạn nhé!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sources: ['Quy chuẩn an toàn sức khỏe tâm thần Scholyx (BR-AI-07)']
      };
      setAiMessages(prev => [...prev, safetyResponse]);
      return;
    }

    // AI Guardrail check: Non-educational content (FR-AI-04, BR-AI-07)
    if (lower.includes('chứng khoán') || lower.includes('bitcoin') || lower.includes('đánh bạc') || lower.includes('hack')) {
      const outOfScopeResponse: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `Trợ lý Cosmos được thiết kế chuyên biệt để hỗ trợ học tập và ôn thi tốt nghiệp THPT theo Chương trình GDPT 2018 (Toán, Lí, Hóa, Văn, Anh, Sinh, Sử, Địa). Yêu cầu này nằm ngoài phạm vi học tập THPT, bạn hãy đặt câu hỏi liên quan đến kiến thức môn học nhé!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sources: ['Quy chế hỗ trợ học tập THPT (BR-AI-07)']
      };
      setAiMessages(prev => [...prev, outOfScopeResponse]);
      return;
    }

    // Simulate RAG retrieval from approved RAG documents
    const relevantDoc = ragDocs.find(d => d.status === 'approved' && (text.includes('Toán') || text.includes('hàm số') || text.includes('đạo hàm') || text.includes('Oxyz') || text.includes('nhiệt') || text.includes('đề thi')));
    const sourceTitle = relevantDoc ? relevantDoc.title : 'SGK Toán 12 Tập 1 - Kết Nối Tri Thức Với Cuộc Sống';

    let answerText = '';
    if (contextQuestion) {
      answerText = `### Phân tích câu hỏi: ${contextQuestion.topic} (${contextQuestion.subjectId.toUpperCase()})\n\n**Lời giải chi tiết:**\n${contextQuestion.explanation}\n\n**Phương pháp cốt lõi:**\n- Nhớ công thức chủ chốt và điều kiện xác định trước tiên.\n- Với trắc nghiệm Đúng/Sai, kiểm tra từng mệnh đề độc lập để đạt điểm tối đa theo quy chế 2025 (4 ý = 1.0 điểm).`;
    } else if (text.toLowerCase().includes('cấu trúc') || text.toLowerCase().includes('đề thi') || text.toLowerCase().includes('2025')) {
      answerText = `### Cấu trúc đề thi tốt nghiệp THPT từ năm 2025 theo Quyết định 764/QĐ-BGDĐT:\n\n1. **Phần I (Trắc nghiệm nhiều lựa chọn):**\n   - Môn Toán: 12 câu (0.25đ/câu = 3.0 điểm).\n   - Chọn 1 trong 4 phương án A, B, C, D.\n\n2. **Phần II (Trắc nghiệm Đúng/Sai):**\n   - Gồm 4 câu hỏi (4.0 điểm). Mỗi câu có 4 lệnh hỏi a, b, c, d.\n   - Đúng 1 ý: 0.1 điểm\n   - Đúng 2 ý: 0.25 điểm\n   - Đúng 3 ý: 0.50 điểm\n   - Đúng 4 ý: 1.00 điểm (Quy tắc lũy tiến).\n\n3. **Phần III (Trắc nghiệm trả lời ngắn):**\n   - Gồm 6 câu hỏi (3.0 điểm, mỗi câu 0.5 điểm). Thí sinh điền kết quả dạng số thập phân hoặc số nguyên.`;
    } else if (text.toLowerCase().includes('đạo hàm') || text.toLowerCase().includes('đồng biến')) {
      answerText = `### Quy tắc xét tính đồng biến, nghịch biến bằng đạo hàm:\n\nCho hàm số $y = f(x)$ xác định và có đạo hàm trên khoảng $K$:\n- Nếu $f'(x) \\ge 0, \\forall x \\in K$ và đẳng thức $f'(x) = 0$ chỉ xảy ra tại một số hữu hạn điểm thì hàm số **đồng biến** trên $K$.\n- Nếu $f'(x) \\le 0, \\forall x \\in K$ và đẳng thức chỉ xảy ra tại hữu hạn điểm thì hàm số **nghịch biến** trên $K$.\n\n**Mẹo Scholyx:** Đối với hàm phân thức bậc nhất trên bậc nhất $y = \\frac{ax+b}{cx+d}$, đạo hàm $y' = \\frac{ad - bc}{(cx+d)^2}$ không bao giờ bằng 0, do đó hàm số luôn đồng biến hoặc nghịch biến trên **từng khoảng xác định**, KHÔNG đồng biến trên $\\mathbb{R}$.`;
    } else {
      answerText = `Chào bạn, dựa trên kho tri thức chuẩn GDPT 2018:\n\nVấn đề bạn hỏi "${text}" liên quan trực tiếp đến trọng tâm ôn thi tốt nghiệp THPT. Để giải quyết dạng bài này hiệu quả:\n1. Nắm chắc định nghĩa và tập xác định cơ bản.\n2. Vận dụng công thức chuyển đổi hoặc biểu diễn đại số.\n3. Rèn luyện kỹ năng phân loại phương án nhiễu.\n\nBạn có muốn mình giải một ví dụ mẫu hay gợi ý bài luyện tập chủ đề này không?`;
    }

    // Delay 700ms to simulate fast LLM generation
    setTimeout(() => {
      const botMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: answerText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sources: [
          'Gợi ý tham khảo từ mô hình tri thức SCHOLYX AI (Chế độ mô phỏng Sandbox)',
          'Tham khảo định hướng GDPT 2018 (Mô phỏng)'
        ]
      };
      setAiMessages(prev => [...prev, botMsg]);
    }, 700);
  };

  const rateAIMessage = (messageId: string, feedback: 'helpful' | 'not_helpful') => {
    setAiMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, feedback } : m)
    );
  };

  const reportAIMessage = (messageId: string) => {
    setAiMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, reported: true } : m)
    );
  };

  const clearAIChat = () => {
    setAiMessages([
      {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'Đã làm mới phiên hội thoại. Mình sẵn sàng hỗ trợ các câu hỏi mới của bạn!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // E-Commerce & Simulated Payment
  const purchaseVIP = async (planId: string, method: 'vnpay' | 'momo' | 'zalopay' | 'vietqr', coupon?: string): Promise<boolean> => {
    const plansMap: Record<string, { name: string; price: number; days: number }> = {
      'plan-comet': { name: 'Gói Sao Băng (1 Tháng)', price: 79000, days: 30 },
      'plan-galaxy': { name: 'Gói Nhật Thực (3 Tháng)', price: 199000, days: 90 },
      'plan-cosmos': { name: 'Gói Thiên Hà Trọn Năm', price: 499000, days: 365 }
    };

    const targetPlan = plansMap[planId] || plansMap['plan-galaxy'];
    let discount = 0;
    if (coupon?.toUpperCase() === 'ASTRA2025' || coupon?.toUpperCase() === 'SCHOLYX2025') {
      discount = Math.round(targetPlan.price * 0.2); // 20%
    } else if (coupon?.toUpperCase() === 'VIP20') {
      discount = 20000;
    }

    const finalAmount = Math.max(0, targetPlan.price - discount);
    const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn: Transaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      planId,
      planName: targetPlan.name,
      amountVND: finalAmount,
      discountVND: discount,
      paymentMethod: method,
      status: 'success',
      createdAt: new Date().toLocaleString('vi-VN'),
      completedAt: new Date().toLocaleString('vi-VN'),
      invoiceNumber: invoiceNum,
      bankName: method === 'momo' ? MOCK_PAYMENT_CONFIG.momo.accountName : method === 'zalopay' ? MOCK_PAYMENT_CONFIG.zalopay.accountName : MOCK_PAYMENT_CONFIG.vietqr.bankName,
      accountNumber: method === 'vietqr' ? MOCK_PAYMENT_CONFIG.vietqr.accountNumber : MOCK_PAYMENT_CONFIG.momo.walletPhone,
      vatAmount: Math.round(finalAmount * 0.1 / 1.1),
      approvedBy: 'Cổng thanh toán tự động Scholyx Pay'
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Activate VIP for user (BR-VIP-03)
    const currentExpire = currentUser.vipExpiresAt ? new Date(currentUser.vipExpiresAt) : new Date();
    const newExpire = new Date(Math.max(Date.now(), currentExpire.getTime()) + targetPlan.days * 24 * 60 * 60 * 1000);

    setCurrentUser(prev => ({
      ...prev,
      vipTier: 'vip',
      vipExpiresAt: newExpire.toISOString()
    }));

    // Bonus CP on VIP upgrade!
    setUserGameStats(gs => ({
      ...gs,
      combatPower: gs.combatPower + 1500,
      crystals: gs.crystals + 200
    }));

    addAuditLog('THANH_TOÁN_VIP_THÀNH_CÔNG', `Giao dịch ${newTxn.id}`, `Kích hoạt ${targetPlan.name} cho tài khoản ${currentUser.email}`);
    return true;
  };

  const createPendingQRTransaction = async (
    planId: string,
    method: 'vietqr' | 'momo' | 'zalopay' | 'vnpay',
    coupon?: string
  ): Promise<Transaction> => {
    const plansMap: Record<string, { name: string; price: number; days: number }> = {
      'plan-comet': { name: 'Gói Sao Băng (1 Tháng)', price: 79000, days: 30 },
      'plan-galaxy': { name: 'Gói Nhật Thực (3 Tháng)', price: 199000, days: 90 },
      'plan-cosmos': { name: 'Gói Thiên Hà Trọn Năm', price: 499000, days: 365 }
    };
    const targetPlan = plansMap[planId] || plansMap['plan-galaxy'];
    let discount = 0;
    if (coupon?.toUpperCase() === 'ASTRA2025' || coupon?.toUpperCase() === 'SCHOLYX2025') {
      discount = Math.round(targetPlan.price * 0.2);
    } else if (coupon?.toUpperCase() === 'VIP20') {
      discount = 20000;
    }
    const finalAmount = Math.max(0, targetPlan.price - discount);
    const txnCode = Math.floor(100000 + Math.random() * 900000);
    const transferSyntax = `SCHOLYX VIP ${txnCode}`;
    const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const bankDetails = method === 'momo'
      ? { name: MOCK_PAYMENT_CONFIG.momo.accountName, num: MOCK_PAYMENT_CONFIG.momo.walletPhone }
      : method === 'zalopay'
      ? { name: MOCK_PAYMENT_CONFIG.zalopay.accountName, num: MOCK_PAYMENT_CONFIG.zalopay.walletPhone }
      : { name: MOCK_PAYMENT_CONFIG.vietqr.bankName, num: MOCK_PAYMENT_CONFIG.vietqr.accountNumber };

    const newTxn: Transaction = {
      id: `TXN-${txnCode}`,
      userId: currentUser.id,
      userName: currentUser.name,
      planId,
      planName: targetPlan.name,
      amountVND: finalAmount,
      discountVND: discount,
      paymentMethod: method,
      status: 'pending',
      createdAt: new Date().toLocaleString('vi-VN'),
      transferSyntax,
      invoiceNumber: invoiceNum,
      bankName: bankDetails.name,
      accountNumber: bankDetails.num,
      vatAmount: Math.round(finalAmount * 0.1 / 1.1),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('vi-VN'),
      customerNote: 'Đang chờ quét mã QR từ ví điện tử/ngân hàng hoặc QTV duyệt'
    };

    setTransactions(prev => [newTxn, ...prev]);
    addAuditLog('TẠO_GIAO_DỊCH_QR_PENDING', `Mã ${newTxn.id}`, `Số tiền: ${finalAmount.toLocaleString('vi-VN')}đ qua ${method.toUpperCase()}`);
    return newTxn;
  };

  const simulateScanAndPay = async (transactionId: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        setTransactions(prev =>
          prev.map(t => {
            if (t.id === transactionId) {
              return {
                ...t,
                status: 'success',
                completedAt: new Date().toLocaleString('vi-VN'),
                approvedBy: 'Ví điện tử Push Notification (Tự động)'
              };
            }
            return t;
          })
        );

        // Find the transaction to activate VIP
        const txn = transactions.find(t => t.id === transactionId);
        const days = txn?.planId === 'plan-cosmos' ? 365 : txn?.planId === 'plan-comet' ? 30 : 90;
        const currentExpire = currentUser.vipExpiresAt ? new Date(currentUser.vipExpiresAt) : new Date();
        const newExpire = new Date(Math.max(Date.now(), currentExpire.getTime()) + days * 24 * 60 * 60 * 1000);

        setCurrentUser(prev => ({
          ...prev,
          vipTier: 'vip',
          vipExpiresAt: newExpire.toISOString()
        }));

        setUserGameStats(gs => ({
          ...gs,
          combatPower: gs.combatPower + 1500,
          crystals: gs.crystals + 250
        }));

        addAuditLog('QUÉT_QR_THÀNH_CÔNG', `Giao dịch ${transactionId}`, 'Thanh toán thành công từ App ví điện tử');
        resolve(true);
      }, 1500);
    });
  };

  const approveTransaction = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          return {
            ...t,
            status: 'success',
            completedAt: new Date().toLocaleString('vi-VN'),
            approvedBy: 'Quản trị viên (QTV) phê duyệt'
          };
        }
        return t;
      })
    );

    const txn = transactions.find(t => t.id === transactionId);
    if (txn) {
      const days = txn.planId === 'plan-cosmos' ? 365 : txn.planId === 'plan-comet' ? 30 : 90;
      const currentExpire = currentUser.vipExpiresAt ? new Date(currentUser.vipExpiresAt) : new Date();
      const newExpire = new Date(Math.max(Date.now(), currentExpire.getTime()) + days * 24 * 60 * 60 * 1000);

      setCurrentUser(prev => ({
        ...prev,
        vipTier: 'vip',
        vipExpiresAt: newExpire.toISOString()
      }));

      setUserGameStats(gs => ({
        ...gs,
        combatPower: gs.combatPower + 1500
      }));
    }

    addAuditLog('QTV_DUYỆT_THANH_TOÁN_QR', `Giao dịch ${transactionId}`, `Phê duyệt kích hoạt VIP thủ công`);
  };

  const rejectTransaction = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, status: 'failed', approvedBy: 'QTV Từ chối (Lý do: Không nhận được tiền)' } : t))
    );
    addAuditLog('QTV_TỪ_CHỐI_GIAO_DỊCH', `Giao dịch ${transactionId}`, 'Từ chối giao dịch');
  };

  // Gamification Actions
  const claimQuestReward = (questId: string) => {
    const q = gameQuests.find(item => item.id === questId);
    if (!q || !q.completed || q.claimed) return;

    setGameQuests(prev =>
      prev.map(item => item.id === questId ? { ...item, claimed: true } : item)
    );

    setUserGameStats(prev => {
      const newExp = prev.currentExp + 60;
      const levelUp = newExp >= prev.maxExp;
      return {
        ...prev,
        combatPower: prev.combatPower + q.rewardCP,
        crystals: prev.crystals + q.rewardCrystals,
        currentExp: levelUp ? newExp - prev.maxExp : newExp,
        level: levelUp ? prev.level + 1 : prev.level,
        dailyEnergy: Math.min(100, prev.dailyEnergy + 20)
      };
    });
  };

  const claimDailyEnergyChest = (chestPercent: number) => {
    if (userGameStats.claimedEnergyChests.includes(chestPercent) || userGameStats.dailyEnergy < chestPercent) {
      return;
    }
    const bonusCP = chestPercent * 6;
    const bonusCrystals = chestPercent / 2;

    setUserGameStats(prev => ({
      ...prev,
      combatPower: prev.combatPower + bonusCP,
      crystals: prev.crystals + bonusCrystals,
      claimedEnergyChests: [...prev.claimedEnergyChests, chestPercent]
    }));
  };

  const completePlanetStage = (stageId: string, stars: number, earnedCP: number) => {
    setPlanetStages(prev => {
      const idx = prev.findIndex(s => s.id === stageId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        isCompleted: true,
        starsEarned: Math.max(updated[idx].starsEarned, stars)
      };
      // Unlock next stage if exists
      if (idx + 1 < updated.length && updated[idx + 1].planetId === updated[idx].planetId) {
        updated[idx + 1] = { ...updated[idx + 1], isUnlocked: true };
      }
      return updated;
    });

    setUserGameStats(prev => ({
      ...prev,
      combatPower: prev.combatPower + earnedCP,
      crystals: prev.crystals + stars * 20
    }));
  };

  const claimPassReward = (level: number, isVip: boolean) => {
    setCelestialPassRewards(prev =>
      prev.map(item => {
        if (item.level === level) {
          if (isVip && currentUser.vipTier === 'vip') {
            return { ...item, vipClaimed: true };
          } else if (!isVip) {
            return { ...item, freeClaimed: true };
          }
        }
        return item;
      })
    );

    const target = celestialPassRewards.find(r => r.level === level);
    if (!target) return;
    const reward = isVip ? target.vipReward : target.freeReward;

    setUserGameStats(prev => ({
      ...prev,
      combatPower: prev.combatPower + reward.cp,
      crystals: prev.crystals + reward.crystals
    }));
  };

  const recordRankedMatchResult = (won: boolean, lpDelta: number, earnedCP: number, matchQuestions: number = 5) => {
    setUserGameStats(prev => {
      let newRP = won ? prev.rankPoints + lpDelta : Math.max(0, prev.rankPoints - Math.abs(lpDelta));
      let currentTier = prev.rankTier;
      let currentDiv = prev.rankDivision;

      // Promotion logic if RP reaches 100
      if (newRP >= 100) {
        newRP = 20; // reset to 20 LP in next division
        if (currentDiv > 1) {
          currentDiv = (currentDiv - 1) as 1 | 2 | 3 | 4;
        } else {
          // Promote to higher tier
          const tiersOrder: RankTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'challenger'];
          const curIndex = tiersOrder.indexOf(currentTier);
          if (curIndex !== -1 && curIndex < tiersOrder.length - 1) {
            currentTier = tiersOrder[curIndex + 1];
            currentDiv = 4;
          }
        }
      }

      const nextStreak = won ? prev.winStreak + 1 : 0;
      const nextExp = prev.currentExp + 80;
      const isLevelUp = nextExp >= prev.maxExp;

      return {
        ...prev,
        rankPoints: newRP,
        rankTier: currentTier,
        rankDivision: currentDiv,
        combatPower: prev.combatPower + earnedCP,
        crystals: prev.crystals + (won ? 40 : 15),
        winStreak: nextStreak,
        totalMatches: prev.totalMatches + 1,
        winCount: won ? prev.winCount + 1 : prev.winCount,
        currentExp: isLevelUp ? nextExp - prev.maxExp : nextExp,
        level: isLevelUp ? prev.level + 1 : prev.level,
        dailyEnergy: Math.min(100, prev.dailyEnergy + 25)
      };
    });

    // Advance daily quest for ranked match
    setGameQuests(quests => quests.map(q => {
      if (q.id === 'quest-d4') {
        return { ...q, currentProgress: 1, completed: true };
      }
      return q;
    }));
  };

  const requestRefund = (transactionId: string, reason: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === transactionId ? { ...t, refundReason: reason } : t)
    );
    addAuditLog('YÊU_CẦU_HOÀN_TIỀN', `Giao dịch ${transactionId}`, `Lý do: ${reason}`);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const updateStudyHours = (hours: number) => {
    setCurrentUser(prev => ({ ...prev, studyHoursPerDay: hours }));
  };

  // QTND actions
  const addOrUpdateLesson = (lesson: Lesson) => {
    setLessons(prev => {
      const idx = prev.findIndex(l => l.id === lesson.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = lesson;
        return copy;
      }
      return [lesson, ...prev];
    });
    addAuditLog('CẬP_NHẬT_BÀI_HỌC', `Bài học ${lesson.title}`, `Mức truy cập: ${lesson.accessTier}, Trạng thái: ${lesson.status}`);
  };

  const addOrUpdateQuestion = (q: Question) => {
    setQuestions(prev => {
      const idx = prev.findIndex(item => item.id === q.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = q;
        return copy;
      }
      return [q, ...prev];
    });
    addAuditLog('CẬP_NHẬT_CÂU_HỎI', `Câu hỏi ${q.id}`, `Chủ đề: ${q.topic}, Dạng: ${q.type}, Mức độ: ${q.level}`);
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    addAuditLog('XÓA_CÂU_HỎI', `Câu hỏi ${questionId}`, 'Xóa khỏi ngân hàng đề');
  };

  const addOrUpdateExam = (exam: Exam) => {
    setExams(prev => {
      const idx = prev.findIndex(e => e.id === exam.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = exam;
        return copy;
      }
      return [exam, ...prev];
    });
    addAuditLog('CẬP_NHẬT_ĐỀ_THI', `Đề ${exam.title}`, `Thời lượng: ${exam.durationMinutes} phút`);
  };

  const uploadRAGDoc = (doc: Partial<RAGDocument>) => {
    const newDoc: RAGDocument = {
      id: `rag-${Date.now()}`,
      title: doc.title || 'Tài liệu giáo dục mới',
      subjectId: doc.subjectId || 'toan',
      grade: doc.grade || 12,
      source: doc.source || 'Ban biên tập Scholyx',
      license: doc.license || 'Nội bộ',
      status: 'pending',
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      snippetCount: doc.snippetCount || 100,
      contentSnippet: doc.contentSnippet || 'Nội dung trích đoạn...'
    };
    setRagDocs(prev => [newDoc, ...prev]);
    addAuditLog('TẢI_LÊN_RAG_DOC', `Tài liệu: ${newDoc.title}`, 'Chờ kiểm duyệt');
  };

  const toggleRAGDocStatus = (id: string, status: 'approved' | 'revoked') => {
    setRagDocs(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    addAuditLog('ĐỔI_TRẠNG_THÁI_RAG', `Tài liệu ${id}`, `Chuyển sang: ${status}`);
  };

  const gradeEssay = (submissionId: string, score: number, feedback: string) => {
    setExamSubmissions(prev =>
      prev.map(s => s.id === submissionId ? {
        ...s,
        essayStatus: 'graded',
        essayGrade: score,
        essayFeedback: feedback,
        score: Math.min(10, s.score + score)
      } : s)
    );
    addAuditLog('CHẤM_BÀI_TỰ_LUẬN', `Bài làm ${submissionId}`, `Điểm: ${score}, Nhận xét: ${feedback}`);
  };

  const regradeExam = (submissionId: string, newScore: number, reason: string) => {
    setExamSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, score: newScore } : s)
    );
    addAuditLog('CHẤM_LẠI_ĐIỂM_THI', `Bài làm ${submissionId}`, `Điểm mới: ${newScore}, Lý do: ${reason}`);
  };

  const replyFeedback = (id: string, response: string) => {
    setFeedbacks(prev =>
      prev.map(f => f.id === id ? { ...f, status: 'resolved', response } : f)
    );
  };

  // QTV actions
  const lockUnlockUser = (userId: string, reason: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'locked' ? 'active' : 'locked';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    addAuditLog('KHÓA_MỞ_KHÓA_TÀI_KHOẢN', `Tài khoản: ${userId}`, `Lý do: ${reason}`);
  };

  const resetUserPassword = (userId: string) => {
    addAuditLog('GỬI_LINK_ĐẶT_LẠI_MẬT_KHẨU', `Tài khoản: ${userId}`, 'Gửi OTP / Email khôi phục');
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'disabled' } : u));
    addAuditLog('VÔ_HIỆU_HÓA_TÀI_KHOẢN', `Tài khoản: ${userId}`, 'Xóa mềm tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025');
  };

  const updateSystemConfig = (updates: Partial<SystemConfig>) => {
    setSystemConfig(prev => ({ ...prev, ...updates }));
    addAuditLog('CẬP_NHẬT_CẤU_HÌNH_HỆ_THỐNG', 'SystemConfig', JSON.stringify(updates));
  };

  const manualGrantVIP = (userId: string, days: number, reason: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const currentExpire = u.vipExpiresAt ? new Date(u.vipExpiresAt) : new Date();
          const newExpire = new Date(Math.max(Date.now(), currentExpire.getTime()) + days * 24 * 60 * 60 * 1000);
          return { ...u, vipTier: 'vip', vipExpiresAt: newExpire.toISOString() };
        }
        return u;
      })
    );
    if (currentUser.id === userId) {
      const currentExpire = currentUser.vipExpiresAt ? new Date(currentUser.vipExpiresAt) : new Date();
      const newExpire = new Date(Math.max(Date.now(), currentExpire.getTime()) + days * 24 * 60 * 60 * 1000);
      setCurrentUser(prev => ({ ...prev, vipTier: 'vip', vipExpiresAt: newExpire.toISOString() }));
    }
    addAuditLog('CẤP_VIP_THỦ_CÔNG', `Tài khoản: ${userId}`, `Cấp ${days} ngày. Lý do: ${reason}`);
  };

  const approveRefund = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === transactionId ? { ...t, status: 'refunded' } : t)
    );
    addAuditLog('DUYỆT_HOÀN_TIỀN', `Giao dịch: ${transactionId}`, 'Thu hồi VIP tương ứng');
  };

  const rejectRefund = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === transactionId ? { ...t, refundReason: undefined } : t)
    );
    addAuditLog('TỪ_CHỐI_HOÀN_TIỀN', `Giao dịch: ${transactionId}`, 'Yêu cầu không đủ điều kiện');
  };

  const addAuditLog = (action: string, target: string, details: string) => {
    const log: AuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      targetObject: target,
      details,
      ipAddress: '113.190.24.11',
      timestamp: new Date().toLocaleString('vi-VN')
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const submitFeedback = (type: 'question_error' | 'lesson_error' | 'general', content: string, relatedId?: string) => {
    const fb: FeedbackReport = {
      id: `FB-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser.id,
      type,
      relatedId,
      content,
      status: 'new',
      createdAt: new Date().toLocaleString('vi-VN')
    };
    setFeedbacks(prev => [fb, ...prev]);
  };

  const maxAIDailyUsage = currentUser.vipTier === 'vip' ? systemConfig.maxVIPAIQueriesDaily : systemConfig.maxFreeAIQueriesDaily;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        users,
        subjects,
        chapters,
        lessons,
        questions,
        exams,
        ragDocs,
        completedLessonIds,
        favoriteLessonIds,
        lessonNotes,
        mistakeItems,
        examSubmissions,
        weakTopics,
        weeklyPlan,
        aiMessages,
        aiDailyUsage,
        maxAIDailyUsage,
        transactions,
        auditLogs,
        feedbacks,
        systemConfig,
        activeNavTab,
        setActiveNavTab,
        activeScreenId,
        navigateTo,
        screenParams,
        isSidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        isSearchPaletteOpen,
        setSearchPaletteOpen,
        activeLessonId,
        setActiveLessonId,
        activeExamId,
        setActiveExamId,
        // Demo Authentication & Pending Registration (Requirement 4)
        pendingRegistration,
        setPendingRegistration,
        completeRegistrationWithOtp,
        loginWithCredentials,
        // Active Session Persistence (Requirement 5)
        activeExamSession,
        setActiveExamSession,
        clearActiveExamSession,
        activePracticeSession,
        setActivePracticeSession,
        clearActivePracticeSession,
        // Gamification & Ranked Arena
        userGameStats,
        gameQuests,
        planetStages,
        celestialPassRewards,
        leaderboard,
        claimQuestReward,
        claimDailyEnergyChest,
        completePlanetStage,
        claimPassReward,
        recordRankedMatchResult,
        createPendingQRTransaction,
        simulateScanAndPay,
        approveTransaction,
        rejectTransaction,

        toggleLessonCompleted,
        toggleLessonFavorite,
        saveLessonNote,
        submitExamOrPractice,
        resolveMistake,
        sendAIMessage,
        rateAIMessage,
        reportAIMessage,
        clearAIChat,
        purchaseVIP,
        requestRefund,
        updateProfile,
        toggleTaskCompletion,
        updateStudyHours,
        addOrUpdateLesson,
        addOrUpdateQuestion,
        deleteQuestion,
        addOrUpdateExam,
        uploadRAGDoc,
        toggleRAGDocStatus,
        gradeEssay,
        regradeExam,
        replyFeedback,
        lockUnlockUser,
        resetUserPassword,
        deleteUser,
        updateSystemConfig,
        manualGrantVIP,
        approveRefund,
        rejectRefund,
        addAuditLog,
        submitFeedback
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
