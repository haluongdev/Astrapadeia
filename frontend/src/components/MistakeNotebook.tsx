import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Search,
  BookOpen,
  Filter,
  Check,
  Bot,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Question } from '../types';

interface MistakeNotebookProps {
  onAskAIQuestion: (question: Question) => void;
  onOpenPracticeWithMistakes: () => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  onAskAIQuestion,
  onOpenPracticeWithMistakes
}) => {
  const { mistakeItems, questions, subjects, resolveMistake } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMistakes = mistakeItems.filter(m => {
    const matchSub = selectedSubject === 'all' || m.subjectId === selectedSubject;
    const matchStatus =
      filterResolved === 'all'
        ? true
        : filterResolved === 'unresolved'
        ? !m.resolved
        : m.resolved;
    const matchQuery =
      !searchQuery.trim() ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userLastAnswer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSub && matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-rose-500/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-rose-400">
            <AlertOctagon className="w-4 h-4" />
            <span>Sổ Câu Sai Tự Động (FR-PRAC-09)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Nhật Ký Lỗ Hổng Kiến Thức & Ôn Lại Trọng Điểm
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hệ thống tự động ghi nhận các câu bạn đã làm sai để tập trung sửa sai triệt để
          </p>
        </div>

        {mistakeItems.length > 0 && (
          <button
            onClick={onOpenPracticeWithMistakes}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 transition self-start md:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện Lại Tất Cả Câu Sai</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo chủ đề câu sai hoặc đáp án nhầm..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c1126] border border-white/10 text-slate-200 placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Subject filter */}
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-[#0c1126] border border-white/10 text-slate-300 text-xs focus:outline-none"
        >
          <option value="all">Tất cả môn học</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Resolution status filter */}
        <div className="flex items-center gap-1 bg-[#0a0e22] p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          <button
            onClick={() => setFilterResolved('unresolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterResolved === 'unresolved' ? 'bg-rose-500/30 text-rose-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chưa Khắc Phục
          </button>
          <button
            onClick={() => setFilterResolved('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterResolved === 'resolved' ? 'bg-emerald-500/30 text-emerald-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã Khắc Phục
          </button>
          <button
            onClick={() => setFilterResolved('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterResolved === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả
          </button>
        </div>
      </div>

      {/* Mistakes List */}
      {filteredMistakes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl cosmic-card border border-white/5 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Tuyệt Vời! Không Có Câu Sai Nào Trong Mục Này</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mọi bài học và đề thi đều được bạn hoàn thành xuất sắc hoặc đã khắc phục hoàn toàn.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map(item => {
            const q = questions.find(question => question.id === item.questionId);
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl cosmic-card border transition space-y-3 ${
                  item.resolved ? 'border-emerald-500/30 opacity-75' : 'border-rose-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-300">
                      {subjects.find(s => s.id === item.subjectId)?.name || item.subjectId.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{item.topic}</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                      Sai {item.failedCount} lần
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">Lần cuối: {item.lastFailedAt}</span>
                </div>

                {/* Question snippet */}
                {q ? (
                  <p className="text-sm text-slate-100 font-medium whitespace-pre-line">{q.content}</p>
                ) : (
                  <p className="text-sm text-slate-300">{item.topic}</p>
                )}

                {/* Wrong answer record */}
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200">
                  <span className="font-bold">Lần làm gần nhất:</span> {item.userLastAnswer}
                </div>

                {/* Solution snippet if question found */}
                {q && (
                  <div className="p-3.5 rounded-xl bg-[#090d20] border border-cyan-500/20 text-xs space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Lời giải chuẩn:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">{q.explanation}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {q && (
                      <button
                        onClick={() => onAskAIQuestion(q)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Bot className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Hỏi AI giải thích</span>
                      </button>
                    )}
                  </div>

                  {!item.resolved ? (
                    <button
                      onClick={() => resolveMistake(item.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Đánh Dấu Đã Nắm Vững</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Đã khắc phục
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
