import React, { useState } from 'react';
import {
  Compass,
  LogIn,
  UserPlus,
  ShieldCheck,
  Key,
  Target,
  LayoutDashboard,
  BookOpen,
  FileText,
  PenTool,
  Zap,
  AlertOctagon,
  Award,
  Clock,
  BarChart3,
  Layers,
  Calendar,
  Bot,
  Crown,
  Settings,
  HelpCircle,
  Sparkles,
  Edit3,
  Upload,
  MessageSquare,
  Users,
  Sliders,
  Network,
  Lock,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { ScreenId, UserRole } from '../../types';
import { SCREEN_REGISTRY, SCREEN_CATEGORIES, getScreenMetadata, canAccessScreen } from '../../routes/screenRegistry';
import { useApp } from '../../context/AppContext';

interface CosmicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreenId: ScreenId;
  onNavigate: (screenId: ScreenId) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Compass,
  LogIn,
  UserPlus,
  ShieldCheck,
  Key,
  Target,
  LayoutDashboard,
  BookOpen,
  FileText,
  PenTool,
  Zap,
  AlertOctagon,
  Award,
  Clock,
  BarChart3,
  Layers,
  Calendar,
  Bot,
  Crown,
  Settings,
  HelpCircle,
  Sparkles,
  Edit3,
  Upload,
  MessageSquare,
  Users,
  Sliders,
  Network
};

export const CosmicSidebar: React.FC<CosmicSidebarProps> = ({
  isOpen,
  onClose,
  activeScreenId,
  onNavigate
}) => {
  const { currentUser, switchRole } = useApp();
  const [sidebarFilter, setSidebarFilter] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Default open all
    const initial: Record<string, boolean> = {};
    SCREEN_CATEGORIES.forEach(c => (initial[c] = true));
    return initial;
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Centralized RBAC Check using canAccessScreen
  const accessibleCount = SCREEN_REGISTRY.filter(s => canAccessScreen(currentUser, s).allowed).length;

  const filteredScreens = SCREEN_REGISTRY.filter(s => {
    if (!sidebarFilter.trim()) return true;
    const q = sidebarFilter.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.screenNumber.includes(q) ||
      s.path.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-80 bg-[#080c1d]/95 backdrop-blur-2xl border-r border-indigo-900/30 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="h-16 px-4 border-b border-indigo-900/40 flex items-center justify-between gap-3 bg-[#0a0f24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="font-extrabold text-sm font-space text-white tracking-wide flex items-center gap-1.5">
                <span>SCHOLYX SITEMAP</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-indigo-500/20 text-cyan-300">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[10px] text-cyan-400 font-medium -mt-0.5">
                {accessibleCount} / 30 Màn hình khả dụng
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Đóng sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar inside sidebar */}
        <div className="p-3 border-b border-white/5 bg-[#070a18]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={sidebarFilter}
              onChange={e => setSidebarFilter(e.target.value)}
              placeholder="Lọc 30 màn hình (tên, số)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0e1329] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {sidebarFilter && (
              <button
                onClick={() => setSidebarFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Screen list grouped by Category */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {SCREEN_CATEGORIES.map(category => {
            const catScreens = filteredScreens.filter(s => s.category === category);
            if (catScreens.length === 0) return null;
            const isExpanded = expandedCategories[category] !== false;

            return (
              <div key={category} className="space-y-1">
                {/* Category Accordion Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
                >
                  <span className="truncate">{category}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                    <span>{catScreens.length}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </span>
                </button>

                {/* Screens in this category */}
                {isExpanded && (
                  <div className="space-y-0.5 pl-1">
                    {catScreens.map(screen => {
                      const isActive = activeScreenId === screen.id;
                      const access = canAccessScreen(currentUser, screen);
                      const Icon = !access.allowed ? Lock : (ICON_MAP[screen.iconName] || FileText);

                      return (
                        <button
                          key={screen.id}
                          onClick={() => {
                            onNavigate(screen.id);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between gap-2 group ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600/50 to-cyan-600/30 text-cyan-300 font-bold border border-cyan-400/40 shadow-sm'
                              : !access.allowed
                              ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200 opacity-80'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] shrink-0 font-bold ${
                                isActive
                                  ? 'bg-cyan-400 text-slate-950'
                                  : !access.allowed
                                  ? 'bg-rose-950/30 text-rose-400/80 border border-rose-500/20'
                                  : 'bg-white/5 text-slate-400 group-hover:text-cyan-300'
                              }`}
                            >
                              {screen.screenNumber}
                            </span>
                            <span className="truncate">{screen.title.replace(/^\d+\s*·\s*/, '')}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {!access.allowed && (
                              <span className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                access.reason === 'vip_required'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : access.reason === 'not_logged_in'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {access.reason === 'vip_required' ? 'VIP' : access.reason === 'not_logged_in' ? 'LOGIN' : 'KHÓA'}
                              </span>
                            )}
                            {access.allowed && screen.badge && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {screen.badge}
                              </span>
                            )}
                            <Icon
                              className={`w-3.5 h-3.5 transition ${
                                isActive
                                  ? 'text-cyan-400'
                                  : !access.allowed
                                  ? 'text-slate-500'
                                  : 'text-slate-500 group-hover:text-slate-300'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-white/5 bg-[#070a18] text-[11px] text-slate-400 flex items-center justify-between">
          <button
            onClick={() => {
              onNavigate('system-flow');
              if (window.innerWidth < 1024) onClose();
            }}
            className="font-bold text-cyan-300 hover:underline flex items-center gap-1.5"
          >
            <Network className="w-3.5 h-3.5" />
            <span>00 · Bản đồ luồng</span>
          </button>
          <span className="text-slate-500">v1.0 THPT 2026</span>
        </div>
      </aside>
    </>
  );
};
