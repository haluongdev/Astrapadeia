import React from 'react';
import { Compass, Sparkles, Network } from 'lucide-react';
import { ScreenId } from '../../types';
import { getScreenMetadata } from '../../routes/screenRegistry';

interface ScreenPlaceholderProps {
  screenId: ScreenId;
  onNavigate: (screenId: ScreenId) => void;
}

export const ScreenPlaceholder: React.FC<ScreenPlaceholderProps> = ({ screenId, onNavigate }) => {
  const meta = getScreenMetadata(screenId);

  if (!meta) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-3xl cosmic-card border border-rose-500/30 text-center space-y-6 shadow-2xl relative">
        <h2 className="text-2xl font-extrabold text-white font-space">Màn Hình Không Tồn Tại</h2>
        <p className="text-xs text-slate-300">Mã [{screenId}] không hợp lệ.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
        >
          Về Trang Chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-3xl cosmic-card border border-indigo-500/30 text-center space-y-6 shadow-2xl relative">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400/20 via-indigo-600/30 to-purple-600/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mx-auto shadow-inner">
        <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
          <span>Màn hình {meta.screenNumber}</span>
          <span>•</span>
          <span>{meta.category}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
          {meta.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          {meta.description}
        </p>

        <div className="text-[11px] font-mono text-cyan-400 bg-white/5 py-1 px-3 rounded-lg inline-block border border-white/5">
          #{meta.path}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#090d20] border border-white/5 text-xs text-slate-400 max-w-md mx-auto">
        Màn hình đã được kết nối trong hệ thống định tuyến Scholyx chuẩn Figma và ISO/IEC/IEEE 29148. Logic nghiệp vụ chi tiết sẽ tiếp tục hoàn thiện trong các giai đoạn kế tiếp.
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('home')}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 hover:brightness-110 transition interactive-bounce flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Quay Về Trang Chủ</span>
        </button>

        <button
          onClick={() => onNavigate('system-flow')}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 border border-white/10"
        >
          <Network className="w-4 h-4 text-cyan-400" />
          <span>Xem Bản Đồ 30 Màn Hình</span>
        </button>
      </div>
    </div>
  );
};
