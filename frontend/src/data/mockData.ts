import {
  Subject,
  Chapter,
  Lesson,
  Question,
  Exam,
  VIPPlan,
  RAGDocument,
  UserProfile,
  Transaction,
  AuditLog,
  FeedbackReport,
  LeaderboardEntry,
  GameQuest,
  Achievement,
  UserGameStats,
  PlanetStage,
  CelestialPassReward,
  RankedOpponent,
  RankTier
} from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'toan',
    name: 'Toán Học',
    code: 'MATH',
    icon: 'Calculator',
    color: 'from-blue-500 to-indigo-600',
    isCompulsory: true,
    description: 'Ứng dụng đạo hàm, tích phân, hình học Oxyz, xác suất có điều kiện'
  },
  {
    id: 'van',
    name: 'Ngữ Văn',
    code: 'LIT',
    icon: 'BookOpen',
    color: 'from-amber-500 to-rose-600',
    isCompulsory: true,
    description: 'Đọc hiểu văn bản hiện đại, nghị luận xã hội và nghị luận văn học 2018'
  },
  {
    id: 'ly',
    name: 'Vật Lí',
    code: 'PHYS',
    icon: 'Atom',
    color: 'from-cyan-400 to-blue-600',
    isCompulsory: false,
    description: 'Dao động cơ, sóng cơ, từ trường, vật lý hạt nhân và thực nghiệm'
  },
  {
    id: 'hoa',
    name: 'Hóa Học',
    code: 'CHEM',
    icon: 'FlaskConical',
    color: 'from-emerald-400 to-teal-600',
    isCompulsory: false,
    description: 'Ester - Lipid, Carbohydrate, Kim loại chuyển tiếp và hóa học đời sống'
  },
  {
    id: 'anh',
    name: 'Tiếng Anh',
    code: 'ENG',
    icon: 'Languages',
    color: 'from-purple-400 to-indigo-600',
    isCompulsory: false,
    description: 'Ngữ âm, trọng âm, điền từ đoạn văn, đọc hiểu và viết lại câu'
  },
  {
    id: 'sinh',
    name: 'Sinh Học',
    code: 'BIO',
    icon: 'Dna',
    color: 'from-green-500 to-emerald-700',
    isCompulsory: false,
    description: 'Di truyền học phân tử, quy luật di truyền, tiến hóa và sinh thái'
  },
  {
    id: 'su',
    name: 'Lịch Sử',
    code: 'HIST',
    icon: 'Scroll',
    color: 'from-orange-500 to-red-600',
    isCompulsory: false,
    description: 'Lịch sử thế giới cận hiện đại, Cách mạng Việt Nam và hội nhập quốc tế'
  },
  {
    id: 'dia',
    name: 'Địa Lí',
    code: 'GEO',
    icon: 'Compass',
    color: 'from-teal-500 to-cyan-700',
    isCompulsory: false,
    description: 'Địa lí tự nhiên, địa lí kinh tế - xã hội Việt Nam và các vùng kinh tế'
  }
];

