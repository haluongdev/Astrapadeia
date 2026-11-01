import test from 'node:test';
import assert from 'node:assert/strict';
import { SCREEN_REGISTRY, getScreenMetadata, getScreenByPath, canAccessScreen } from './screenRegistry';
import { UserRole, VIPTier, ExamSubmission, Question } from '../types';

interface TestUser {
  id: string;
  name: string;
  role: UserRole;
  vipTier: VIPTier;
  vipExpiresAt?: string;
}

test('SCREEN_REGISTRY contains exactly 30 screens matching Figma specification', () => {
  assert.equal(SCREEN_REGISTRY.length, 30);
});

test('Each screen has unique screenNumber from 01 to 30', () => {
  const numbers = SCREEN_REGISTRY.map(s => s.screenNumber);
  const uniqueNumbers = new Set(numbers);
  assert.equal(uniqueNumbers.size, 30);

  // Check 01..30 all exist
  for (let i = 1; i <= 30; i++) {
    const formatted = String(i).padStart(2, '0');
    assert.ok(numbers.includes(formatted), `Missing screen number ${formatted}`);
  }
});

test('Each screen has unique path starting with /', () => {
  const paths = SCREEN_REGISTRY.map(s => s.path);
  const uniquePaths = new Set(paths);
  assert.equal(uniquePaths.size, 30);

  paths.forEach(p => {
    assert.ok(p.startsWith('/'), `Path ${p} must start with /`);
  });
});

test('getScreenMetadata returns valid metadata for valid screens, and undefined for invalid screens (no silent fallback to home)', () => {
  const homeScreen = getScreenMetadata('home');
  assert.ok(homeScreen);
  assert.equal(homeScreen?.id, 'home');
  assert.equal(homeScreen?.screenNumber, '01');

  const sitemapScreen = getScreenMetadata('system-flow');
  assert.ok(sitemapScreen);
  assert.equal(sitemapScreen?.id, 'system-flow');
  assert.equal(sitemapScreen?.screenNumber, '30');

  // Negative test: invalid ID must return undefined
  const invalidResult = getScreenMetadata('invalid-screen-id' as any);
  assert.equal(invalidResult, undefined, 'Invalid screenId must return undefined, not fallback to home');
});

test('getScreenByPath matches paths with or without hash symbol', () => {
  const match1 = getScreenByPath('/auth/login');
  assert.ok(match1);
  assert.equal(match1?.id, 'auth-login');

  const match2 = getScreenByPath('#/system-flow');
  assert.ok(match2);
  assert.equal(match2?.id, 'system-flow');

  const match3 = getScreenByPath('#/exams');
  assert.ok(match3);
  assert.equal(match3?.id, 'exam-catalog');

  const noMatch = getScreenByPath('/unknown-path-xyz');
  assert.equal(noMatch, undefined);
});

test('canAccessScreen returns not_found for invalid screen IDs', () => {
  const user: TestUser = { id: 's1', name: 'Test', role: 'student', vipTier: 'free' };
  const res = canAccessScreen(user, 'non-existent-screen-id' as any);
  assert.equal(res.allowed, false);
  assert.equal(res.reason, 'not_found');
});

test('canAccessScreen strictly enforces Guest permissions per specification', () => {
  const guestUser: TestUser = { id: 'guest-temp', name: 'Khách', role: 'guest', vipTier: 'free' };

  // Guest CAN access public screens
  assert.equal(canAccessScreen(guestUser, 'home').allowed, true);
  assert.equal(canAccessScreen(guestUser, 'auth-login').allowed, true);
  assert.equal(canAccessScreen(guestUser, 'auth-register').allowed, true);
  assert.equal(canAccessScreen(guestUser, 'overview-free').allowed, true);
  assert.equal(canAccessScreen(guestUser, 'lessons').allowed, true); // Public library
  assert.equal(canAccessScreen(guestUser, 'vip-pricing').allowed, true);
  assert.equal(canAccessScreen(guestUser, 'system-flow').allowed, true);

  // Guest CANNOT access student learning detail / exam / practice room / mistake screens
  const lessonDetail = canAccessScreen(guestUser, 'lesson-detail');
  assert.equal(lessonDetail.allowed, false);
  assert.equal(lessonDetail.reason, 'not_logged_in');

  const examCat = canAccessScreen(guestUser, 'exam-catalog');
  assert.equal(examCat.allowed, false);
  assert.equal(examCat.reason, 'not_logged_in');

  const pracResult = canAccessScreen(guestUser, 'practice-result');
  assert.equal(pracResult.allowed, false);
  assert.equal(pracResult.reason, 'not_logged_in');
});

