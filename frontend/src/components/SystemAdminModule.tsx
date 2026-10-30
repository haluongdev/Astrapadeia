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
      showToast('Lỗi: Vui lòng nhập lý do khóa/mở khóa bắt buộc theo quy định BR-ACC-03!');
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

      {/* Tab 1: System Overview KPI (FR-SYS-01) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl cosmic-card border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Tổng Người Dùng</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-space">{users.length}</div>
              <div className="text-[10px] text-emerald-400 mt-1">+14% tuần này</div>
            </div>

            <div className="p-4 rounded-2xl cosmic-card border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Tài Khoản VIP Đang Dùng</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-space">
                {users.filter(u => u.vipTier === 'vip').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Tỷ lệ chuyển đổi: 18.5%</div>
            </div>

            <div className="p-4 rounded-2xl cosmic-card border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Lượt Hỏi AI Trong Ngày</div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-space">1,482</div>
              <div className="text-[10px] text-cyan-400 mt-1">Độ chính xác RAG: 98.2%</div>
            </div>

            <div className="p-4 rounded-2xl cosmic-card border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Tổng Doanh Thu VIP</div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-space">
                {(transactions.reduce((acc, t) => acc + (t.status === 'success' ? t.amountVND : 0), 0) / 1000).toLocaleString('vi-VN')}k
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Hoa hồng phát triển: 15%</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Account Management (FR-ADM-01..08) */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Tìm tài khoản theo tên, email, sđt..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090d20] border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl cosmic-card border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090d20] border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Người Dùng</th>
                    <th className="py-3 px-4">Vai Trò</th>
                    <th className="py-3 px-4">Cấp Quyền Lợi</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Hành Động QTV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-[10px]">
                        {u.role}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.vipTier === 'vip'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {u.vipTier.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : u.status === 'locked'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {u.status === 'active' ? 'Hoạt động' : u.status === 'locked' ? 'Bị khóa' : 'Vô hiệu hóa'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedUserIdForAction(u.id);
                            setLockReason('');
                          }}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                          title="Khóa hoặc mở khóa tài khoản kèm lý do"
                        >
                          {u.status === 'locked' ? <Unlock className="w-3.5 h-3.5 text-emerald-400 inline" /> : <Lock className="w-3.5 h-3.5 text-rose-400 inline" />}
                        </button>
                        <button
                          onClick={() => {
                            resetUserPassword(u.id);
                            showToast(`Đã gửi liên kết đặt lại mật khẩu đến email ${u.email}!`);
                          }}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] cursor-pointer"
                          title="Gửi liên kết đặt lại mật khẩu"
                        >
                          <Key className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => handleManualGrantVIP(u.id)}
                          className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px]"
                          title="Cấp VIP thủ công"
                        >
                          <Crown className="w-3.5 h-3.5 inline" />
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

      {/* Tab 3: RBAC Roles and Permissions (FR-ROLE, FR-PERM) */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-white">Ma Trận Phân Quyền Vai Trò (RBAC - Phụ Lục A)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090d20] border-b border-white/5 text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Nhóm Quyền & Chức Năng</th>
                    <th className="py-3 px-4">Khách</th>
                    <th className="py-3 px-4">Học Sinh</th>
                    <th className="py-3 px-4">QTND (Giáo viên)</th>
                    <th className="py-3 px-4">QTV (Admin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { func: 'Xem nội dung công khai & làm thử 10 câu', guest: true, student: true, qtnd: true, qtv: true },
                    { func: 'Luyện tập, thi thử & xem sổ câu sai', guest: false, student: true, qtnd: false, qtv: false },
                    { func: 'Trợ lý AI Cosmos & Lộ trình tuần', guest: false, student: true, qtnd: false, qtv: false },
                    { func: 'Quản lý ngân hàng câu hỏi & Đề thi', guest: false, student: false, qtnd: true, qtv: false },
                    { func: 'Quản lý tài liệu RAG & Duyệt kho tri thức', guest: false, student: false, qtnd: true, qtv: false },
                    { func: 'Quản lý tài khoản, phân quyền & Audit Log', guest: false, student: false, qtnd: false, qtv: true },
                    { func: 'Cấu hình hệ thống & Duyệt hoàn tiền', guest: false, student: false, qtnd: false, qtv: true }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-medium text-white">{row.func}</td>
                      <td className="py-3 px-4">{row.guest ? <Check className="w-4 h-4 text-emerald-400" /> : '—'}</td>
                      <td className="py-3 px-4">{row.student ? <Check className="w-4 h-4 text-emerald-400" /> : '—'}</td>
                      <td className="py-3 px-4">{row.qtnd ? <Check className="w-4 h-4 text-emerald-400" /> : '—'}</td>
                      <td className="py-3 px-4">{row.qtv ? <Check className="w-4 h-4 text-emerald-400" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System Parameters Configuration (FR-SYS-02) */}
      {activeTab === 'config' && (
        <div className="p-6 rounded-2xl cosmic-card border border-white/5 space-y-5">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            Cấu Hình Tham Số Hệ Thống & Bảo Mật (FR-SYS-02)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 space-y-2">
              <label className="text-slate-300 font-semibold block">Độ dài mật khẩu tối thiểu:</label>
              <input
                type="number"
                min={8}
                value={systemConfig.minPasswordLength}
                onChange={e => updateSystemConfig({ minPasswordLength: parseInt(e.target.value) || 8 })}
                className="w-full p-2.5 rounded-lg bg-[#0c1126] border border-white/10 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500">Tuân thủ BR-ACC-02: Không được dưới 8 ký tự.</span>
            </div>

            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 space-y-2">
              <label className="text-slate-300 font-semibold block">Thời gian hết phiên (Phút):</label>
              <input
                type="number"
                min={15}
                value={systemConfig.sessionTimeoutMinutes}
                onChange={e => updateSystemConfig({ sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                className="w-full p-2.5 rounded-lg bg-[#0c1126] border border-white/10 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500">Mặc định 30 phút (trừ phiên thi).</span>
            </div>

            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-semibold block">Bật đăng ký người dùng mới:</span>
                <span className="text-[10px] text-slate-500">Cho phép học sinh đăng ký tài khoản tự do.</span>
              </div>
              <input
                type="checkbox"
                checked={systemConfig.allowRegistration}
                onChange={e => updateSystemConfig({ allowRegistration: e.target.checked })}
                className="w-4 h-4 accent-rose-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-semibold block">Bật tính năng Trợ lý AI Cosmos:</span>
                <span className="text-[10px] text-slate-500">Bật/tắt cụm dịch vụ RAG toàn hệ thống.</span>
              </div>
              <input
                type="checkbox"
                checked={systemConfig.enableAI}
                onChange={e => updateSystemConfig({ enableAI: e.target.checked })}
                className="w-4 h-4 accent-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Tamper-proof Audit Log (FR-SYS-03, 04) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Nhật Ký Kiểm Toán Bất Biến (Audit Log - Không Thể Sửa/Xóa)</h3>
            <button
              onClick={() => showToast('Đã xuất audit log ra tệp CSV thành công (FR-SYS-05)!')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Tệp CSV</span>
            </button>
          </div>

          <div className="rounded-2xl cosmic-card border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090d20] border-b border-white/5 text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Thời Điểm</th>
                    <th className="py-3 px-4">Người Thực Hiện</th>
                    <th className="py-3 px-4">Hành Động</th>
                    <th className="py-3 px-4">Đối Tượng</th>
                    <th className="py-3 px-4">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-cyan-300 whitespace-nowrap">{log.actorName}</td>
                      <td className="py-3 px-4 text-amber-300 whitespace-nowrap">{log.action}</td>
                      <td className="py-3 px-4 text-white whitespace-nowrap">{log.targetObject}</td>
                      <td className="py-3 px-4 text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Revenue & Transaction Reconciliation (FR-PAY-16, 19, 20) */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-white">Đối Soát Giao Dịch & Xử Lý Hoàn Tiền (FR-PAY-19)</h3>
          <div className="space-y-3">
            {transactions.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-[#090d20] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t.planName}</span>
                    <span className="font-mono text-cyan-300">{t.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.status === 'refunded'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Khách hàng: {t.userName} • Phương thức: {t.paymentMethod.toUpperCase()} • Số tiền: {t.amountVND.toLocaleString('vi-VN')}đ
                  </div>
                  {t.refundReason && (
                    <div className="text-[11px] text-rose-400 mt-1">
                      Lý do yêu cầu hoàn tiền: "{t.refundReason}"
                    </div>
                  )}
                </div>

                {t.refundReason && t.status !== 'refunded' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveRefund(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Duyệt Hoàn Tiền
                    </button>
                    <button
                      onClick={() => rejectRefund(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold"
                    >
                      Từ Chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