export const INITIAL_CHAPTERS: Chapter[] = [
  // Toán 12
  {
    id: 'chap-toan-1',
    subjectId: 'toan',
    grade: 12,
    title: 'Chương I: Ứng Dụng Đạo Hàm Khảo Sát & Vẽ Đồ Thị Hàm Số',
    order: 1,
    description: 'Tính đơn điệu, cực trị, giá trị lớn nhất - nhỏ nhất, tiệm cận và đồ thị'
  },
  {
    id: 'chap-toan-2',
    subjectId: 'toan',
    grade: 12,
    title: 'Chương II: Toạ Độ Không Gian Oxyz & Véctơ',
    order: 2,
    description: 'Véctơ trong không gian, hệ toạ độ Oxyz, phương trình mặt phẳng, đường thẳng'
  },
  {
    id: 'chap-toan-3',
    subjectId: 'toan',
    grade: 12,
    title: 'Chương III: Nguyên Hàm, Tích Phân & Ứng Dụng',
    order: 3,
    description: 'Định nghĩa, tính chất, phương pháp đổi biến, từng phần, diện tích và thể tích'
  },
  {
    id: 'chap-toan-4',
    subjectId: 'toan',
    grade: 12,
    title: 'Chương IV: Xác Suất Có Điều Kiện & Biến Cố Độc Lập',
    order: 4,
    description: 'Công thức nhân xác suất, xác suất có điều kiện, công thức xác suất toàn phần'
  },
  // Vật lí 12
  {
    id: 'chap-ly-1',
    subjectId: 'ly',
    grade: 12,
    title: 'Chương I: Vật Lí Nhiệt & Động Học Phân Tử',
    order: 1,
    description: 'Mô hình động học phân tử, nhiệt dung riêng, nhiệt hóa hơi, nguyên lý nhiệt động học'
  },
  {
    id: 'chap-ly-2',
    subjectId: 'ly',
    grade: 12,
    title: 'Chương II: Khí Lí Tưởng & Các Định Luật Khí',
    order: 2,
    description: 'Phương trình trạng thái khí lí tưởng, định luật Boyle, Charles'
  },
  {
    id: 'chap-ly-3',
    subjectId: 'ly',
    grade: 12,
    title: 'Chương III: Từ Trường & Cảm Ứng Điện Từ',
    order: 3,
    description: 'Lực từ, cảm ứng từ, hiện tượng tự cảm, sóng điện từ'
  },
  // Hóa 12
  {
    id: 'chap-hoa-1',
    subjectId: 'hoa',
    grade: 12,
    title: 'Chương I: Ester - Lipid & Chất Giặt Rửa',
    order: 1,
    description: 'Đồng phân danh pháp ester, phản ứng xà phòng hóa, chất béo'
  },
  {
    id: 'chap-hoa-2',
    subjectId: 'hoa',
    grade: 12,
    title: 'Chương II: Carbohydrate',
    order: 2,
    description: 'Glucose, Fructose, Saccharose, Tinh bột và Cellulose'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'les-toan-1',
    chapterId: 'chap-toan-1',
    subjectId: 'toan',
    grade: 12,
    title: 'Bài 1: Tính đơn điệu và dấu của đạo hàm cấp một',
    accessTier: 'public',
    status: 'published',
    order: 1,
    summary: 'Quy tắc xét tính đồng biến, nghịch biến của hàm số trên các khoảng xác định qua đạo hàm f\'(x).',
    keyFormulas: [
      'f\'(x) ≥ 0, ∀x ∈ K và dấu "=" chỉ xảy ra tại hữu hạn điểm ⟺ f(x) đồng biến trên K',
      'f\'(x) ≤ 0, ∀x ∈ K và dấu "=" chỉ xảy ra tại hữu hạn điểm ⟺ f(x) nghịch biến trên K'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `### 1. Khái niệm hàm số đồng biến và nghịch biến
Cho hàm số $y = f(x)$ xác định trên khoảng $K$.
- Hàm số gọi là **đồng biến** (tăng) trên $K$ nếu:
  $\\forall x_1, x_2 \\in K, x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)$.
- Hàm số gọi là **nghịch biến** (giảm) trên $K$ nếu:
  $\\forall x_1, x_2 \\in K, x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$.

### 2. Định lí về dấu của đạo hàm
Giả sử hàm số $y = f(x)$ có đạo hàm trên khoảng $K$:
- Nếu $f'(x) > 0$ với mọi $x \\in K$ thì hàm số $f(x)$ đồng biến trên $K$.
- Nếu $f'(x) < 0$ với mọi $x \\in K$ thì hàm số $f(x)$ nghịch biến trên $K$.
- Nếu $f'(x) = 0$ với mọi $x \\in K$ thì $f(x)$ là hàm không đổi (hằng số) trên $K$.

### 3. Ví dụ vận dụng thực tế
Tìm các khoảng đồng biến của hàm số $y = x^3 - 3x^2 + 2$:
1. $y' = 3x^2 - 6x = 3x(x - 2)$.
2. Cho $y' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$.
3. Bảng xét dấu cho thấy $y' > 0$ trên $(-\\infty; 0)$ và $(2; +\\infty)$.
Vậy hàm số đồng biến trên hai khoảng $(-\\infty; 0)$ và $(2; +\\infty)$.`,
    createdAt: '2025-09-01'
  },
  {
    id: 'les-toan-2',
    chapterId: 'chap-toan-1',
    subjectId: 'toan',
    grade: 12,
    title: 'Bài 2: Cực trị của hàm số và định lí Fermat',
    accessTier: 'free',
    status: 'published',
    order: 2,
    summary: 'Điều kiện cần và đủ để hàm số đạt cực đại, cực tiểu tại điểm x_0.',
    keyFormulas: [
      'f\'(x_0) = 0 và f\'(x) đổi dấu từ dương sang âm qua x_0 ⟺ Cực đại',
      'f\'(x_0) = 0 và f\'(x) đổi dấu từ âm sang dương qua x_0 ⟺ Cực tiểu'
    ],
    content: `### 1. Định nghĩa cực trị
Điểm $x_0$ được gọi là điểm cực đại của hàm số $y = f(x)$ nếu tồn tại khoảng mở $(a; b)$ chứa $x_0$ sao cho $f(x) < f(x_0)$ với mọi $x \\in (a; b) \\setminus \\{x_0\\}$.
Giá trị $f(x_0)$ được gọi là **giá trị cực đại** của hàm số.

### 2. Quy tắc 1 tìm cực trị (dấu đạo hàm cấp 1)
- Bước 1: Tìm tập xác định, tính $f'(x)$.
- Bước 2: Tìm các điểm tới hạn (nghiệm của $f'(x) = 0$ hoặc nơi $f'(x)$ không xác định).
- Bước 3: Lập bảng biến thiên và kết luận.`,
    createdAt: '2025-09-03'
  },
  {
    id: 'les-toan-3',
    chapterId: 'chap-toan-2',
    subjectId: 'toan',
    grade: 12,
    title: 'Bài 3: Phương trình mặt phẳng trong không gian Oxyz',
    accessTier: 'vip',
    status: 'published',
    order: 1,
    summary: 'Véctơ pháp tuyến, phương trình tổng quát của mặt phẳng Ax + By + Cz + D = 0 và khoảng cách.',
    keyFormulas: [
      'Mặt phẳng (P) đi qua M_0(x_0, y_0, z_0) có VTPT n=(A, B, C): A(x - x_0) + B(y - y_0) + C(z - z_0) = 0',
      'd(M, (P)) = |Ax_M + By_M + Cz_M + D| / sqrt(A^2 + B^2 + C^2)'
    ],
    content: `### 1. Véctơ pháp tuyến của mặt phẳng
Véctơ $\\vec{n} \\neq \\vec{0}$ được gọi là véctơ pháp tuyến (VTPT) của mặt phẳng $(\\alpha)$ nếu giá của $\\vec{n}$ vuông góc với mặt phẳng $(\\alpha)$.

### 2. Phương trình tổng quát của mặt phẳng
Mỗi mặt phẳng trong không gian đều có phương trình tổng quát dạng:
$$Ax + By + Cz + D = 0$$
với $A^2 + B^2 + C^2 > 0$. Khi đó $\\vec{n} = (A; B; C)$ là một VTPT của mặt phẳng.`,
    createdAt: '2025-09-05'
  },
  {
    id: 'les-ly-1',
    chapterId: 'chap-ly-1',
    subjectId: 'ly',
    grade: 12,
    title: 'Bài 1: Cấu trúc vi mô và mô hình động học phân tử chất khí',
    accessTier: 'free',
    status: 'published',
    order: 1,
    summary: 'Chuyển động nhiệt của các phân tử, tương tác phân tử và các trạng thái của vật chất.',
    keyFormulas: [
      'Áp suất khí: p = (1/3) * \\rho * v^2',
      'Nhiệt động học: ΔU = A + Q'
    ],
    content: `### 1. Thuyết động học phân tử chất khí
- Các chất được cấu tạo từ các phân tử riêng biệt có kích thước rất nhỏ so với khoảng cách giữa chúng.
- Các phân tử chuyển động hỗn loạn không ngừng (chuyển động nhiệt). Nhiệt độ càng cao thì phân tử chuyển động càng nhanh.
- Khi chuyển động, các phân tử va chạm với nhau và va chạm vào thành bình gây nên áp suất lên thành bình.`,
    createdAt: '2025-09-08'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // 1. Trắc nghiệm 4 lựa chọn (Choice)
  {
    id: 'q-toan-01',
    subjectId: 'toan',
    grade: 12,
    chapterId: 'chap-toan-1',
    topic: 'Tính đơn điệu hàm số',
    type: 'choice',
    level: 'nhan_biet',
    content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ. Hàm số đồng biến trên khoảng nào dưới đây?',
    options: [
      'A. (–∞; –1)',
      'B. (–1; 1)',
      'C. (0; 1)',
      'D. (1; +∞)'
    ],
    correctOptionIndex: 1,
    explanation: 'Dựa vào bảng biến thiên hoặc dấu đạo hàm, ta thấy f\'(x) > 0 với mọi x thuộc khoảng (-1; 1). Do đó hàm số đồng biến trên (-1; 1).',
    accessTier: 'public',
    status: 'published',
    points: 0.25,
    tags: ['Đạo hàm', 'Đơn điệu']
  },
  {
    id: 'q-toan-02',
    subjectId: 'toan',
    grade: 12,
    chapterId: 'chap-toan-1',
    topic: 'Cực trị của hàm số',
    type: 'choice',
    level: 'thong_hieu',
    content: 'Giá trị cực tiểu của hàm số $y = x^3 - 3x + 1$ bằng bao nhiêu?',
    options: [
      'A. -1',
      'B. 3',
      'C. 1',
      'D. -2'
    ],
    correctOptionIndex: 0,
    explanation: 'Ta có y\' = 3x^2 - 3 = 0 ⇔ x = ±1. Bảng biến thiên cho thấy x = 1 là điểm cực tiểu. Giá trị cực tiểu y_CT = y(1) = 1^3 - 3(1) + 1 = -1.',
    accessTier: 'free',
    status: 'published',
    points: 0.25,
    tags: ['Cực trị']
  },
  {
    id: 'q-toan-03',
    subjectId: 'toan',
    grade: 12,
    chapterId: 'chap-toan-2',
    topic: 'Toạ độ Oxyz',
    type: 'choice',
    level: 'van_dung',
    content: 'Trong không gian Oxyz, cho mặt phẳng $(P): 2x - y + 2z - 6 = 0$. Khoảng cách từ điểm $M(1; -2; 3)$ đến $(P)$ là:',
    options: [
      'A. 2',
      'B. 4/3',
      'C. 4',
      'D. 8/3'
    ],
    correctOptionIndex: 1,
    explanation: 'd(M, P) = |2(1) - (-2) + 2(3) - 6| / √(2^2 + (-1)^2 + 2^2) = |2 + 2 + 6 - 6| / √9 = 4/3.',
    accessTier: 'vip',
    status: 'published',
    points: 0.25,
    tags: ['Khoảng cách Oxyz']
  },

  // 2. Trắc nghiệm Đúng/Sai 4 ý chuẩn QĐ 764 (True/False with 4 propositions)
  {
    id: 'q-toan-04',
    subjectId: 'toan',
    grade: 12,
    chapterId: 'chap-toan-1',
    topic: 'Khảo sát hàm phân thức hữu tỉ',
    type: 'true_false',
    level: 'thong_hieu',
    content: 'Cho hàm số $y = f(x) = \\frac{2x - 1}{x + 1}$. Xét tính Đúng hay Sai của các mệnh đề sau:',
    propositions: [
      { id: 'p1', text: 'a) Tập xác định của hàm số là D = R \\ {-1}.', isCorrect: true },
      { id: 'p2', text: 'b) Đạo hàm của hàm số là f\'(x) = 3 / (x + 1)^2.', isCorrect: true },
      { id: 'p3', text: 'c) Hàm số đồng biến trên toàn bộ tập số thực R.', isCorrect: false },
      { id: 'p4', text: 'd) Đồ thị hàm số có tiệm cận đứng là đường thẳng x = 2.', isCorrect: false }
    ],
    explanation: 'Lời giải chi tiết:\na) Đúng: Mẫu số x + 1 ≠ 0 ⇔ x ≠ -1.\nb) Đúng: y\' = (2(1) - (-1)(1)) / (x + 1)^2 = 3 / (x + 1)^2 > 0.\nc) Sai: Hàm số chỉ đồng biến trên từng khoảng (-∞; -1) và (-1; +∞), không đồng biến trên R.\nd) Sai: Tiệm cận đứng là x = -1, tiệm cận ngang là y = 2.',
    accessTier: 'free',
    status: 'published',
    points: 1.0,
    tags: ['Đúng/Sai', 'Hàm phân thức']
  },

  // 3. Trắc nghiệm Trả lời ngắn (Short Answer - dạng số thực, chấp nhận cả dấu phẩy và chấm)
  {
    id: 'q-toan-05',
    subjectId: 'toan',
    grade: 12,
    chapterId: 'chap-toan-4',
    topic: 'Xác suất có điều kiện',
    type: 'short_answer',
    level: 'van_dung',
    content: 'Một hộp chứa 5 quả cầu xanh và 7 quả cầu đỏ. Lấy ngẫu nhiên liên tiếp 2 lần, mỗi lần 1 quả không hoàn lại. Xác suất để quả cầu lấy lần thứ hai có màu đỏ, biết quả lần thứ nhất màu xanh là bao nhiêu? (Nhập kết quả dưới dạng số thập phân làm tròn đến 2 chữ số, ví dụ 0.64)',
    shortAnswerKey: '0.64',
    explanation: 'Sau khi lấy quả thứ nhất màu xanh, trong hộp còn lại 4 quả xanh và 7 quả đỏ (tổng cộng 11 quả). Xác suất quả thứ hai màu đỏ là P = 7/11 ≈ 0.636... Làm tròn đến 2 chữ số thập phân là 0.64 (chấp nhận 0.64 hoặc 0,64).',
    accessTier: 'vip',
    status: 'published',
    points: 0.5,
    tags: ['Trả lời ngắn', 'Xác suất']
  },

  // 4. Vật lí câu hỏi trắc nghiệm
  {
    id: 'q-ly-01',
    subjectId: 'ly',
    grade: 12,
    chapterId: 'chap-ly-1',
    topic: 'Nhiệt động học',
    type: 'choice',
    level: 'nhan_biet',
    content: 'Trong hệ SI, đơn vị của nhiệt dung riêng là:',
    options: [
      'A. J/kg',
      'B. J/(kg.K)',
      'C. J.K/kg',
      'D. W/(kg.K)'
    ],
    correctOptionIndex: 1,
    explanation: 'Công thức Q = m.c.ΔT => c = Q / (m.ΔT). Đơn vị trong hệ SI là Jun trên kilôgam Kenvin: J/(kg.K).',
    accessTier: 'public',
    status: 'published',
    points: 0.25,
    tags: ['Vật lí', 'Đơn vị']
  },

  // 5. Câu tự luận ngắn (Ngữ văn hoặc Toán tự luận)
  {
    id: 'q-van-01',
    subjectId: 'van',
    grade: 12,
    chapterId: 'chap-toan-1',
    topic: 'Đọc hiểu & Nghị luận xã hội',
    type: 'essay',
    level: 'van_dung',
    content: 'Viết một đoạn văn (khoảng 200 chữ) trình bày suy nghĩ của anh/chị về tầm quan trọng của việc chủ động học tập và tự định hướng trong kỷ nguyên vũ trụ số.',
    essayGuide: 'Tiêu chí chấm:\n1. Đúng hình thức đoạn văn (1.0đ)\n2. Xác định đúng vấn đề: Chủ động học tập & tự định hướng (1.0đ)\n3. Lập luận chặt chẽ, dẫn chứng xác thực từ thực tế (1.5đ)\n4. Chính tả, diễn đạt sáng tạo, cảm xúc (0.5đ). Tổng 4.0 điểm.',
    explanation: 'Hướng dẫn làm bài: Mở đoạn dẫn dắt đến kỷ nguyên số và trí tuệ nhân tạo. Thân đoạn nêu vai trò của tính chủ động: tiếp thu kiến thức nhanh, làm chủ tư duy phản biện. Kết đoạn bài học hành động cá nhân.',
    accessTier: 'free',
    status: 'published',
    points: 4.0,
    tags: ['Tự luận', 'Ngữ văn 2018']
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-thpt-toan-2025',
    title: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - 2026 Môn Toán (Chuẩn Cấu Trúc Bộ GD&ĐT)',
    code: 'THPT-M101',
    subjectId: 'toan',
    grade: 12,
    year: 2025,
    durationMinutes: 90,
    maxScore: 10,
    accessTier: 'public',
    status: 'published',
    isStandardTHPT: true,
    description: 'Đề thi biên soạn bám sát Quyết định 764/QĐ-BGDĐT: Gồm 3 phần (Phần I: 12 câu nhiều lựa chọn; Phần II: 4 câu Đúng/Sai 4 ý; Phần III: 6 câu trả lời ngắn).',
    totalSubmissions: 1284,
    averageScore: 6.84,
    parts: [
      {
        id: 'p1',
        title: 'PHẦN I: Câu hỏi trắc nghiệm nhiều phương án lựa chọn',
        description: 'Mỗi câu hỏi thí sinh chỉ chọn một phương án. Đúng mỗi câu được 0.25 điểm.',
        questionIds: ['q-toan-01', 'q-toan-02', 'q-toan-03'],
        maxScore: 3.0
      },
      {
        id: 'p2',
        title: 'PHẦN II: Câu hỏi trắc nghiệm Đúng / Sai',
        description: 'Mỗi câu có 4 ý a, b, c, d. Đúng 1 ý được 0.1đ; 2 ý được 0.25đ; 3 ý được 0.5đ; 4 ý được 1.0đ.',
        questionIds: ['q-toan-04'],
        maxScore: 4.0
      },
      {
        id: 'p3',
        title: 'PHẦN III: Câu hỏi trắc nghiệm trả lời ngắn',
        description: 'Thí sinh điền kết quả vào ô trả lời. Đúng mỗi câu được 0.5 điểm.',
        questionIds: ['q-toan-05'],
        maxScore: 3.0
      }
    ]
  },
  {
    id: 'exam-thpt-ly-2025',
    title: 'Đề Khảo Sát Năng Lực Vật Lí THPT - Chuyên Đề Động Học & Nhiệt Học',
    code: 'PHYS-VIP-202',
    subjectId: 'ly',
    grade: 12,
    year: 2025,
    durationMinutes: 50,
    maxScore: 10,
    accessTier: 'vip',
    status: 'published',
    isStandardTHPT: true,
    description: 'Đề thi trắc nghiệm định hướng thực nghiệm và ứng dụng đời sống kỹ thuật dành cho học sinh thi tổ hợp KHTN.',
    totalSubmissions: 412,
    averageScore: 7.2,
    parts: [
      {
        id: 'p1',
        title: 'Trắc nghiệm nhiều lựa chọn',
        description: 'Các câu hỏi lý thuyết và bài tập căn bản',
        questionIds: ['q-ly-01'],
        maxScore: 10.0
      }
    ]
  }
];

export const INITIAL_RAG_DOCS: RAGDocument[] = [
  {
    id: 'rag-01',
    title: 'SGK Toán 12 Tập 1 - Kết Nối Tri Thức Với Cuộc Sống',
    subjectId: 'toan',
    grade: 12,
    source: 'NXB Giáo Dục Việt Nam (Bản quyền thẩm định Bộ GD&ĐT)',
    license: 'Giấy phép giáo dục phổ thông 2018',
    status: 'approved',
    uploadedAt: '2025-08-15',
    snippetCount: 1420,
    contentSnippet: 'Chương 1: Ứng dụng đạo hàm khảo sát hàm số. Khái niệm tính đồng biến, nghịch biến; cực trị hàm số; tiệm cận đứng x = x0 và tiệm cận ngang y = y0; giá trị lớn nhất, giá trị nhỏ nhất trên đoạn [a; b].'
  },
  {
    id: 'rag-02',
    title: 'Tài liệu hướng dẫn cấu trúc định dạng đề thi tốt nghiệp THPT từ năm 2025',
    subjectId: 'toan',
    grade: 12,
    source: 'Quyết định số 764/QĐ-BGDĐT Bộ Giáo dục và Đào tạo',
    license: 'Công văn & Văn bản quy phạm pháp luật công khai',
    status: 'approved',
    uploadedAt: '2025-08-20',
    snippetCount: 380,
    contentSnippet: 'Đề thi môn Toán gồm 3 phần: Phần I gồm 12 câu trắc nghiệm 4 lựa chọn (3,0 điểm); Phần II gồm 4 câu trắc nghiệm Đúng/Sai (4,0 điểm) với quy tắc tính điểm lũy tiến 0.1 - 0.25 - 0.5 - 1.0; Phần III gồm 6 câu trả lời ngắn (3,0 điểm).'
  },
  {
    id: 'rag-03',
    title: 'Cẩm nang Ôn tập Vật lí 12 - Chương Nhiệt học & Thuyết động học',
    subjectId: 'ly',
    grade: 12,
    source: 'Tổ chuyên môn Vật lí Scholyx biên soạn',
    license: 'Bản quyền nội bộ Scholyx 2025',
    status: 'approved',
    uploadedAt: '2025-09-01',
    snippetCount: 650,
    contentSnippet: 'Công thức nhiệt lượng Q = mcΔT, nhiệt nóng chảy Q = λm, nhiệt hóa hơi Q = Lm. Mô hình khí lý tưởng và phương trình Clapayron - Mendeleev: pV = nRT = (m/M)RT.'
  }
];

export const INITIAL_VIP_PLANS: VIPPlan[] = [
  {
    id: 'plan-comet',
    name: 'Gói Sao Băng (1 Tháng)',
    tagline: 'Khởi đầu bứt phá điểm số thần tốc',
    durationDays: 30,
    priceVND: 79000,
    originalPriceVND: 120000,
    features: [
      'Luyện tập câu hỏi không giới hạn (thay vì 30 câu/ngày)',
      'Truy cập toàn bộ đề thi thử độc quyền chuẩn 2025',
      'Lời giải chi tiết từng bước & phương pháp casio',
      'Trợ lý AI Scholyx Cosmos 50 lượt/ngày (thay vì 10 lượt)',
      'Sổ câu sai tự động không giới hạn',
      'Hỏi trực tiếp AI ngay từ câu làm sai'
    ],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'plan-galaxy',
    name: 'Gói Nhật Thực (3 Tháng)',
    tagline: 'Giai đoạn nước rút then chốt',
    durationDays: 90,
    priceVND: 199000,
    originalPriceVND: 350000,
    isPopular: true,
    features: [
      'Toàn bộ quyền lợi gói Sao Băng',
      'Lộ trình học cá nhân hóa theo tuần thích ứng AI',
      'Chẩn đoán radar chủ đề yếu & đề xuất bài tập khắc phục',
      'Phổ điểm và xếp hạng vị trí thi thử toàn quốc',
      'Chấm nhận xét tự luận tham khảo bằng AI',
      'Ưu tiên giải đáp từ đội ngũ biên tập viên QTND'
    ],
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'plan-cosmos',
    name: 'Gói Thiên Hà Trọn Năm (12 Tháng)',
    tagline: 'Vững bước vào trường Đại học mơ ước',
    durationDays: 365,
    priceVND: 499000,
    originalPriceVND: 990000,
    features: [
      'Toàn bộ quyền lợi gói Nhật Thực trong 365 ngày',
      'Đề thi thử mô phỏng kỳ thi thật sát thực tế 100%',
      'Tải bản sao báo cáo tiến độ và học tập dạng PDF',
      'Nhắc nhở ôn tập ngắt quãng theo chu kỳ Spaced Repetition',
      'Huy hiệu Tinh Vân Hoàng Gia & danh hiệu Thủ khoa',
      'Bảo lưu tài khoản nếu có lý do y tế/hoãn thi'
    ],
    color: 'from-amber-400 to-orange-600'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-student-free',
    name: 'Nguyễn Minh Quân',
    email: 'quan.nm@scholyx.edu.vn',
    phone: '0981234567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 12,
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    province: 'Hà Nội',
    role: 'student',
    vipTier: 'free',
    targetSubjects: ['toan', 'van', 'ly', 'hoa', 'anh'],
    targetScores: { toan: 9.0, van: 8.5, ly: 9.25, hoa: 8.75, anh: 9.4 },
    examDate: '2027-06-25',
    allowAIPersonalization: true,
    studyHoursPerDay: 3.5,
    streakDays: 14,
    lastActive: 'Hôm nay, 10:25',
    status: 'active'
  },
  {
    id: 'user-student-vip',
    name: 'Trần Hải Đăng (VIP)',
    email: 'haidang.tran@scholyx.edu.vn',
    phone: '0979888999',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 12,
    school: 'THPT Lê Hồng Phong',
    province: 'TP. Hồ Chí Minh',
    role: 'student',
    vipTier: 'vip',
    vipExpiresAt: '2027-09-30',
    targetSubjects: ['toan', 'van', 'ly', 'anh'],
    targetScores: { toan: 9.6, van: 8.5, ly: 9.5, anh: 9.8 },
    examDate: '2027-06-25',
    allowAIPersonalization: true,
    studyHoursPerDay: 4.5,
    streakDays: 38,
    lastActive: 'Vừa xong',
    status: 'active'
  },
  {
    id: 'user-qtnd',
    name: 'ThS. Lê Hoàng An (QTND Giáo viên)',
    email: 'an.le@scholyx.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 12,
    school: 'Tổ Toán - THPT Chuyên',
    province: 'Hà Nội',
    role: 'qtnd',
    vipTier: 'vip',
    targetSubjects: ['toan'],
    targetScores: {},
    examDate: '2027-06-25',
    allowAIPersonalization: false,
    studyHoursPerDay: 8,
    streakDays: 120,
    lastActive: 'Đang online',
    status: 'active'
  },
  {
    id: 'user-qtv',
    name: 'Quản Trị Viên Hệ Thống (QTV)',
    email: 'admin@scholyx.vn',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    grade: 12,
    school: 'Ban Quản Trị Scholyx',
    province: 'Việt Nam',
    role: 'qtv',
    vipTier: 'vip',
    targetSubjects: [],
    targetScores: {},
    examDate: '2027-06-25',
    allowAIPersonalization: false,
    studyHoursPerDay: 8,
    streakDays: 240,
    lastActive: 'Đang online',
    status: 'active'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-984210',
    userId: 'user-student-vip',
    userName: 'Trần Hải Đăng',
    planId: 'plan-galaxy',
    planName: 'Gói Nhật Thực (3 Tháng)',
    amountVND: 199000,
    discountVND: 0,
    paymentMethod: 'vietqr',
    status: 'success',
    createdAt: '2026-03-12 14:22:10',
    completedAt: '2026-03-12 14:22:58',
    invoiceNumber: 'INV-2026-0042',
    bankName: 'MBBank (Ngân hàng Quân Đội)',
    accountNumber: '19036888666999',
    transferSyntax: 'SCHOLYX VIP 984210',
    vatAmount: 18090,
    approvedBy: 'Hệ thống tự động (Webhook VietQR)'
  },
  {
    id: 'TXN-984102',
    userId: 'user-student-free',
    userName: 'Nguyễn Minh Quân',
    planId: 'plan-comet',
    planName: 'Gói Sao Băng (1 Tháng)',
    amountVND: 63200,
    discountVND: 15800,
    paymentMethod: 'momo',
    status: 'success',
    createdAt: '2026-03-10 09:15:30',
    completedAt: '2026-03-10 09:16:12',
    invoiceNumber: 'INV-2026-0038',
    bankName: 'Ví Điện Tử MoMo Business',
    accountNumber: '0988776655',
    transferSyntax: 'SCHOLYX VIP 984102',
    vatAmount: 5745,
    approvedBy: 'Ví MoMo Auto IPN'
  },
  {
    id: 'TXN-984501',
    userId: 'user-student-free',
    userName: 'Nguyễn Minh Quân',
    planId: 'plan-cosmos',
    planName: 'Gói Thiên Hà Trọn Năm (VIP 365 Ngày)',
    amountVND: 399200,
    discountVND: 99800,
    paymentMethod: 'zalopay',
    status: 'pending',
    createdAt: '2026-03-16 08:12:00',
    invoiceNumber: 'INV-2026-0049',
    bankName: 'Ví Điện Tử ZaloPay',
    accountNumber: '0988776655',
    transferSyntax: 'SCHOLYX VIP 984501',
    vatAmount: 36290,
    customerNote: 'Đang chờ xác nhận quét mã từ app ví ZaloPay hoặc QTV duyệt'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-1004',
    actorId: 'user-qtv',
    actorName: 'Admin Scholyx',
    actorRole: 'qtv',
    action: 'CẬP_NHẬT_CẤU_HÌNH',
    targetObject: 'SystemConfig',
    details: 'Bật kiểm tra xác thực OTP và nâng giới hạn phiên làm bài thi lên 120 phút',
    ipAddress: '113.190.24.11',
    timestamp: '2026-03-15 08:30:12'
  },
  {
    id: 'LOG-1003',
    actorId: 'user-qtnd',
    actorName: 'ThS. Lê Hoàng An',
    actorRole: 'qtnd',
    action: 'DUYỆT_TÀI_LIỆU_RAG',
    targetObject: 'Tài liệu QĐ 764 Bộ GD&ĐT',
    details: 'Duyệt tài liệu đưa vào kho tri thức vector cho Trợ lý AI Cosmos',
    ipAddress: '14.161.35.88',
    timestamp: '2026-03-14 16:45:00'
  },
  {
    id: 'LOG-1002',
    actorId: 'user-qtv',
    actorName: 'Admin Scholyx',
    actorRole: 'qtv',
    action: 'KÍCH_HOẠT_VIP_THỦ_CÔNG',
    targetObject: 'Tài khoản: Trần Hải Đăng',
    details: 'Cấp VIP 90 ngày sau khi xác nhận thanh toán trực tuyến',
    ipAddress: '113.190.24.11',
    timestamp: '2026-03-12 14:23:05'
  }
];

export const INITIAL_FEEDBACKS: FeedbackReport[] = [
  {
    id: 'FB-01',
    userId: 'user-student-free',
    type: 'question_error',
    relatedId: 'q-toan-01',
    content: 'Đồ thị bảng biến thiên câu 1 hiển thị rất rõ ràng, nhưng em thắc mắc câu này có phương pháp tính nhanh không ạ?',
    status: 'resolved',
    createdAt: '2026-03-14 19:30',
    response: 'Chào em, câu này nhận biết bằng quy tắc f\'(x) > 0 mang dấu dương trên khoảng đó nhé!'
  }
];

export const RANK_TIER_CONFIG: Record<RankTier, {
  name: string;
  vietnamese: string;
  badge: string;
  color: string;
  glowClass: string;
  bgGradient: string;
  borderClass: string;
  minPoints: number;
}> = {
  bronze: {
    name: 'Bronze',
    vietnamese: 'Đồng - Quỹ Đạo Đồng',
    badge: '🥉 Quỹ Đạo Đồng',
    color: 'text-amber-600',
    glowClass: 'shadow-amber-700/20',
    bgGradient: 'from-amber-900/30 to-amber-950/50',
    borderClass: 'border-amber-700/40',
    minPoints: 0
  },
  silver: {
    name: 'Silver',
    vietnamese: 'Bạc - Tinh Vân Bạc',
    badge: '🥈 Tinh Vân Bạc',
    color: 'text-slate-300',
    glowClass: 'shadow-slate-400/20',
    bgGradient: 'from-slate-800/40 to-slate-900/60',
    borderClass: 'border-slate-500/40',
    minPoints: 100
  },
  gold: {
    name: 'Gold',
    vietnamese: 'Vàng - Thái Dương Vàng',
    badge: '🥇 Thái Dương Vàng',
    color: 'text-amber-400',
    glowClass: 'shadow-amber-400/30',
    bgGradient: 'from-amber-600/20 via-yellow-900/30 to-amber-950/60',
    borderClass: 'border-amber-400/50',
    minPoints: 300
  },
  platinum: {
    name: 'Platinum',
    vietnamese: 'Bạch Kim - Tinh Cầu Bạch Kim',
    badge: '💠 Tinh Cầu Bạch Kim',
    color: 'text-cyan-300',
    glowClass: 'shadow-cyan-400/30',
    bgGradient: 'from-cyan-900/30 via-teal-900/40 to-indigo-950/60',
    borderClass: 'border-cyan-400/50',
    minPoints: 600
  },
  diamond: {
    name: 'Diamond',
    vietnamese: 'Kim Cương - Siêu Tân Tinh',
    badge: '💎 Siêu Tân Tinh',
    color: 'text-sky-300',
    glowClass: 'shadow-sky-400/40',
    bgGradient: 'from-sky-700/30 via-indigo-900/40 to-violet-950/60',
    borderClass: 'border-sky-300/60',
    minPoints: 1000
  },
  master: {
    name: 'Master',
    vietnamese: 'Tinh Anh - Hố Đen Tinh Anh',
    badge: '🔮 Hố Đen Tinh Anh',
    color: 'text-purple-300',
    glowClass: 'shadow-purple-500/40',
    bgGradient: 'from-purple-900/40 via-fuchsia-950/50 to-indigo-950/70',
    borderClass: 'border-purple-400/60',
    minPoints: 1500
  },
  grandmaster: {
    name: 'Grandmaster',
    vietnamese: 'Cao Thủ - Thiên Hà Cao Thủ',
    badge: '☄️ Thiên Hà Cao Thủ',
    color: 'text-rose-400',
    glowClass: 'shadow-rose-500/50',
    bgGradient: 'from-rose-900/40 via-red-950/50 to-purple-950/70',
    borderClass: 'border-rose-400/60',
    minPoints: 2100
  },
  challenger: {
    name: 'Challenger',
    vietnamese: 'Thách Đấu - Tinh Cầu Tối Thượng',
    badge: '👑 Tinh Cầu Tối Thượng',
    color: 'text-yellow-300',
    glowClass: 'shadow-yellow-400/60',
    bgGradient: 'from-amber-500/30 via-purple-900/40 to-cyan-950/70',
    borderClass: 'border-amber-300/80',
    minPoints: 2800
  },
  novice: {
    name: 'Novice',
    vietnamese: 'Tân Binh',
    badge: '🌱 Tân Binh',
    color: 'text-slate-400',
    glowClass: 'shadow-slate-500/20',
    bgGradient: 'from-slate-900/40 to-slate-950/60',
    borderClass: 'border-slate-600/40',
    minPoints: 0
  },
  orbital: {
    name: 'Orbital',
    vietnamese: 'Quỹ Đạo',
    badge: '🪐 Quỹ Đạo',
    color: 'text-indigo-300',
    glowClass: 'shadow-indigo-500/20',
    bgGradient: 'from-indigo-900/30 to-indigo-950/60',
    borderClass: 'border-indigo-500/40',
    minPoints: 100
  },
  comet: {
    name: 'Comet',
    vietnamese: 'Sao Băng',
    badge: '☄️ Sao Băng',
    color: 'text-amber-400',
    glowClass: 'shadow-amber-400/30',
    bgGradient: 'from-amber-900/30 to-slate-950/60',
    borderClass: 'border-amber-500/40',
    minPoints: 300
  },
  nebula: {
    name: 'Nebula',
    vietnamese: 'Tinh Vân',
    badge: '🌌 Tinh Vân',
    color: 'text-purple-300',
    glowClass: 'shadow-purple-500/30',
    bgGradient: 'from-purple-900/30 to-slate-950/60',
    borderClass: 'border-purple-500/40',
    minPoints: 600
  },
  cosmic_legend: {
    name: 'Cosmic Legend',
    vietnamese: 'Huyền Thoại Vũ Trụ',
    badge: '👑 Huyền Thoại',
    color: 'text-cyan-300',
    glowClass: 'shadow-cyan-400/50',
    bgGradient: 'from-cyan-900/40 to-indigo-950/70',
    borderClass: 'border-cyan-400/70',
    minPoints: 2500
  }
};

export const INITIAL_GAME_STATS: UserGameStats = {
  combatPower: 6850,
  level: 16,
  currentExp: 650,
  maxExp: 1000,
  rankTier: 'gold',
  rankDivision: 2,
  rankPoints: 72,
  crystals: 480,
  winStreak: 4,
  totalMatches: 28,
  winCount: 22,
  title: 'Thần Tốc Tích Phân & Oxyz',
  dailyEnergy: 60,
  claimedEnergyChests: [20, 40],
  mathCP: 2650,
  physicsCP: 1850,
  chemistryCP: 950,
  litCP: 750,
  engCP: 650,
  bioCP: 450
};

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'rank-user-1',
    userName: 'Vũ Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Lam Sơn - Thanh Hóa',
    province: 'Thanh Hóa',
    rankTier: 'challenger',
    rankDivision: 1,
    rankPoints: 98,
    combatPower: 12450,
    winStreak: 12,
    badge: '👑 Thách Đấu Toàn Quốc'
  },
  {
    rank: 2,
    userId: 'rank-user-2',
    userName: 'Lê Thùy Dung',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên KHTN - ĐHQG Hà Nội',
    province: 'Hà Nội',
    rankTier: 'grandmaster',
    rankDivision: 1,
    rankPoints: 85,
    combatPower: 10920,
    winStreak: 8,
    badge: '☄️ Thiên Hà Cao Thủ'
  },
  {
    rank: 3,
    userId: 'rank-user-3',
    userName: 'Trần Hải Đăng (VIP)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Lê Hồng Phong - TP. HCM',
    province: 'TP. Hồ Chí Minh',
    rankTier: 'grandmaster',
    rankDivision: 2,
    rankPoints: 62,
    combatPower: 9860,
    winStreak: 5,
    badge: '🔮 Hố Đen Tinh Anh'
  },
  {
    rank: 4,
    userId: 'user-student-free',
    userName: 'Nguyễn Minh Quân (Bạn)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    province: 'Hà Nội',
    rankTier: 'gold',
    rankDivision: 2,
    rankPoints: 72,
    combatPower: 6850,
    winStreak: 4,
    badge: '🥇 Thái Dương Vàng'
  },
  {
    rank: 5,
    userId: 'rank-user-5',
    userName: 'Phạm Bảo Ngọc',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Quốc Học Huế',
    province: 'Thừa Thiên Huế',
    rankTier: 'gold',
    rankDivision: 1,
    rankPoints: 42,
    combatPower: 6320,
    winStreak: 3,
    badge: '🥇 Thái Dương Vàng'
  },
  {
    rank: 6,
    userId: 'rank-user-6',
    userName: 'Hoàng Minh Khôi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chu Văn An - Hà Nội',
    province: 'Hà Nội',
    rankTier: 'silver',
    rankDivision: 1,
    rankPoints: 88,
    combatPower: 5410,
    winStreak: 2,
    badge: '🥈 Tinh Vân Bạc'
  }
];

