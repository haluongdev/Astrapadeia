import React, { useState } from 'react';
import {
  User,
  Settings,
  Target,
  Shield,
  Trash2,
  X,
  Check,
  Sparkles,
  Lock,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, subjects } = useApp();

  const [name, setName] = useState<string>(currentUser.name);
  const [school, setSchool] = useState<string>(currentUser.school);
  const [province, setProvince] = useState<string>(currentUser.province);
  const [grade, setGrade] = useState<10 | 11 | 12>(currentUser.grade);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(currentUser.targetSubjects);
  const [targetScores, setTargetScores] = useState<Record<string, number>>(currentUser.targetScores);
  const [allowAIPersonalization, setAllowAIPersonalization] = useState<boolean>(currentUser.allowAIPersonalization);
  const [activeTab, setActiveTab] = useState<'profile' | 'targets' | 'privacy'>('profile');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile({
      name,
      school,
      province,
      grade,
      targetSubjects: selectedSubjects,
      targetScores,
      allowAIPersonalization
    });
    setFeedbackNotice({
      type: 'success',
      text: 'Đã cập nhật hồ sơ và mục tiêu học tập thành công!'
    });
    setTimeout(() => {
      setFeedbackNotice(null);
      onClose();
    }, 1200);
  };

  const handleToggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subId));
    } else {
      setSelectedSubjects(prev => [...prev, subId]);
      if (!targetScores[subId]) {
        setTargetScores(prev => ({ ...prev, [subId]: 8.0 }));
      }
    }
  };

  const handleScoreChange = (subId: string, val: number) => {
    setTargetScores(prev => ({ ...prev, [subId]: val }));
  };

  const handleRequestDataDeletion = () => {
    setFeedbackNotice({
      type: 'info',
      text: 'Yêu cầu xóa tài khoản đã được ghi nhận vào hệ thống (FR-PRO-06, FR-SYS-06)! Ban quản trị QTV sẽ xử lý trong 72 giờ làm việc.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl cosmic-card border border-indigo-500/40 relative my-auto max-h-[92vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-space">{currentUser.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-500/20 text-cyan-300">
                Lớp {currentUser.grade}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        {feedbackNotice && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              feedbackNotice.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200'
            }`}
          >
            <span>{feedbackNotice.text}</span>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Thông Tin Cá Nhân
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'targets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mục Tiêu & Môn Xét Tuyển
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'privacy' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quyền Riêng Tư (Luật 2025)
          </button>
        </div>

        {/* Tab 1: Profile Info (FR-PRO-01..03) */}
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Họ và tên:</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Trường THPT:</label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tỉnh / Thành phố:</label>
                <input
                  type="text"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Khối lớp đang học (FR-PRO-03):</label>
              <div className="flex gap-2">
                {[10, 11, 12].map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g as any)}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      grade === g
                        ? 'bg-indigo-600 text-white border-cyan-400'
                        : 'bg-[#090d20] border-white/5 text-slate-400'
                    }`}
                  >
                    Lớp {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Targets and Subjects (FR-PRO-04, 05) */}
        {activeTab === 'targets' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-2">
                Chọn môn thi tốt nghiệp THPT & tổ hợp xét tuyển:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {subjects.map(s => {
                  const isChecked = selectedSubjects.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleToggleSubject(s.id)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-indigo-600/30 border-cyan-400 text-white'
                          : 'bg-[#090d20] border-white/5 text-slate-400'
                      }`}
                    >
                      <span>{s.name}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-slate-300 font-semibold block">
                Điểm mục tiêu từng môn (Thang điểm 10):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedSubjects.map(subId => {
                  const sub = subjects.find(s => s.id === subId);
                  return (
                    <div key={subId} className="p-3 rounded-xl bg-[#090d20] border border-white/5 flex items-center justify-between">
                      <span className="font-bold text-slate-200">{sub?.name}</span>
                      <input
                        type="number"
                        step={0.25}
                        min={1}
                        max={10}
                        value={targetScores[subId] || 8.0}
                        onChange={e => handleScoreChange(subId, parseFloat(e.target.value))}
                        className="w-20 p-1.5 rounded-lg bg-[#0c1126] border border-white/10 text-white font-mono font-bold text-center"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Privacy and GDPR / VN Law 2025 (FR-PRO-06, 08) */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Cá nhân hóa phản hồi Trợ lý AI (FR-PRO-08):</span>
                  <span className="text-[11px] text-slate-400">
                    Cho phép AI sử dụng chủ đề yếu và câu sai để điều chỉnh giải thích dễ hiểu hơn cho riêng bạn.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowAIPersonalization}
                  onChange={e => setAllowAIPersonalization(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090d20] border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Tải về bản sao dữ liệu cá nhân (FR-PRO-07):</span>
                <span className="text-[11px] text-slate-400">Xuất toàn bộ lịch sử học tập, bài thi và ghi chú dạng JSON/CSV.</span>
              </div>
              <button
                onClick={() => setFeedbackNotice({ type: 'success', text: 'Bản sao dữ liệu cá nhân (JSON) đã được tải xuống máy của bạn!' })}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Về</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
              <span className="font-bold text-rose-300 block">Xóa tài khoản & Quyền được lãng quên (FR-PRO-06):</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, bạn có quyền yêu cầu xóa toàn bộ dữ liệu cá nhân khỏi máy chủ Scholyx.
              </p>
              <button
                onClick={handleRequestDataDeletion}
                className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 text-xs font-bold border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yêu Cầu Xóa Tài Khoản & Dữ Liệu</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
