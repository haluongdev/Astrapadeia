import React, { useEffect, useState } from 'react';
import { authApi } from '../services/authApi';
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
  const [className, setClassName] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState('');
  const [school, setSchool] = useState<string>(currentUser.school);
  const [province, setProvince] = useState<string>(currentUser.province);
  const [grade, setGrade] = useState<10 | 11 | 12>(currentUser.grade);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(currentUser.targetSubjects);
  const [targetScores, setTargetScores] = useState<Record<string, number>>(currentUser.targetScores);
  const [allowAIPersonalization, setAllowAIPersonalization] = useState<boolean>(currentUser.allowAIPersonalization);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [realProfile, setRealProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoaded(false);
    setRealProfile(false);
    setProfileError('');
    authApi.profile().then((result: any) => {
      if (cancelled) return;
      const p = result.profile;
      setName(result.user?.fullName ?? currentUser.name);
      setClassName(p?.class_name ?? '');
      setAvatarDataUrl(p?.avatar_url ?? '');
      setGrade(result.user?.grade ?? currentUser.grade);
      setSchool(p?.school ?? '');
      setProvince(p?.province ?? '');
      setSelectedSubjects(Array.isArray(p?.selected_subjects) ? p.selected_subjects : []);
      setTargetScores(p?.target_scores && typeof p.target_scores === 'object' ? p.target_scores : {});
      setAllowAIPersonalization(Boolean(p?.ai_personalization));
      // V1.2: synchronize all profile consumers when the modal reads PostgreSQL.
      if (p && result.user?.id === currentUser.id) {
        updateProfile({
          school: p.school ?? '',
          province: p.province ?? '',
          targetSubjects: Array.isArray(p.selected_subjects) ? p.selected_subjects : [],
          targetScores: p.target_scores && typeof p.target_scores === 'object' ? p.target_scores : {},
          allowAIPersonalization: Boolean(p.ai_personalization)
        });
      }      setRealProfile(Boolean(p));
      setIsLoaded(true);
    }).catch((error: unknown) => {
      if (cancelled) return;
      setProfileError(error instanceof Error ? error.message : 'Không thể tải hồ sơ');
      setIsLoaded(true);
    });
    return () => { cancelled = true; };
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!isLoaded || profileError || isBusy) return;
    setIsBusy(true);
    setFeedbackNotice(null);
    try {
      await authApi.updateProfile({
        school, province, fullName: name, className, avatarDataUrl: avatarDataUrl || null, selectedSubjects,
        targetScores: Object.fromEntries(
          Object.entries(targetScores).filter(([k]) => selectedSubjects.includes(k))
        ),
        allowAiPersonalization
      });
      // Confirm persistence with a fresh GET before reporting success.
      const confirmed: any = await authApi.profile();
      const p = confirmed.profile;
      const savedScores = Object.fromEntries(
        Object.entries(targetScores).filter(([k]) => selectedSubjects.includes(k))
      );
      const same =
        p &&
        p.school === school.trim() &&
        confirmed.user?.fullName === name.trim() &&
        (p.class_name ?? '') === className.trim() &&
        (p.avatar_url ?? '') === avatarDataUrl &&
        p.province === province.trim() &&
        JSON.stringify(p.selected_subjects) === JSON.stringify(selectedSubjects) &&
        Object.keys(savedScores).every(k => Number(p.target_scores?.[k]) === savedScores[k]) &&
        Boolean(p.ai_personalization) === allowAIPersonalization;
      if (!same) {
        throw new Error('Máy chủ chưa trả về đúng hồ sơ vừa lưu. Vui lòng thử lại.');
      }
      setRealProfile(true);
      updateProfile({
        name: name.trim(),
        avatar: avatarDataUrl || currentUser.avatar,
        school, province, targetSubjects: selectedSubjects,
        targetScores: savedScores, allowAIPersonalization
      });
      setFeedbackNotice({ type: 'success', text: 'Đã xác nhận dữ liệu hồ sơ được lưu trong PostgreSQL.' });
    } catch (error) {
      setFeedbackNotice({
        type: 'info',
        text: error instanceof Error ? error.message : 'Không thể lưu hồ sơ'
      });
    } finally {
      setIsBusy(false);
    }
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

  const handleExport = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      const exported = await authApi.exportProfile();
      const file = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scholyx-personal-data.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setFeedbackNotice({ type: 'info', text: 'Đã tải bản sao tài khoản và hồ sơ. Lịch sử học tập chưa được hỗ trợ xuất trong phiên bản này.' });
    } catch (error) {
      setFeedbackNotice({ type: 'info', text: error instanceof Error ? error.message : 'Không thể xuất dữ liệu.' });
    } finally { setIsBusy(false); }
  };

  const handleAvatarFile = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 100 * 1024) {
      setFeedbackNotice({ type: 'info', text: 'Chỉ nhận ảnh PNG, JPEG, WebP tối đa 100 KB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRequestDataDeletion = async () => {
    if (isBusy || !isLoaded || !realProfile) return;
    if (!window.confirm('Gửi yêu cầu xóa dữ liệu? Yêu cầu này sẽ được quản trị viên xem xét; dữ liệu chưa bị xóa ngay.')) return;
    setIsBusy(true);
    try {
      await authApi.requestDeletion();
      setFeedbackNotice({ type: 'info', text: 'Đã tiếp nhận yêu cầu xóa dữ liệu; dữ liệu chưa bị xóa.' });
    } catch (error) {
      setFeedbackNotice({ type: 'info', text: error instanceof Error ? error.message : 'Không gửi được yêu cầu.' });
    } finally { setIsBusy(false); }
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
            src={avatarDataUrl || currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-space">{name}</h3>
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

        {!isLoaded && (
          <p role="status" className="text-cyan-300 text-xs">Đang tải hồ sơ từ máy chủ...</p>
        )}
        {profileError && (
          <p role="alert" className="text-rose-300 text-xs">Không thể tải hồ sơ thật: {profileError}. Không thể lưu khi chưa tải thành công.</p>
        )}
        {isLoaded && !realProfile && !profileError && (
          <p role="alert" className="text-rose-300 text-xs">Chưa có hồ sơ học sinh. Nhấn Lưu Thay Đổi để tạo hồ sơ.</p>
        )}
        {/* Tab 1: Profile Info (FR-PRO-01..03) */}
        {(
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Họ và tên:</label>
              <input
                type="text"
                value={name}
                readOnly
                title="Tên tài khoản hiện chưa hỗ trợ cập nhật từ cửa sổ này"
                className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Ảnh đại diện (PNG, JPEG, WebP; tối đa 100 KB):</label>
              <input type="file" accept="image/png,image/jpeg,image/webp"
                onChange={e => handleAvatarFile(e.target.files?.[0])}
                className="block w-full text-slate-200 text-xs" />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Lớp cụ thể (ví dụ 12A1):</label>
              <input type="text" maxLength={40} value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#090d20] border border-white/10 text-white text-xs" />
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
              <label className="text-slate-300 font-semibold block mb-1">Khối lớp đang học:</label>
              <div className="flex gap-2">
                {[10, 11, 12].map(g => (
                  <button
                    key={g}
                    disabled
                    title="Cập nhật khối lớp chưa được hỗ trợ bởi API hồ sơ"
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
            disabled={!isLoaded || Boolean(profileError) || isBusy}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