export const INITIAL_GAME_QUESTS: GameQuest[] = [
  {
    id: 'quest-d1',
    title: 'Điểm Danh Trạm Không Gian',
    description: 'Đăng nhập vào hệ thống học tập Scholyx hôm nay nhận năng lượng',
    category: 'daily',
    rewardCP: 120,
    rewardCrystals: 20,
    currentProgress: 1,
    maxProgress: 1,
    completed: true,
    claimed: true,
    icon: 'Flame',
    actionTab: 'home'
  },
  {
    id: 'quest-d2',
    title: 'Xạ Thủ Trắc Nghiệm',
    description: 'Giải đúng 5 câu trắc nghiệm môn Toán hoặc Lí trong phần Luyện Tập',
    category: 'daily',
    subjectId: 'toan',
    rewardCP: 280,
    rewardCrystals: 35,
    currentProgress: 4,
    maxProgress: 5,
    completed: false,
    claimed: false,
    icon: 'Target',
    actionTab: 'practice'
  },
  {
    id: 'quest-d3',
    title: 'Thám Hiểm Kiến Thức Mới',
    description: 'Học và hoàn thành ít nhất 1 bài học lý thuyết mới trong chương trình 2018',
    category: 'daily',
    rewardCP: 220,
    rewardCrystals: 25,
    currentProgress: 1,
    maxProgress: 1,
    completed: true,
    claimed: false,
    icon: 'BookOpen',
    actionTab: 'lessons'
  },
  {
    id: 'quest-d4',
    title: 'Đấu Trí Rank Vũ Trụ',
    description: 'Tham gia 1 trận Quyết Đấu Tốc Độ 1v1 hoặc Thi Đấu Rank Mùa Giải',
    category: 'daily',
    rewardCP: 400,
    rewardCrystals: 50,
    currentProgress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    icon: 'Swords',
    actionTab: 'ranked'
  },
  {
    id: 'quest-d5',
    title: 'Chữa Lành Lỗ Hổng Kiến Thức',
    description: 'Giải lại và khắc phục thành công ít nhất 1 câu trong Sổ Câu Sai',
    category: 'daily',
    rewardCP: 180,
    rewardCrystals: 20,
    currentProgress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    icon: 'RotateCcw',
    actionTab: 'mistakes'
  },
  // Weekly Quests
  {
    id: 'quest-w1',
    title: 'Đại Đột Phá Tuần',
    description: 'Hoàn thành tổng cộng 40 câu hỏi trắc nghiệm trong tuần',
    category: 'weekly',
    rewardCP: 850,
    rewardCrystals: 100,
    currentProgress: 28,
    maxProgress: 40,
    completed: false,
    claimed: false,
    icon: 'Zap',
    actionTab: 'practice'
  },
  {
    id: 'quest-w2',
    title: 'Thần Tốc Đạt Điểm 8+',
    description: 'Đạt từ 8.0 điểm trở lên trong bất kỳ đề thi thử chuẩn cấu trúc 2025',
    category: 'weekly',
    rewardCP: 1200,
    rewardCrystals: 150,
    currentProgress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    icon: 'Award',
    actionTab: 'exams'
  },
  {
    id: 'quest-w3',
    title: 'Chuỗi Thắng Leo Rank x3',
    description: 'Đạt chuỗi 3 trận thắng liên tiếp trong Đấu trường Leo Rank 1v1',
    category: 'weekly',
    rewardCP: 1100,
    rewardCrystals: 130,
    currentProgress: 2,
    maxProgress: 3,
    completed: false,
    claimed: false,
    icon: 'Flame',
    actionTab: 'ranked'
  },
  {
    id: 'quest-w4',
    title: 'Chinh Phục Ải Hành Tinh',
    description: 'Vượt qua ít nhất 2 ải trong Bản đồ Vượt Ải Hành Tinh Tri Thức',
    category: 'weekly',
    rewardCP: 900,
    rewardCrystals: 110,
    currentProgress: 1,
    maxProgress: 2,
    completed: false,
    claimed: false,
    icon: 'Compass',
    actionTab: 'quests'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Khởi Đầu Tinh Cầu',
    description: 'Hoàn thành bài luyện tập đầu tiên trên Scholyx',
    icon: 'Sparkles',
    tier: 'bronze',
    combatPowerBonus: 200,
    unlocked: true,
    unlockedAt: '12/03/2026'
  },
  {
    id: 'ach-2',
    title: 'Chiến Thần Đạo Hàm',
    description: 'Giải đúng liên tiếp 10 câu ứng dụng đạo hàm không sai câu nào',
    icon: 'Target',
    tier: 'silver',
    combatPowerBonus: 500,
    unlocked: true,
    unlockedAt: '14/03/2026'
  },
  {
    id: 'ach-3',
    title: 'Bậc Thầy Đúng / Sai 2025',
    description: 'Đạt điểm tuyệt đối 4.0/4.0 ở Phần II câu hỏi Đúng/Sai chuẩn QĐ 764',
    icon: 'Award',
    tier: 'gold',
    combatPowerBonus: 1000,
    unlocked: false
  },
  {
    id: 'ach-4',
    title: 'Huyền Thoại Vô Địch Rank',
    description: 'Đạt chuỗi 10 trận thắng liên tiếp trong Đấu trường Leo Rank',
    icon: 'Crown',
    tier: 'celestial',
    combatPowerBonus: 2500,
    unlocked: false
  }
];

