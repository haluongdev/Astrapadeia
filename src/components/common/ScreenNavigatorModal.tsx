import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  ExternalLink,
  BookOpen,
  Award,
  PenTool,
  Bot,
  Crown,
  Settings,
  ShieldCheck,
  User,
  Users,
  Key,
  Shield,
  FileText,
  Zap,
  Sliders,
  AlertOctagon,
  Network
} from 'lucide-react';
import { ScreenId, UserRole } from '../../types';
import { SCREEN_REGISTRY, SCREEN_CATEGORIES, getScreenMetadata, canAccessScreen } from '../../routes/screenRegistry';
import { useApp } from '../../context/AppContext';

interface ScreenNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScreen: (screenId: ScreenId) => void;
}

export const ScreenNavigatorModal: React.FC<ScreenNavigatorModalProps> = ({
  isOpen,
  onClose,
  onSelectScreen
}) => {
  const { currentUser, switchRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredScreens = SCREEN_REGISTRY.filter(screen => {
    const matchCategory = selectedCategory === 'all' || screen.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchCategory;

    const matchTitle = screen.title.toLowerCase().includes(q);
    const matchNumber = screen.screenNumber.includes(q);
    const matchPath = screen.path.toLowerCase().includes(q);
    const matchDesc = screen.description.toLowerCase().includes(q);

    return matchCategory && (matchTitle || matchNumber || matchPath || matchDesc);
  });

  const handleSelect = (screenId: ScreenId) => {
    onSelectScreen(screenId);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl cosmic-card border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-[#090d22] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base font-space">
                  Điều Hướng 30 Màn Hình Figma Scholyx
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Chuẩn GDPT 2018
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Nhập số màn hình (01–30) hoặc tên chức năng để chuyển ngay
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-[#0c112b] border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số (01-30), tên màn hình, đường dẫn, từ khóa nghiệp vụ..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
            >
              Xóa
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
            ESC đóng
          </kbd>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2.5 bg-[#090d20] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Tất cả ({SCREEN_REGISTRY.length})
          </button>
          {SCREEN_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Screen Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredScreens.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Không tìm thấy màn hình phù hợp</p>
              <p className="text-xs">Hãy thử tìm số 01, 07, 10, 18, 23 hoặc từ khóa "luyện tập", "đề thi", "RAG"...</p>
            </div>
          ) : (
            filteredScreens.map(screen => {
              const access = canAccessScreen(currentUser, screen);
              return (
                <div
                  key={screen.id}
                  onClick={() => handleSelect(screen.id)}
                  className={`group p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 box-lift-subtle ${
                    access.allowed
                      ? 'bg-[#090d20] hover:bg-[#101538] border-white/5 hover:border-cyan-500/40'
                      : 'bg-[#070a1a] hover:bg-[#0c102b] border-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Screen Number Badge */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono font-bold text-sm shrink-0 transition ${
                      access.allowed
                        ? 'bg-gradient-to-br from-indigo-900/60 to-cyan-950/60 border-indigo-500/30 text-cyan-300 group-hover:border-cyan-400 group-hover:scale-105'
                        : 'bg-rose-950/30 border-rose-500/20 text-rose-300/80'
                    }`}>
                      {screen.screenNumber}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                          {screen.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          #{screen.path}
                        </span>
                        {!access.allowed && (
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-bold border ${
                            access.reason === 'vip_required'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : access.reason === 'not_logged_in'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {access.reason === 'vip_required'
                              ? 'Yêu cầu VIP'
                              : access.reason === 'not_logged_in'
                              ? 'Cần đăng nhập'
                              : 'Giới hạn vai trò'}
                          </span>
                        )}
                        {access.allowed && screen.badge && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {screen.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          [{screen.category}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                        {screen.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition flex items-center gap-1">
                      <span>{access.allowed ? 'Mở' : 'Chi tiết'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer with quick shortcuts */}
        <div className="p-3.5 bg-[#080c1d] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Vai trò đang test: <strong className="text-white capitalize">{currentUser.role}</strong> ({currentUser.vipTier.toUpperCase()})</span>
            <button
              onClick={() => {
                onSelectScreen('system-flow');
                onClose();
              }}
              className="text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <Network className="w-3 h-3" />
              <span>Xem Bản đồ luồng hệ thống (00)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Tổng cộng: <strong className="text-slate-300">{SCREEN_REGISTRY.length} màn hình Figma</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