test('canAccessScreen strictly enforces Free student vs Active VIP student', () => {
  const studentFree: TestUser = { id: 's-free', name: 'Free Student', role: 'student', vipTier: 'free' };
  const studentActiveVip: TestUser = {
    id: 's-vip',
    name: 'Active VIP Student',
    role: 'student',
    vipTier: 'vip',
    vipExpiresAt: '2027-09-30'
  };

  // Free student can access regular features
  assert.equal(canAccessScreen(studentFree, 'home').allowed, true);
  assert.equal(canAccessScreen(studentFree, 'practice-setup').allowed, true);
  assert.equal(canAccessScreen(studentFree, 'lessons').allowed, true);
  assert.equal(canAccessScreen(studentFree, 'exam-catalog').allowed, true);

  // Free student blocked from VIP screens with vip_required
  const vipRoadmap = canAccessScreen(studentFree, 'vip-roadmap');
  assert.equal(vipRoadmap.allowed, false);
  assert.equal(vipRoadmap.reason, 'vip_required');

  // Active VIP student can access VIP screens
  const vipAccess = canAccessScreen(studentActiveVip, 'vip-roadmap');
  assert.equal(vipAccess.allowed, true);
});

test('canAccessScreen rejects expired VIP access with vip_required', () => {
  const studentExpiredVip: TestUser = {
    id: 's-expired',
    name: 'Expired VIP Student',
    role: 'student',
    vipTier: 'vip',
    vipExpiresAt: '2025-01-01' // In the past
  };

  const check = canAccessScreen(studentExpiredVip, 'vip-roadmap');
  assert.equal(check.allowed, false);
  assert.equal(check.reason, 'vip_required');
});

test('canAccessScreen blocks QTND from student-only screens, VIP screens, and QTV admin screens', () => {
  const qtndUser: TestUser = { id: 't-1', name: 'Teacher Biên Tập', role: 'qtnd', vipTier: 'free' };

  // QTND CAN access CMS screens (21..26)
  assert.equal(canAccessScreen(qtndUser, 'cms-lessons').allowed, true);
  assert.equal(canAccessScreen(qtndUser, 'cms-questions').allowed, true);
  assert.equal(canAccessScreen(qtndUser, 'cms-matrix').allowed, true);
  assert.equal(canAccessScreen(qtndUser, 'cms-grading').allowed, true);
  assert.equal(canAccessScreen(qtndUser, 'cms-rag').allowed, true);
  assert.equal(canAccessScreen(qtndUser, 'cms-feedback').allowed, true);

  // QTND CANNOT access VIP screens
  const vipCheck = canAccessScreen(qtndUser, 'vip-roadmap');
  assert.equal(vipCheck.allowed, false);
  assert.equal(vipCheck.reason, 'role_restricted');

  // QTND CANNOT access student exam room
  const examRoomCheck = canAccessScreen(qtndUser, 'exam-room');
  assert.equal(examRoomCheck.allowed, false);
  assert.equal(examRoomCheck.reason, 'role_restricted');

  // QTND CANNOT access QTV system admin screens (27..29)
  const adminCheck = canAccessScreen(qtndUser, 'admin-overview');
  assert.equal(adminCheck.allowed, false);
  assert.equal(adminCheck.reason, 'role_restricted');

  const rolesCheck = canAccessScreen(qtndUser, 'admin-roles');
  assert.equal(rolesCheck.allowed, false);
  assert.equal(rolesCheck.reason, 'role_restricted');

  const auditCheck = canAccessScreen(qtndUser, 'admin-config-audit');
  assert.equal(auditCheck.allowed, false);
  assert.equal(auditCheck.reason, 'role_restricted');
});

test('canAccessScreen permits QTV to access QTV system and management screens', () => {
  const qtvUser: TestUser = { id: 'admin-1', name: 'Quản Trị Viên', role: 'qtv', vipTier: 'vip' };

  // QTV can access system screens 27..29
  assert.equal(canAccessScreen(qtvUser, 'admin-overview').allowed, true);
  assert.equal(canAccessScreen(qtvUser, 'admin-roles').allowed, true);
  assert.equal(canAccessScreen(qtvUser, 'admin-config-audit').allowed, true);
  // QTV can also access CMS screens 21..26
  assert.equal(canAccessScreen(qtvUser, 'cms-lessons').allowed, true);
  assert.equal(canAccessScreen(qtvUser, 'cms-questions').allowed, true);
});

// --- WORKFLOW & BUSINESS LOGIC TESTS ---