/* SIMULATED RANK OPPONENTS FOR 1V1 REALTIME SPEED DUEL */
export const INITIAL_RANK_OPPONENTS: RankedOpponent[] = [
  {
    id: 'opp-1',
    name: 'Đặng Tuấn Kiệt',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Lê Khiết - Quảng Ngãi',
    province: 'Quảng Ngãi',
    rankTier: 'gold',
    rankDivision: 2,
    combatPower: 6720,
    winStreak: 3,
    accuracyRate: 82,
    avgAnswerSeconds: 9
  },
  {
    id: 'opp-2',
    name: 'Ngô Thùy Trang',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Nguyễn Thượng Hiền - TP. HCM',
    province: 'TP. HCM',
    rankTier: 'gold',
    rankDivision: 3,
    combatPower: 6540,
    winStreak: 2,
    accuracyRate: 78,
    avgAnswerSeconds: 11
  },
  {
    id: 'opp-3',
    name: 'Bùi Gia Huy',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Bến Tre',
    province: 'Bến Tre',
    rankTier: 'gold',
    rankDivision: 1,
    combatPower: 7120,
    winStreak: 5,
    accuracyRate: 85,
    avgAnswerSeconds: 8
  },
  {
    id: 'opp-4',
    name: 'Trần Phương Thảo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Kim Liên - Hà Nội',
    province: 'Hà Nội',
    rankTier: 'platinum',
    rankDivision: 4,
    combatPower: 7350,
    winStreak: 1,
    accuracyRate: 84,
    avgAnswerSeconds: 10
  }
];

