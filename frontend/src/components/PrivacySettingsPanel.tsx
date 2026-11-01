import React, { useEffect, useState } from 'react';
import { authApi } from '../services/authApi';
import { useApp } from '../context/AppContext';

export const PrivacySettingsPanel: React.FC = () => {
  const { updateProfile, currentUser } = useApp();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [deletionRequested, setDeletionRequested] = useState(false);

  useEffect(() => {
    let active = true;
    authApi.profile().then((data: any) => {
      if (!active) return;
      setEnabled(Boolean(data.profile?.ai_personalization));
      if (currentUser.role === 'student') updateProfile({ allowAIPersonalization: Boolean(data.profile?.ai_personalization) });
    }).catch((e: unknown) => {
      if (active) setNotice(e instanceof Error ? e.message : 'Không thể tải cài đặt');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const saveAi = async () => {
    if (busy || loading) return;
    setBusy(true); setNotice('');
    try {
      await authApi.updateProfile({ allowAiPersonalization: !enabled });
      const confirmed: any = await authApi.profile();
      if (Boolean(confirmed.profile?.ai_personalization) !== !enabled) {
        throw new Error('Máy chủ chưa xác nhận lựa chọn Trợ lý AI.');
      }
      setEnabled(!enabled);
      updateProfile({ allowAIPersonalization: !enabled });
      setNotice('Đã lưu lựa chọn Trợ lý AI vào PostgreSQL.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Không thể lưu lựa chọn');
    } finally { setBusy(false); }
  };

  const download = async () => {
    setBusy(true); setNotice('');
    try {
      const data = await authApi.exportProfile();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scholyx-du-lieu-ca-nhan.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice('Đã yêu cầu tải dữ liệu JSON. Tệp này có thể chứa thông tin cá nhân; hãy giữ an toàn.');
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Không thể tải dữ liệu'); }
    finally { setBusy(false); }
  };

  const requestDelete = async () => {
    if (busy || !window.confirm('Bạn muốn GỬI YÊU CẦU xóa dữ liệu? Yêu cầu này KHÔNG xóa tài khoản ngay lập tức.')) return;
    setBusy(true); setNotice('');
    try {
      await authApi.requestDeletion();
      setDeletionRequested(true);
      setNotice('Đã gửi yêu cầu xóa dữ liệu. Tài khoản chưa bị xóa.');
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Không thể gửi yêu cầu'); }
    finally { setBusy(false); }
  };

  return (
    <section className="max-w-3xl mx-auto p-5 sm:p-8 cosmic-card rounded-3xl border border-indigo-500/30 space-y-6 text-white">
      <header className="space-y-2 text-center">
        <p className="text-xs font-bold text-cyan-400 uppercase">Màn hình 20 · Cài đặt & Quyền riêng tư</p>
        <h2 className="text-2xl sm:text-3xl font-bold">Cài Đặt & Quyền Riêng Tư</h2>
        <p className="text-sm text-slate-300">Quản lý lựa chọn về dữ liệu cá nhân. Hồ sơ và mục tiêu học tập có mục riêng trong menu tài khoản.</p>
      </header>
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <h3 className="font-semibold">Bật / tắt Trợ lý AI Cosmos (mô phỏng)</h3>
        <p className="text-sm text-slate-300">Tắt sẽ chặn gửi câu hỏi mới đến Cosmos mô phỏng. Các tích hợp AI khác cần được kiểm tra riêng trước khi triển khai thật.</p>
        <button type="button" disabled={loading || busy} onClick={saveAi}
          className="px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-50 font-semibold">
          {loading ? 'Đang tải…' : enabled ? 'Đang bật · Nhấn để tắt' : 'Đang tắt · Nhấn để bật'}
        </button>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <h3 className="font-semibold">Tải dữ liệu cá nhân</h3>
        <p className="text-sm text-slate-300">Tải bản JSON mà API hiện hỗ trợ: thông tin tài khoản, hồ sơ và yêu cầu xóa. Chưa bao gồm toàn bộ lịch sử học tập.</p>
        <button type="button" disabled={busy || loading} onClick={download}
          className="px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-50 font-semibold">Tải dữ liệu JSON</button>
      </div>
      <div className="rounded-xl border border-rose-500/30 bg-black/20 p-4 space-y-3">
        <h3 className="font-semibold">Yêu cầu xóa tài khoản và dữ liệu</h3>
        <p className="text-sm text-slate-300">Chỉ ghi nhận yêu cầu để xử lý, không tự động xóa tài khoản hoặc dữ liệu.</p>
        <button type="button" disabled={busy || loading || deletionRequested} onClick={requestDelete}
          className="px-4 py-2 rounded-lg bg-rose-700 disabled:opacity-50 font-semibold">
          {deletionRequested ? 'Đã gửi yêu cầu' : 'Gửi yêu cầu xóa dữ liệu'}
        </button>
      </div>
      {notice && <p role="status" className="rounded-lg bg-indigo-500/15 border border-indigo-400/30 p-3 text-sm">{notice}</p>}
    </section>
  );
};