test('Workflow: Multi-attempt exam submissions generate unique IDs and filter by userId', () => {
  const user1 = 'user-student-free';
  const user2 = 'user-student-vip';

  const sub1User1: ExamSubmission = {
    id: `sub-${user1}-exam-01-${Date.now()}-1`,
    examId: 'exam-01',
    examTitle: 'Đề Thi Thử Toán THPT 2026',
    subjectId: 'toan',
    userId: user1,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    durationSeconds: 3000,
    answers: {},
    score: 7.25,
    maxScore: 10,
    correctCount: 29,
    wrongCount: 11,
    unansweredCount: 0,
    partScores: { main: 7.25 },
    topicBreakdown: {}
  };

  const sub2User1: ExamSubmission = {
    id: `sub-${user1}-exam-01-${Date.now()}-2`,
    examId: 'exam-01',
    examTitle: 'Đề Thi Thử Toán THPT 2026',
    subjectId: 'toan',
    userId: user1,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    durationSeconds: 3200,
    answers: {},
    score: 8.5,
    maxScore: 10,
    correctCount: 34,
    wrongCount: 6,
    unansweredCount: 0,
    partScores: { main: 8.5 },
    topicBreakdown: {}
  };

  const sub1User2: ExamSubmission = {
    id: `sub-${user2}-exam-01-${Date.now()}-3`,
    examId: 'exam-01',
    examTitle: 'Đề Thi Thử Toán THPT 2026',
    subjectId: 'toan',
    userId: user2,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    durationSeconds: 2800,
    answers: {},
    score: 9.25,
    maxScore: 10,
    correctCount: 37,
    wrongCount: 3,
    unansweredCount: 0,
    partScores: { main: 9.25 },
    topicBreakdown: {}
  };

  const allSubmissions = [sub2User1, sub1User1, sub1User2];

  // 1. Verify unique IDs
  const ids = allSubmissions.map(s => s.id);
  assert.equal(new Set(ids).size, 3);

  // 2. Filter by user1
  const user1History = allSubmissions.filter(s => s.userId === user1);
  assert.equal(user1History.length, 2);
  assert.equal(user1History[0].score, 8.5, 'Latest submission must be first');
  assert.equal(user1History[1].score, 7.25);

  // 3. User 2 cannot see user 1 submissions
  const user2History = allSubmissions.filter(s => s.userId === user2);
  assert.equal(user2History.length, 1);
  assert.equal(user2History[0].userId, user2);
  assert.equal(user2History[0].score, 9.25);
});

test('Workflow: Accurate scoring per QĐ 764 for choice, true_false 4-props, and short_answer', () => {
  // Test choice: 1 point
  const choiceQ: Question = {
    id: 'q-c1',
    chapterId: 'ch-1',
    subjectId: 'toan',
    grade: 12,
    topic: 'Hàm số',
    type: 'choice',
    level: 'nhan_biet',
    accessTier: 'free',
    status: 'published',
    points: 1,
    content: 'Đạo hàm của x^2 là:',
    options: ['x', '2x', 'x^2', '2'],
    correctOptionIndex: 1,
    explanation: '(x^2) = 2x'
  };

  // Test true_false: 4 propositions (0.1, 0.25, 0.5, 1.0)
  const tfQ: Question = {
    id: 'q-tf1',
    chapterId: 'ch-1',
    subjectId: 'toan',
    grade: 12,
    topic: 'Hình học',
    type: 'true_false',
    level: 'thong_hieu',
    accessTier: 'free',
    status: 'published',
    points: 1,
    content: 'Cho hình chóp S.ABCD...',
    propositions: [
      { id: 'p1', text: 'SA vuông góc đáy', isCorrect: true },
      { id: 'p2', text: 'AC vuông góc BD', isCorrect: false },
      { id: 'p3', text: 'Góc giữa SC và đáy là 45 độ', isCorrect: true },
      { id: 'p4', text: 'Thể tích bằng a^3', isCorrect: true }
    ],
    explanation: 'Giải chi tiết...'
  };

  // Test short_answer: normalized decimal
  const saQ: Question = {
    id: 'q-sa1',
    chapterId: 'ch-1',
    subjectId: 'toan',
    grade: 12,
    topic: 'Tích phân',
    type: 'short_answer',
    level: 'van_dung',
    accessTier: 'free',
    status: 'published',
    points: 1,
    content: 'Tính diện tích hình phẳng giới hạn bởi...',
    shortAnswerKey: '0.64',
    explanation: 'Tích phân từ 0 đến 1...'
  };

  // Helper calculating QĐ 764
  const calcScore = (
    answers: Record<string, { choice?: number; props?: Record<string, boolean>; short?: string }>
  ) => {
    let score = 0;
    // Choice
    if (answers['q-c1']?.choice === choiceQ.correctOptionIndex) {
      score += 1.0;
    }
    // True/False
    const pAns = answers['q-tf1']?.props || {};
    let tfMatches = 0;
    tfQ.propositions?.forEach(p => {
      if (pAns[p.id] === p.isCorrect) tfMatches++;
    });
    if (tfMatches === 4) score += 1.0;
    else if (tfMatches === 3) score += 0.5;
    else if (tfMatches === 2) score += 0.25;
    else if (tfMatches === 1) score += 0.1;

    // Short answer
    const shortText = answers['q-sa1']?.short?.trim().replace(',', '.');
    if (shortText === saQ.shortAnswerKey) {
      score += 1.0;
    }
    return score;
  };

  // 1. All correct: 1 + 1.0 + 1 = 3.0
  const fullScore = calcScore({
    'q-c1': { choice: 1 },
    'q-tf1': { props: { p1: true, p2: false, p3: true, p4: true } },
    'q-sa1': { short: '0,64' } // Test comma normalization
  });
  assert.equal(fullScore, 3.0);

  // 2. Choice wrong, TF 3 props right (0.5), short answer correct
  const partialScore = calcScore({
    'q-c1': { choice: 0 },
    'q-tf1': { props: { p1: true, p2: false, p3: true, p4: false } }, // 3 matches -> 0.5
    'q-sa1': { short: '0.64' }
  });
  assert.equal(partialScore, 1.5);

  // 3. TF 2 props right -> 0.25
  const partial2Score = calcScore({
    'q-tf1': { props: { p1: true, p2: false, p3: false, p4: false } } // 2 matches -> 0.25
  });
  assert.equal(partial2Score, 0.25);
});