/* PLANET CONQUEST (BẢN ĐỒ VƯỢT ẢI HÀNH TINH TRI THỨC) */
export const INITIAL_PLANET_STAGES: PlanetStage[] = [
  // Hành tinh Toán học (Math Planet)
  {
    id: 'stage-math-1',
    planetId: 'toan',
    planetName: 'Hành Tinh Toán Học (Math Prime)',
    stageNumber: 1,
    title: 'Ải 1: Cổng Trời Đạo Hàm & Tính Đơn Điệu',
    description: 'Chinh phục quy tắc dấu f\'(x) và tìm khoảng đồng biến, nghịch biến',
    difficulty: 'easy',
    starsEarned: 3,
    isUnlocked: true,
    isCompleted: true,
    rewardCP: 350,
    questionIds: ['q-toan-01', 'q-toan-02', 'q-toan-03']
  },
  {
    id: 'stage-math-2',
    planetId: 'toan',
    planetName: 'Hành Tinh Toán Học (Math Prime)',
    stageNumber: 2,
    title: 'Ải 2: Vực Thẳm Tiệm Cận & Cực Trị',
    description: 'Xác định đường tiệm cận ngang, tiệm cận đứng và tọa độ điểm cực trị',
    difficulty: 'medium',
    starsEarned: 2,
    isUnlocked: true,
    isCompleted: true,
    rewardCP: 500,
    questionIds: ['q-toan-04', 'q-toan-05', 'q-toan-06']
  },
  {
    id: 'stage-math-3',
    planetId: 'toan',
    planetName: 'Hành Tinh Toán Học (Math Prime)',
    stageNumber: 3,
    title: 'Ải 3: Mê Cung Tọa Độ Không Gian Oxyz',
    description: 'Vectơ pháp tuyến, tích vô hướng và phương trình mặt phẳng trong không gian',
    difficulty: 'hard',
    starsEarned: 0,
    isUnlocked: true,
    isCompleted: false,
    rewardCP: 750,
    questionIds: ['q-toan-07', 'q-toan-08', 'q-toan-09']
  },
  {
    id: 'stage-math-4',
    planetId: 'toan',
    planetName: 'Hành Tinh Toán Học (Math Prime)',
    stageNumber: 4,
    title: 'Ải 4: Lốc Xoáy Xác Suất Có Điều Kiện',
    description: 'Công thức nhân xác suất, xác suất toàn phần và công thức Bayes',
    difficulty: 'hard',
    starsEarned: 0,
    isUnlocked: false,
    isCompleted: false,
    rewardCP: 950,
    questionIds: ['q-toan-10', 'q-toan-11', 'q-toan-12']
  },
  {
    id: 'stage-math-5',
    planetId: 'toan',
    planetName: 'Hành Tinh Toán Học (Math Prime)',
    stageNumber: 5,
    title: 'Ải 5: Đại Boss Tinh Cầu - Bài Toán Tối Ưu Hóa',
    description: 'Mô hình hóa thực tế tìm thể tích lớn nhất và chi phí cực tiểu',
    difficulty: 'extreme',
    starsEarned: 0,
    isUnlocked: false,
    isCompleted: false,
    rewardCP: 1500,
    questionIds: ['q-toan-13', 'q-toan-14', 'q-toan-15']
  },
  // Hành tinh Vật Lí (Physics Planet)
  {
    id: 'stage-phys-1',
    planetId: 'ly',
    planetName: 'Hành Tinh Vật Lí (Nova Physics)',
    stageNumber: 1,
    title: 'Ải 1: Căn Cứ Mô Hình Động Học Chất Khí',
    description: 'Chuyển động Brown, cấu tạo phân tử chất khí và áp suất',
    difficulty: 'easy',
    starsEarned: 3,
    isUnlocked: true,
    isCompleted: true,
    rewardCP: 350,
    questionIds: ['q-ly-01', 'q-ly-02']
  },
  {
    id: 'stage-phys-2',
    planetId: 'ly',
    planetName: 'Hành Tinh Vật Lí (Nova Physics)',
    stageNumber: 2,
    title: 'Ải 2: Đập Lượng Tử Nhiệt Dung Riêng',
    description: 'Phương trình cân bằng nhiệt và nhiệt độ sôi thực nghiệm',
    difficulty: 'medium',
    starsEarned: 0,
    isUnlocked: true,
    isCompleted: false,
    rewardCP: 600,
    questionIds: ['q-ly-03', 'q-ly-04']
  },
  // Hành tinh Hóa Học (Chemistry Planet)
  {
    id: 'stage-chem-1',
    planetId: 'hoa',
    planetName: 'Hành Tinh Hóa Học (Chemical Nebula)',
    stageNumber: 1,
    title: 'Ải 1: Vành Đai Ester & Lipid',
    description: 'Phản ứng xà phòng hóa, tính chất este đa chức và ứng dụng mỹ phẩm',
    difficulty: 'easy',
    starsEarned: 0,
    isUnlocked: true,
    isCompleted: false,
    rewardCP: 400,
    questionIds: ['q-hoa-01', 'q-hoa-02']
  }
];

