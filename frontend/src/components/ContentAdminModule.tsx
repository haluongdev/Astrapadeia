import React, { useState } from 'react';
import {
  Settings,
  BookOpen,
  HelpCircle,
  Award,
  Upload,
  CheckCircle,
  XCircle,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Check,
  FileText,
  Eye,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Question, Lesson, Exam, RAGDocument, QuestionType, CognitiveLevel, ContentAccessTier } from '../types';

interface ContentAdminModuleProps {
  initialTab?: 'questions' | 'lessons' | 'exam_matrix' | 'rag' | 'essay_grading';
}

export const ContentAdminModule: React.FC<ContentAdminModuleProps> = ({ initialTab = 'questions' }) => {
  const {
    subjects,
    lessons,
    questions,
    exams,
    ragDocs,
    examSubmissions,
    addOrUpdateLesson,
    addOrUpdateQuestion,
    deleteQuestion,
    addOrUpdateExam,
    uploadRAGDoc,
    toggleRAGDocStatus,
    gradeEssay
  } = useApp();

  const [activeTab, setActiveTab] = useState<'questions' | 'lessons' | 'exam_matrix' | 'rag' | 'essay_grading'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Question bank filters & state
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);

  // New question form state
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({
    subjectId: 'toan',
    grade: 12,
    chapterId: 'chap-toan-1',
    topic: 'Ứng dụng đạo hàm',
    type: 'choice',
    level: 'nhan_biet',
    content: '',
    options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
    correctOptionIndex: 0,
    explanation: '',
    accessTier: 'free',
    status: 'published',
    points: 0.25
  });

  // AI Exam Matrix Generator state (FR-CMS-10)
  const [matrixSubject, setMatrixSubject] = useState<string>('toan');
  const [matrixTitle, setMatrixTitle] = useState<string>('Đề Thi Thử Tự Động Sinh Bằng AI - 2026');
  const [isGeneratingExam, setIsGeneratingExam] = useState<boolean>(false);

  // RAG upload state (FR-CMS-16)
  const [ragTitle, setRagTitle] = useState<string>('');
  const [ragSource, setRagSource] = useState<string>('');
  const [ragContent, setRagContent] = useState<string>('');

  // Essay grading state (FR-CMS-14)
  const [essayScoreInput, setEssayScoreInput] = useState<number>(3.5);
  const [essayFeedbackInput, setEssayFeedbackInput] = useState<string>('Bài viết có dẫn chứng thực tế tốt, lập luận mạch lạc.');
  const [cmsNotice, setCmsNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCmsNotice(msg);
    setTimeout(() => {
      setCmsNotice(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Question save handler
  const handleSaveQuestion = () => {
    if (!editingQuestion.content?.trim() || !editingQuestion.topic?.trim()) {
      showToast('Lỗi: Vui lòng nhập đầy đủ nội dung câu hỏi và chủ đề!');
      return;
    }

    const newQ: Question = {
      id: editingQuestion.id || `q-${editingQuestion.subjectId}-${Date.now()}`,
      subjectId: editingQuestion.subjectId || 'toan',
      grade: editingQuestion.grade || 12,
      chapterId: editingQuestion.chapterId || 'chap-toan-1',
      topic: editingQuestion.topic || 'Chủ đề',
      type: editingQuestion.type || 'choice',
      level: editingQuestion.level || 'nhan_biet',
      content: editingQuestion.content || '',
      options: editingQuestion.options,
      correctOptionIndex: editingQuestion.correctOptionIndex,
      propositions: editingQuestion.propositions,
      shortAnswerKey: editingQuestion.shortAnswerKey,
      explanation: editingQuestion.explanation || 'Lời giải chi tiết...',
      accessTier: editingQuestion.accessTier || 'free',
      status: 'published',
      points: editingQuestion.points || 0.25
    };

    addOrUpdateQuestion(newQ);
    setShowQuestionModal(false);
    showToast('Đã lưu câu hỏi thành công vào ngân hàng đề!');
  };

  // AI Exam Matrix Generator handler (FR-CMS-10)
  const handleGenerateExamByAI = () => {
    setIsGeneratingExam(true);
    setTimeout(() => {
      const subQuestions = questions.filter(q => q.subjectId === matrixSubject);
      const newExam: Exam = {
        id: `exam-ai-${Date.now()}`,
        title: matrixTitle,
        code: `AI-${Math.floor(100 + Math.random() * 900)}`,
        subjectId: matrixSubject,
        grade: 12,
        year: 2026,
        durationMinutes: 90,
        maxScore: 10,
        accessTier: 'free',
        status: 'published',
        isStandardTHPT: true,
        description: 'Đề thi được tạo tự động bởi AI dựa trên ma trận nhận thức 4:3:3 và cấu trúc QĐ 764 Bộ GD&ĐT.',
        totalSubmissions: 0,
        parts: [
          {
            id: 'p1',
            title: 'Phần I: Trắc nghiệm 4 lựa chọn (12 câu)',
            description: 'Đúng 0.25đ/câu',
            questionIds: subQuestions.filter(q => q.type === 'choice').map(q => q.id),
            maxScore: 3.0
          },
          {
            id: 'p2',
            title: 'Phần II: Đúng / Sai 4 ý (4 câu)',
            description: 'Điểm lũy tiến 0.1 - 0.25 - 0.5 - 1.0',
            questionIds: subQuestions.filter(q => q.type === 'true_false').map(q => q.id),
            maxScore: 4.0
          },
          {
            id: 'p3',
            title: 'Phần III: Trả lời ngắn (6 câu)',
            description: 'Đúng 0.5đ/câu',
            questionIds: subQuestions.filter(q => q.type === 'short_answer').map(q => q.id),
            maxScore: 3.0
          }
        ]
      };
      addOrUpdateExam(newExam);
      setIsGeneratingExam(false);
      showToast('AI đã tổng hợp câu hỏi từ ngân hàng và tạo đề thi mới thành công!');
    }, 1200);
  };

  // RAG upload handler (FR-CMS-16)
  const handleUploadRAG = () => {
    if (!ragTitle.trim() || !ragSource.trim()) {
      showToast('Lỗi: Vui lòng nhập tên tài liệu và nguồn trích dẫn hợp lệ!');
      return;
    }
    uploadRAGDoc({
      title: ragTitle,
      source: ragSource,
      contentSnippet: ragContent || 'Trích đoạn kiến thức thẩm định...'
    });
    setRagTitle('');
    setRagSource('');
    setRagContent('');
    showToast('Tài liệu đã được tải lên và lưu vào kho tri thức kiểm duyệt RAG!');
  };

  const filteredQuestions = questions.filter(q => {
    const matchSub = filterSubject === 'all' || q.subjectId === filterSubject;
    const matchType = filterType === 'all' || q.type === filterType;
    return matchSub && matchType;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-emerald-500/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-400">
            <Settings className="w-4 h-4" />
            <span>Quản Trị Nội Dung Học Tập (CMS - QTND)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Không Gian Biên Soạn & Quản Lý Tri Thức
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dành cho giáo viên/biên tập viên: Quản lý ngân hàng câu hỏi, ma trận đề thi bằng AI, tài liệu RAG và chấm tự luận
          </p>
        </div>

        {/* CMS Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0a0e22] p-1 rounded-xl border border-white/5 overflow-x-auto">
          {[
            { id: 'questions', label: 'Ngân Hàng Câu Hỏi' },
            { id: 'exam_matrix', label: 'Tạo Đề Bằng AI' },
            { id: 'rag', label: 'Kho Tri Thức RAG' },
            { id: 'essay_grading', label: 'Chấm Tự Luận' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {cmsNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <span>{cmsNotice}</span>
          <button
            onClick={() => setCmsNotice(null)}
            className="text-slate-400 hover:text-white text-xs ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab 1: Question Bank Management (FR-CMS-04, 05) */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0c1126] border border-white/10 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Tất cả môn</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0c1126] border border-white/10 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Tất cả định dạng</option>
                <option value="choice">Trắc nghiệm 4 lựa chọn</option>
                <option value="true_false">Đúng / Sai 4 ý</option>
                <option value="short_answer">Trả lời ngắn</option>
                <option value="essay">Tự luận</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  showToast('Mô phỏng nhập hàng loạt 50 câu hỏi từ tệp Excel/CSV mẫu thành công! Báo cáo kiểm tra 0 lỗi cú pháp (FR-CMS-05).')
                }
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nhập Excel Hàng Loạt (FR-CMS-05)</span>
              </button>

              <button
                onClick={() => {
                  setEditingQuestion({
                    subjectId: 'toan',
                    grade: 12,
                    topic: 'Chương mới',
                    type: 'choice',
                    level: 'nhan_biet',
                    content: '',
                    options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
                    correctOptionIndex: 0,
                    explanation: '',
                    accessTier: 'free',
                    status: 'published',
                    points: 0.25
                  });
                  setShowQuestionModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Câu Hỏi Mới</span>
              </button>
            </div>
          </div>

          {/* Question table */}
          <div className="rounded-2xl cosmic-card border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090d20] border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Môn & Chủ Đề</th>
                    <th className="py-3 px-4">Nội Dung Đề Bài</th>
                    <th className="py-3 px-4">Định Dạng</th>
                    <th className="py-3 px-4">Mức Độ</th>
                    <th className="py-3 px-4">Gói Quyền Lợi</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredQuestions.map(q => (
                    <tr key={q.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        <div>{subjects.find(s => s.id === q.subjectId)?.name}</div>
                        <div className="text-[10px] text-cyan-400 font-normal">{q.topic}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">{q.content}</td>
                      <td className="py-3.5 px-4 capitalize whitespace-nowrap">
                        {q.type.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {q.level.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold">
                        {q.accessTier}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setShowQuestionModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 mr-1"
                          title="Sửa câu hỏi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
                              deleteQuestion(q.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Exam Matrix Generator (FR-CMS-10) */}
      {activeTab === 'exam_matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Tạo Đề Thi Tự Động Bằng AI Theo Ma Trận (FR-CMS-10)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống dựa trên cấu hình ma trận đề (môn, mức độ nhận biết 40% - thông hiểu 30% - vận dụng 30%) và ngân hàng câu hỏi để tự động bốc và ráp đề chuẩn quy chuẩn QĐ 764.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Tên Đề Thi:</label>
                <input
                  type="text"
                  value={matrixTitle}
                  onChange={e => setMatrixTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Môn Thi:</label>
                <select
                  value={matrixSubject}
                  onChange={e => setMatrixSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0a0e22] border border-white/10 text-xs text-white focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-[#080c1d] border border-white/5 text-xs space-y-2">
                <div className="font-bold text-cyan-300">Tỷ lệ phân bổ ma trận đề thi:</div>
                <div className="flex justify-between text-slate-300">
                  <span>Phần I: 12 câu nhiều lựa chọn</span>
                  <strong className="text-white">3.0 điểm</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Phần II: 4 câu Đúng / Sai (4 ý)</span>
                  <strong className="text-white">4.0 điểm</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Phần III: 6 câu trả lời ngắn</span>
                  <strong className="text-white">3.0 điểm</strong>
                </div>
              </div>

              <button
                onClick={handleGenerateExamByAI}
                disabled={isGeneratingExam}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{isGeneratingExam ? 'AI Đang Ráp Đề...' : 'Kích Hoạt Sinh Đề Bằng AI'}</span>
              </button>
            </div>
          </div>

          {/* List of generated exams */}
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-white">Danh Sách Đề Đã Xuất Bản ({exams.length})</h3>
            <div className="space-y-3">
              {exams.map(e => (
                <div key={e.id} className="p-3.5 rounded-xl bg-[#090d20] border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>{e.title}</span>
                    <span className="font-mono text-cyan-400">{e.code}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RAG Knowledge Base Manager (FR-CMS-16, 17) */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Tải Lên Tài Liệu Nguồn Cho Trợ Lý AI RAG (FR-CMS-16)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Tên tài liệu:</label>
                <input
                  type="text"
                  value={ragTitle}
                  onChange={e => setRagTitle(e.target.value)}
                  placeholder="Ví dụ: SGK Toán 12 Tập 2 - NXB Giáo Dục"
                  className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nguồn & Giấy phép sử dụng:</label>
                <input
                  type="text"
                  value={ragSource}
                  onChange={e => setRagSource(e.target.value)}
                  placeholder="Ví dụ: Bản quyền GDPT 2018 NXB GDVN"
                  className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Trích đoạn kiến thức lập chỉ mục vector:</label>
              <textarea
                rows={3}
                value={ragContent}
                onChange={e => setRagContent(e.target.value)}
                placeholder="Dán nội dung kiến thức cốt lõi tại đây..."
                className="w-full p-3 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleUploadRAG}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Lên & Chờ Duyệt Lập Chỉ Mục</span>
            </button>
          </div>

          {/* RAG Documents Table */}
          <div className="rounded-2xl cosmic-card border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 font-bold text-xs uppercase tracking-wider text-slate-400">
              Danh Mục Tài Liệu Kho Tri Thức RAG (Chỉ tài liệu 'Đã Duyệt' mới cung cấp cho AI - FR-CMS-17)
            </div>
            <div className="divide-y divide-white/5">
              {ragDocs.map(doc => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{doc.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {doc.status === 'approved' ? 'Đã duyệt' : 'Thu hồi'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Nguồn: {doc.source} • {doc.snippetCount} đoạn văn bản
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === 'approved' ? (
                      <button
                        onClick={() => toggleRAGDocStatus(doc.id, 'revoked')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-semibold"
                      >
                        Thu Hồi Quyền
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleRAGDocStatus(doc.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold"
                      >
                        Phê Duyệt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Essay Grading Workspace (FR-CMS-14) */}
      {activeTab === 'essay_grading' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Khu Vực Chấm Điểm Bài Tự Luận Ngữ Văn / Toán (FR-CMS-14)
            </h3>
            <p className="text-xs text-slate-400">
              QTND có quyền nhập điểm chính thức cho các câu tự luận và gửi phản hồi đến học sinh.
            </p>

            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Học sinh: Nguyễn Minh Quân (THPT Chuyên Hà Nội - Amsterdam)</span>
                <span className="text-cyan-300">Môn: Ngữ Văn 12</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-slate-300 leading-relaxed font-mono">
                "Việc chủ động học tập trong kỷ nguyên vũ trụ số không chỉ giúp chúng ta tiếp cận nguồn tri thức nhân loại một cách nhanh chóng, mà còn rèn luyện bản lĩnh tự định hướng..."
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Điểm chấm (Thang 4.0):</label>
                  <input
                    type="number"
                    step={0.25}
                    max={4.0}
                    value={essayScoreInput}
                    onChange={e => setEssayScoreInput(parseFloat(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#0c1126] border border-white/10 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nhận xét chi tiết của giáo viên:</label>
                  <input
                    type="text"
                    value={essayFeedbackInput}
                    onChange={e => setEssayFeedbackInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0c1126] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  gradeEssay('sub-001', essayScoreInput, essayFeedbackInput);
                  showToast('Đã cập nhật điểm tự luận chính thức và thông báo cho học sinh thành công!');
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Lưu & Công Bố Điểm Tự Luận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Question */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl cosmic-card border border-emerald-500/40 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Biên Soạn Câu Hỏi Mới</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Môn học:</label>
                <select
                  value={editingQuestion.subjectId}
                  onChange={e => setEditingQuestion({ ...editingQuestion, subjectId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#090d20] border border-white/10 text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Định dạng câu:</label>
                <select
                  value={editingQuestion.type}
                  onChange={e => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-[#090d20] border border-white/10 text-white"
                >
                  <option value="choice">Nhiều lựa chọn (A, B, C, D)</option>
                  <option value="true_false">Đúng / Sai 4 ý</option>
                  <option value="short_answer">Trả lời ngắn</option>
                  <option value="essay">Tự luận</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mức độ tư duy:</label>
                <select
                  value={editingQuestion.level}
                  onChange={e => setEditingQuestion({ ...editingQuestion, level: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-[#090d20] border border-white/10 text-white"
                >
                  <option value="nhan_biet">Nhận biết</option>
                  <option value="thong_hieu">Thông hiểu</option>
                  <option value="van_dung">Vận dụng</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Chủ đề kiến thức:</label>
              <input
                type="text"
                value={editingQuestion.topic}
                onChange={e => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nội dung đề bài (Hỗ trợ công thức):</label>
              <textarea
                rows={3}
                value={editingQuestion.content}
                onChange={e => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                placeholder="Nhập đề bài..."
                className="w-full p-3 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Lời giải chi tiết:</label>
              <textarea
                rows={3}
                value={editingQuestion.explanation}
                onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                placeholder="Nhập lời giải..."
                className="w-full p-3 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Lưu Câu Hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