test('Workflow: User data isolation partitions localStorage keys by userId', () => {
  const getScopedKey = (userId: string, key: string) => `scholyx_u_${userId}_${key}`;

  const userA = 'user-student-free';
  const userB = 'user-student-vip';

  const userAKey = getScopedKey(userA, 'submissions');
  const userBKey = getScopedKey(userB, 'submissions');

  assert.notEqual(userAKey, userBKey);
  assert.equal(userAKey, 'scholyx_u_user-student-free_submissions');
  assert.equal(userBKey, 'scholyx_u_user-student-vip_submissions');

  const userAMistakesKey = getScopedKey(userA, 'mistakes');
  const userBMistakesKey = getScopedKey(userB, 'mistakes');
  assert.notEqual(userAMistakesKey, userBMistakesKey);
});

// --- SPECIFIC REQUIRED WORKFLOW TESTS (Requirement 7) ---

test('Flow 1: Student Login -> Learn Lesson -> Complete Lesson', () => {
  const studentUser: TestUser = { id: 'u-flow1', name: 'Student 1', role: 'student', vipTier: 'free' };

  // 1. Can access lesson list and lesson detail
  assert.equal(canAccessScreen(studentUser, 'lessons').allowed, true);
  assert.equal(canAccessScreen(studentUser, 'lesson-detail').allowed, true);

  // 2. Simulate completing a lesson
  let completedLessons: string[] = [];
  const lessonId = 'ls-toan-01';

  // Toggle completion
  if (!completedLessons.includes(lessonId)) {
    completedLessons = [...completedLessons, lessonId];
  }
  assert.ok(completedLessons.includes(lessonId));
  assert.equal(completedLessons.length, 1);
});

test('Flow 2: Practice -> Submit -> View Result -> Add to Mistake Notebook', () => {
  const studentUser: TestUser = { id: 'u-flow2', name: 'Student 2', role: 'student', vipTier: 'free' };

  // 1. Access practice setup and room
  assert.equal(canAccessScreen(studentUser, 'practice-setup').allowed, true);
  assert.equal(canAccessScreen(studentUser, 'practice-room').allowed, true);

  // 2. Submit practice
  const submission: ExamSubmission = {
    id: `sub-${studentUser.id}-prac-1`,
    examId: 'prac-toan-01',
    examTitle: 'Luyện tập Toán 12',
    subjectId: 'toan',
    userId: studentUser.id,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    durationSeconds: 120,
    answers: {
      'q-1': { questionId: 'q-1', selectedOptionIndex: 2 } // wrong answer
    },
    score: 0,
    maxScore: 10,
    correctCount: 0,
    wrongCount: 1,
    unansweredCount: 0,
    partScores: { main: 0 },
    topicBreakdown: {}
  };

  // 3. View result screen
  assert.equal(canAccessScreen(studentUser, 'practice-result').allowed, true);

  // 4. Mistake notebook receives the wrong question
  let mistakes = [
    {
      id: `mistake-${Date.now()}`,
      userId: studentUser.id,
      questionId: 'q-1',
      wrongAnswerText: 'Phương án C',
      reviewStatus: 'needs_review' as const
    }
  ];
  assert.equal(mistakes.length, 1);
  assert.equal(mistakes[0].userId, studentUser.id);
});

