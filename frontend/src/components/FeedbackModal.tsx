import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { submitFeedback } = useApp();
  const [feedbackType, setFeedbackType] = useState<'general' | 'question_error' | 'lesson_error'>('general');
  const [content, setContent] = useState<string>('');

  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    submitFeedback(feedbackType, content);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContent('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl cosmic-card border border-indigo-500/40 relative space-y-4 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs uppercase font-bold text-cyan-400">
          <MessageSquare className="w-4 h-4" />
          <span>Hỗ Trợ & Góp Ý Sản Phẩm (FR-FB-02)</span>
        </div>
        <h3 className="text-xl font-bold text-white font-space">
          Gửi Phản Hồi Cho Ban Quản Trị
        </h3>
        <p className="text-xs text-slate-300">
          Mọi ý kiến của bạn đều giúp hệ thống hoàn thiện hơn cho toàn bộ học sinh THPT cả nước.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Loại phản hồi:</label>
            <select
              value={feedbackType}
              onChange={e => setFeedbackType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-white focus:outline-none"
            >
              <option value="general">Góp ý tính năng & trải nghiệm</option>
              <option value="question_error">Báo lỗi câu hỏi hoặc đề thi</option>
              <option value="lesson_error">Báo lỗi nội dung bài học</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Chi tiết đóng góp:</label>
            <textarea
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nhập nội dung chia sẻ hoặc đề xuất của bạn..."
              className="w-full p-3 rounded-xl bg-[#090d20] border border-white/10 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs space-y-1 animate-fadeIn">
            <p className="font-bold">Cảm ơn ý kiến đóng góp của bạn!</p>
            <p className="text-slate-300">Đội ngũ Scholyx sẽ ghi nhận và cải tiến liên tục.</p>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/5"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 fill-slate-950" />
              <span>Gửi Góp Ý</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