/* BATTLE PASS (VÉ THIÊN HÀ TRI THỨC - CELESTIAL PASS) */
export const INITIAL_CELESTIAL_PASS_REWARDS: CelestialPassReward[] = [
  {
    level: 1,
    freeReward: { title: '150 Điểm Chiến Lực', cp: 150, crystals: 20, icon: 'Zap' },
    vipReward: { title: '400 CP + Khung Avatar Sao Băng', cp: 400, crystals: 50, badge: 'Khung Sao Băng', icon: 'Crown' },
    freeClaimed: true,
    vipClaimed: false
  },
  {
    level: 2,
    freeReward: { title: '30 Tinh Thể Vũ Trụ', cp: 100, crystals: 30, icon: 'Sparkles' },
    vipReward: { title: '600 CP + 80 Tinh Thể', cp: 600, crystals: 80, icon: 'Crown' },
    freeClaimed: true,
    vipClaimed: false
  },
  {
    level: 3,
    freeReward: { title: '250 Điểm Chiến Lực', cp: 250, crystals: 25, icon: 'Zap' },
    vipReward: { title: '800 CP + Thẻ Tăng 20% EXP (3 Ngày)', cp: 800, crystals: 100, badge: 'Thẻ EXP x1.2', icon: 'Award' },
    freeClaimed: true,
    vipClaimed: false
  },
  {
    level: 4,
    freeReward: { title: 'Rương Kiến Thức Nhỏ', cp: 300, crystals: 40, icon: 'BookOpen' },
    vipReward: { title: '1,000 CP + Danh hiệu "Thợ Săn Tinh Vân"', cp: 1000, crystals: 120, badge: 'Thợ Săn Tinh Vân', icon: 'Crown' },
    freeClaimed: false,
    vipClaimed: false
  },
  {
    level: 5,
    freeReward: { title: 'Huy Hiệu Đồng Hành', cp: 450, crystals: 50, icon: 'Award' },
    vipReward: { title: '1,500 CP + Khung Avatar Hố Đen Huyền Ảo', cp: 1500, crystals: 200, badge: 'Khung Hố Đen VIP', icon: 'Crown' },
    freeClaimed: false,
    vipClaimed: false
  },
  {
    level: 6,
    freeReward: { title: '50 Tinh Thể Vũ Trụ', cp: 200, crystals: 50, icon: 'Sparkles' },
    vipReward: { title: '1,200 CP + Mở khóa Đề Độc Quyền VIP', cp: 1200, crystals: 150, icon: 'Crown' },
    freeClaimed: false,
    vipClaimed: false
  },
  {
    level: 7,
    freeReward: { title: '400 Điểm Chiến Lực', cp: 400, crystals: 40, icon: 'Zap' },
    vipReward: { title: '2,000 CP + Danh hiệu "Chiến Thần THPT"', cp: 2000, crystals: 250, badge: 'Chiến Thần THPT', icon: 'Crown' },
    freeClaimed: false,
    vipClaimed: false
  }
];

/* THÔNG TIN THANH TOÁN QR VÍ ĐIỆN TỬ & NGÂN HÀNG (VIETQR / MOMO / ZALOPAY) */
export const MOCK_PAYMENT_CONFIG = {
  merchantName: 'CÔNG TY CP CÔNG NGHỆ GIÁO DỤC SCHOLYX',
  vietqr: {
    bankCode: 'MB',
    bankName: 'Ngân hàng TMCP Quân Đội (MBBank)',
    accountNumber: '19036888666999',
    accountName: 'CONG TY CP CONG NGHE GIAO DUC SCHOLYX',
    branch: 'Chi nhánh Hà Nội'
  },
  momo: {
    walletPhone: '0988776655',
    accountName: 'SCHOLYX EDUCATION CORP - MOMO BUSINESS',
    merchantId: 'MOMO-SCHOLYX-8899'
  },
  zalopay: {
    walletPhone: '0988776655',
    accountName: 'SCHOLYX EDU - ZALOPAY MERCHANT',
    appId: '2553'
  }
};


