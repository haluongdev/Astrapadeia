import React from 'react';
import { ChevronRight, Home, Copy, Check, Sparkles } from 'lucide-react';
import { ScreenId } from '../../types';
import { getScreenMetadata } from '../../routes/screenRegistry';

interface BreadcrumbsProps {
  currentScreenId: ScreenId;
  onNavigate: (screenId: ScreenId) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentScreenId, onNavigate }) => {
  const currentScreen = getScreenMetadata(currentScreenId);
  const [copied, setCopied] = React.useState(false);

  if (!currentScreen) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-4 rounded-xl cosmic-glass border border-white/5 text-xs text-slate-400 mb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition interactive-bounce"
            title="Trang chủ SCHOLYX"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">SCHOLYX</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-rose-400 font-bold">404 - Không tìm thấy màn hình ({currentScreenId})</span>
        </nav>
      </div>
    );
  }

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${window.location.pathname}#${currentScreen.path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-4 rounded-xl cosmic-glass border border-white/5 text-xs text-slate-400 mb-6">
      {/* Path trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition interactive-bounce"
          title="Trang chủ Scholyx"
        >
          <Home className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">Scholyx</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

        <span className="text-slate-400">{currentScreen.category}</span>

        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

        <span className="font-bold text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
          <span className="font-mono text-cyan-400 text-[10px]">{currentScreen.screenNumber}</span>
          <span>{currentScreen.title.replace(/^\d+\s*·\s*/, '')}</span>
          {currentScreen.badge && (
            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {currentScreen.badge}
            </span>
          )}
        </span>
      </nav>

      {/* Direct Identifier & Copy Link button */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
          #{currentScreen.path}
        </span>
        <button
          onClick={handleCopyLink}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 transition flex items-center gap-1 interactive-bounce text-[11px]"
          title="Sao chép đường dẫn trực tiếp đến màn hình này"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Chép link</span>
            </>
          )}
        </button>

        <button
          onClick={() => onNavigate('system-flow')}
          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px] flex items-center gap-1 transition interactive-bounce"
          title="Mở bản đồ luồng 30 màn hình Figma"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Bản đồ luồng (00)</span>
        </button>
      </div>
    </div>
  );
};