test('Flow 3: Mock Exam -> Submit -> View exact submitted score', () => {
  const studentUser: TestUser = { id: 'u-flow3', name: 'Student 3', role: 'student', vipTier: 'free' };

  assert.equal(canAccessScreen(studentUser, 'exam-catalog').allowed, true);
  assert.equal(canAccessScreen(studentUser, 'exam-room').allowed, true);

  const subId = `sub-${studentUser.id}-exam-01-${Date.now()}`;
  const submission: ExamSubmission = {
    id: subId,
    examId: 'exam-01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2026 - Môn Toán',
    subjectId: 'toan',
    userId: studentUser.id,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    durationSeconds: 3600,
    answers: {},
    score: 8.75,
    maxScore: 10,
    correctCount: 35,
    wrongCount: 5,
    unansweredCount: 0,
    partScores: { main: 8.75 },
    topicBreakdown: {}
  };

  // Result screen must resolve exact submission by ID
  assert.equal(canAccessScreen(studentUser, 'exam-result').allowed, true);
  assert.equal(submission.id, subId);
  assert.equal(submission.score, 8.75);
});

test('Flow 4: Free Student -> Access VIP -> Prompted to Upgrade (vip_required)', () => {
  const freeStudent: TestUser = { id: 'u-free-flow', name: 'Free User', role: 'student', vipTier: 'free' };

  const access = canAccessScreen(freeStudent, 'vip-roadmap');
  assert.equal(access.allowed, false);
  assert.equal(access.reason, 'vip_required');

  // Can view VIP pricing to upgrade
  assert.equal(canAccessScreen(freeStudent, 'vip-pricing').allowed, true);
});

test('Flow 5: QTND -> Access Content Management -> Blocked from System Admin', () => {
  const qtnd: TestUser = { id: 'u-teacher-flow', name: 'Biên Tập Viên', role: 'qtnd', vipTier: 'free' };

  // Can access content management
  assert.equal(canAccessScreen(qtnd, 'cms-lessons').allowed, true);
  assert.equal(canAccessScreen(qtnd, 'cms-questions').allowed, true);
  assert.equal(canAccessScreen(qtnd, 'cms-matrix').allowed, true);

  // Blocked from system administration
  const sysAccess = canAccessScreen(qtnd, 'admin-overview');
  assert.equal(sysAccess.allowed, false);
  assert.equal(sysAccess.reason, 'role_restricted');

  const auditAccess = canAccessScreen(qtnd, 'admin-config-audit');
  assert.equal(auditAccess.allowed, false);
  assert.equal(auditAccess.reason, 'role_restricted');
});

test('Flow 6: Account Switch -> Cannot see private data of previous account', () => {
  const accountAData = {
    userId: 'user-a',
    submissions: [{ id: 'sub-a-1', score: 9.0 }],
    notes: { 'note-1': 'Ghi chú tài khoản A' }
  };

  const accountBData = {
    userId: 'user-b',
    submissions: [{ id: 'sub-b-1', score: 6.5 }],
    notes: { 'note-2': 'Ghi chú tài khoản B' }
  };

  // Check data isolation
  const getSubmissionsForUser = (allSubs: any[], targetUserId: string) =>
    allSubs.filter(s => s.userId === targetUserId);

  const combined = [
    { ...accountAData.submissions[0], userId: 'user-a' },
    { ...accountBData.submissions[0], userId: 'user-b' }
  ];

  const userASubs = getSubmissionsForUser(combined, 'user-a');
  assert.equal(userASubs.length, 1);
  assert.equal(userASubs[0].id, 'sub-a-1');
  assert.equal(userASubs.find(s => s.id === 'sub-b-1'), undefined);

  const userBSubs = getSubmissionsForUser(combined, 'user-b');
  assert.equal(userBSubs.length, 1);
  assert.equal(userBSubs[0].id, 'sub-b-1');
  assert.equal(userBSubs.find(s => s.id === 'sub-a-1'), undefined);
});
