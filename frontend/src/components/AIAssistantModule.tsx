import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  BookOpen,
  Lock,
  Layers,
  HelpCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Question } from '../types';

interface AIAssistantModuleProps {
  onOpenVIPModal: () => void;
  injectedQuestion?: Question | null;
  onClearInjectedQuestion?: () => void;
}

export const AIAssistantModule: React.FC<AIAssistantModuleProps> = ({
  onOpenVIPModal,
  injectedQuestion,
  onClearInjectedQuestion
}) => {
  const {
    currentUser,
    aiMessages,
    aiDailyUsage,
    maxAIDailyUsage,
    sendAIMessage,
    rateAIMessage,
    reportAIMessage,
    clearAIChat
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const isLimitReached = aiDailyUsage >= maxAIDailyUsage;

  const quickPrompts = [
    'Giải thích cấu trúc đề thi tốt nghiệp THPT 2025 theo Quyết định 764?',
    'Cách xét tính đồng biến, nghịch biến của hàm phân thức bậc nhất / bậc nhất?',
    'Phương pháp tính nhanh toạ độ hình chiếu điểm lên mặt phẳng trong Oxyz?',
    'Định luật I của nhiệt động lực học và quy ước dấu của nhiệt lượng Q, công A?'
  ];

  const handleSend = async (textToSend?: string) => {
    const message = textToSend || inputPrompt;
    if (!message.trim() || isGenerating) return;

    if (isLimitReached) {
      onOpenVIPModal();
      return;
    }

    setIsGenerating(true);
    setInputPrompt('');
    try {
      await sendAIMessage(message, injectedQuestion || undefined);
      if (onClearInjectedQuestion) onClearInjectedQuestion();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-indigo-500/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400">
            <Bot className="w-4 h-4" />
            <span>Trợ Lý Trí Tuệ Nhân Tạo RAG (AI COSMOS)</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/30 normal-case tracking-normal">
              Trợ Lý AI – Chế Độ Mô Phỏng
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Cosmos - Trợ Lý Học Tập Vũ Trụ THPT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Giải đáp dựa trên kho tri thức đã duyệt (SGK GDPT 2018, QĐ 764 Bộ GD&ĐT), kèm trích dẫn nguồn
          </p>
        </div>

        {/* Daily Quota Counter (FR-AI-11) */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#090d20] border border-white/10 text-xs">
            <span className="text-slate-400">Hạn mức hỏi hôm nay: </span>
            <strong className={isLimitReached ? 'text-rose-400' : 'text-cyan-300'}>
              {aiDailyUsage} / {maxAIDailyUsage}
            </strong>
          </div>

          <button
            onClick={clearAIChat}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Làm mới cuộc trò chuyện (FR-AI-10)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning Disclaimer Banner (FR-AI-12) */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Lưu ý quan trọng:</strong> Câu trả lời của Trợ lý AI mang tính tham khảo và hỗ trợ tự học, bạn nên đối chiếu lại với Sách giáo khoa hoặc thầy cô bộ môn.
          </span>
        </div>
      </div>

      {aiNotice && (
        <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between animate-fadeIn">
          <span>{aiNotice}</span>
          <button
            onClick={() => setAiNotice(null)}
            className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Injected Context from Practice / Exam */}
      {injectedQuestion && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-cyan-400/30 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-cyan-300">Đang ghim ngữ cảnh câu hỏi:</span>
            <p className="text-slate-200 line-clamp-1">{injectedQuestion.content}</p>
          </div>
          <button
            onClick={onClearInjectedQuestion}
            className="px-2 py-1 rounded bg-white/10 text-slate-300 hover:text-white"
          >
            Bỏ ghim
          </button>
        </div>
      )}

      {/* Chat Messages Viewport */}
      <div className="rounded-2xl cosmic-card border border-white/5 overflow-hidden flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {aiMessages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {isUser ? 'Bạn' : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#0a0f24] border border-white/10 text-slate-200 rounded-tl-none space-y-3'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.content}</div>

                  {/* Sources citation (FR-AI-02) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-white/10 text-[11px] text-cyan-300/90 flex flex-wrap items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold">Nguồn tham chiếu đã duyệt:</span>
                      {msg.sources.map((s, idx) => (
                        <span key={idx} className="bg-white/5 px-2 py-0.5 rounded text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rating & Report feedback buttons (FR-AI-09) */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-500">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => rateAIMessage(msg.id, 'helpful')}
                          className={`p-1 rounded hover:text-emerald-400 ${
                            msg.feedback === 'helpful' ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                          title="Hữu ích"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => rateAIMessage(msg.id, 'not_helpful')}
                          className={`p-1 rounded hover:text-rose-400 ${
                            msg.feedback === 'not_helpful' ? 'text-rose-400' : 'text-slate-400'
                          }`}
                          title="Chưa hữu ích"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            reportAIMessage(msg.id);
                            setAiNotice('Đã ghi nhận báo cáo phản hồi câu trả lời đến ban biên tập!');
                            setTimeout(() => setAiNotice(null), 3500);
                          }}
                          className={`p-1 rounded hover:text-amber-400 cursor-pointer ${
                            msg.reported ? 'text-amber-400' : 'text-slate-400'
                          }`}
                          title="Báo cáo câu trả lời sai hoặc không phù hợp"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-3 max-w-2xl animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#0a0f24] border border-white/10 rounded-tl-none space-y-3 w-full">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Cosmos đang đối chiếu kho tri thức GDPT 2018 và soạn thảo...</span>
                </div>
                {/* Skeleton Loading Lines (Skeleton loading animation) */}
                <div className="space-y-2 pt-1">
                  <div className="h-4 skeleton-shimmer rounded-lg w-full" />
                  <div className="h-4 skeleton-shimmer rounded-lg w-5/6" />
                  <div className="h-4 skeleton-shimmer rounded-lg w-4/6" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-5 py-2.5 bg-[#080c1d] border-t border-white/5 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">
            Gợi ý:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 py-1 rounded-full whitespace-nowrap transition border border-white/5"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#090d20] border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isGenerating || isLimitReached}
            placeholder={
              isLimitReached
                ? 'Bạn đã đạt giới hạn lượt hỏi trong ngày. Hãy nâng cấp VIP để tiếp tục!'
                : 'Đặt câu hỏi môn Toán, Lí, Hóa, Văn hoặc cấu trúc thi THPT...'
            }
            className="flex-1 px-4 py-3 rounded-xl bg-[#0c1126] border border-white/10 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:border-cyan-400 focus:outline-none disabled:opacity-50"
          />

          <button
            onClick={() => handleSend()}
            disabled={isGenerating || !inputPrompt.trim() || isLimitReached}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:opacity-90 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
