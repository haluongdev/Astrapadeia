import { SYSSettingsReal, SYSVipReal } from './SYSVipReal';
import { SystemRealPanel } from './SystemRealPanels';
import { RBACAdminReal } from './RBACAdminReal';
import { AdminAccountsReal } from './AdminAccountsReal';
import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Key,
  Sliders,
  FileText,
  DollarSign,
  Search,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
  Crown,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SystemAdminModuleProps {
  initialTab?: 'overview' | 'accounts' | 'roles' | 'config' | 'audit' | 'revenue';
}

export const SystemAdminModule: React.FC<SystemAdminModuleProps> = ({ initialTab = 'overview' }) => {
  const {
    users,
    systemConfig,
    auditLogs,
    transactions,
    updateSystemConfig,
    lockUnlockUser,
    resetUserPassword,
    deleteUser,
    manualGrantVIP,
    approveRefund,
    rejectRefund,
    approveTransaction,
    rejectTransaction
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'roles' | 'config' | 'audit' | 'revenue'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [lockReason, setLockReason] = useState<string>('');
  const [selectedUserIdForAction, setSelectedUserIdForAction] = useState<string | null>(null);

  // Manual grant VIP state
  const [manualVipDays, setManualVipDays] = useState<number>(30);
  const [manualVipReason, setManualVipReason] = useState<string>('Học sinh đạt giải nhất kỳ thi Olympic Scholyx');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => {
      setAdminNotice(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const handleToggleLock = () => {
    if (!selectedUserIdForAction || !lockReason.trim()) {
      showToast('Lỗi: Vui lòng nhập lý do khóa/mở khóa bắt buộc theo quy định!');
      return;
    }
    lockUnlockUser(selectedUserIdForAction, lockReason);
    showToast(`Đã cập nhật trạng thái khóa tài khoản thành công!`);
    setSelectedUserIdForAction(null);
    setLockReason('');
  };

  const handleManualGrantVIP = (userId: string) => {
    if (!manualVipReason.trim()) {
      showToast('Lỗi: Vui lòng nhập lý do cấp VIP!');
      return;
    }
    manualGrantVIP(userId, manualVipDays, manualVipReason);
    showToast(`Đã cấp ${manualVipDays} ngày VIP cho người dùng!`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl cosmic-card border border-rose-500/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-rose-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Quản Trị Hệ Thống (SYS / ADM / ROLE / PERM)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-space mt-1">
            Trung Tâm Kiểm Soát & Bảo Mật Toàn Hệ Thống
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dành cho QTV: Quản lý người dùng, phân quyền RBAC, nhật ký kiểm toán Audit Log và kinh doanh gói VIP
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-1 bg-[#0a0e22] p-1 rounded-xl border border-white/5 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng Quan' },
            { id: 'accounts', label: 'Tài Khoản' },
            { id: 'roles', label: 'Vai Trò & Quyền' },
            { id: 'config', label: 'Cấu Hình' },
            { id: 'audit', label: 'Audit Log' },
            { id: 'revenue', label: 'Doanh Thu' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === t.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {adminNotice && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between animate-fadeIn">
          <span>{adminNotice}</span>
          <button
            onClick={() => setAdminNotice(null)}
            className="text-slate-400 hover:text-white text-xs ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* SYS real data: overview */}
      {activeTab === 'overview' && <SystemRealPanel view="overview" />}

      {/* Tab 2: Account Management (FR-ADM-01..08) */}
      {activeTab === 'accounts' && <AdminAccountsReal />}

      {/* Tab 3: Database-backed RBAC */}
      {activeTab === 'roles' && <RBACAdminReal />}

      {/* SYS real data: config */}
      {activeTab === 'config' && <SYSSettingsReal />}

      {/* SYS real data: audit */}
      {activeTab === 'audit' && <SystemRealPanel view="audit" />}

      {activeTab === 'revenue' && <SYSVipReal />}

      {/* Lock/Unlock Dialog */}
      {selectedUserIdForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl cosmic-card border border-rose-500/40 space-y-4">
            <h4 className="font-bold text-white text-base">Khóa / Mở Khóa Tài Khoản (Bắt Buộc Nhập Lý Do)</h4>
            <textarea
              rows={3}
              value={lockReason}
              onChange={e => setLockReason(e.target.value)}
              placeholder="Nhập lý do theo quy định an toàn hệ thống..."
              className="w-full p-3 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedUserIdForAction(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                onClick={handleToggleLock}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Xác Nhận Thực Hiện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
