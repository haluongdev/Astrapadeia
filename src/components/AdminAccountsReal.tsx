import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

type Account = {
 id:string; full_name:string; email:string|null; phone:string|null;
 status:string; roles:string[]; created_at:string;
};
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function call(path: string, options: RequestInit = {}) {
 const response = await fetch(`${API}/api/admin${path}`, {
   ...options, credentials: 'include',
   headers: { 'Content-Type': 'application/json', ...options.headers },
 });
 const data = await response.json().catch(() => ({}));
 if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
 return data;
}
export function AdminAccountsReal() {
 const { currentUser } = useApp();
 const [items,setItems]=useState<Account[]>([]);
 const [search,setSearch]=useState('');
 const [role,setRole]=useState('');
 const [status,setStatus]=useState('');
 const [page,setPage]=useState(1);
 const [total,setTotal]=useState(0);
 const [activeQtvCount,setActiveQtvCount]=useState<number|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [auditItems,setAuditItems]=useState<Array<{id:number;actor_id:string;action:string;target_id:string;details:Record<string,unknown>;created_at:string}>>([]);
 const [inviteName,setInviteName]=useState('');
 const [inviteEmail,setInviteEmail]=useState('');
 const [inviteRole,setInviteRole]=useState<'qtnd'|'qtv'>('qtnd');
 const [auditLoaded,setAuditLoaded]=useState(false);
 const [auditBusy,setAuditBusy]=useState(false);
 const load=useCallback(async()=>{
   setBusy(true);setError('');setActiveQtvCount(null);
   try {
     const query=new URLSearchParams({q:search,role,status,page:String(page),limit:'20'});
     const [data, qtvs]=await Promise.all([
       call(`/accounts?${query.toString()}`),
       call('/accounts?role=qtv&status=active&page=1&limit=1')
     ]);
     setItems(data.items);setTotal(data.total);
     setActiveQtvCount(Number(qtvs.total));
   } catch(e) { setError(e instanceof Error?e.message:'Lỗi tải tài khoản'); }
   finally {setBusy(false);}
 },[search,role,status,page]);
 useEffect(()=>{void load();},[load]);
 async function invite(e:React.FormEvent){
   e.preventDefault(); setBusy(true);setError('');setNotice('');
   try {
     const result=await call('/internal-invite',{method:'POST',body:JSON.stringify({fullName:inviteName,email:inviteEmail,role:inviteRole})});
     setNotice(result.message||'Đã gửi lời mời.');setInviteName('');setInviteEmail('');await load();
   }catch(e){setError(e instanceof Error?e.message:'Không thể gửi lời mời');}
   finally{setBusy(false);}
 }
 async function resetLink(a:Account){
   if(!window.confirm(`Gửi email đặt lại mật khẩu đến ${a.email}? QTV không nhận hoặc xem được mật khẩu.`))return;
   setBusy(true);setError('');setNotice('');
   try {const result=await call(`/accounts/${a.id}/reset-link`,{method:'POST',body:'{}'});setNotice(result.message||'Đã gửi email.');}
   catch(e){setError(e instanceof Error?e.message:'Không thể gửi email');}
   finally{setBusy(false);}
 }
 async function showAudit(){
   setAuditBusy(true);setError('');
   try {
     const result=await call('/audit');
     setAuditItems(Array.isArray(result.items)?result.items:[]);
     setAuditLoaded(true);
   } catch(e){setError(e instanceof Error?e.message:'Không thể tải nhật ký');}
   finally{setAuditBusy(false);}
 }
 async function act(a:Account, action:'lock'|'unlock'|'disable'|'force-logout'){
   // UI safeguard only. The backend is authoritative and checks again in its transaction.
   if (a.id===currentUser.id && (action==='lock'||action==='disable')) {
     setError('Không thể tự khóa hoặc vô hiệu hóa tài khoản quản trị đang dùng.'); return;
   }
   if (a.roles.includes('qtv') && a.status==='active' &&
       (action==='lock' || action==='disable') &&
       (activeQtvCount===null || activeQtvCount<=1)) {
     setError('Không thể khóa hoặc vô hiệu hóa QTV hoạt động cuối cùng.');
     return;
   }
   if (a.roles.includes('qtv') && a.status==='active' &&
       (action==='lock'||action==='disable') && activeQtvCount===null) {
     setError('Không xác định được số QTV hoạt động. Vui lòng tải lại trước khi thao tác.');
     return;
   }
   const label={lock:'khóa',unlock:'mở khóa',disable:'vô hiệu hóa','force-logout':'buộc đăng xuất'}[action];
   const reason=action==='force-logout'?'':window.prompt(`Nhập lý do ${label} tài khoản ${a.email || a.id} (ít nhất 5 ký tự):`,'');
   if (reason===null || (action!=='force-logout' && reason.trim().length<5)) {
     setError('Thao tác bị hủy hoặc thiếu lý do bắt buộc.');return;
   }
   const warning=action==='force-logout'
      ? `Buộc đăng xuất ${a.email || a.id}?\n\nToàn bộ phiên hiện tại sẽ bị thu hồi. Người dùng sẽ phải đăng nhập lại khi hệ thống kiểm tra phiên. Tài khoản và mật khẩu không thay đổi.`
      : `Xác nhận ${label} ${a.email || a.id}?`;
   if (!window.confirm(warning)) return;
   setBusy(true);setError('');setNotice('');
   try {
     const result=await call(`/accounts/${a.id}/${action}`,{method:'POST',body:JSON.stringify({reason})});
     if(action==='force-logout'){
       const count=Number.isInteger(result.revokedSessions)?result.revokedSessions:null;
       setNotice(count===null
         ? 'Lệnh buộc đăng xuất đã được backend xử lý. Người dùng cần đăng nhập lại khi phiên bị từ chối.'
         : count===0
           ? 'Đã xử lý yêu cầu: không có phiên chưa thu hồi. Tài khoản không bị khóa; người dùng vẫn đăng nhập lại được.'
           : `Đã thu hồi ${count} phiên đăng nhập. Người dùng sẽ được thông báo khi hệ thống kiểm tra phiên (tối đa khoảng 15 giây nếu đang mở ứng dụng). Tài khoản vẫn có thể đăng nhập lại.`);
     } else {
       setNotice(`Đã ${label} tài khoản thành công và ghi audit.`);
     }
     await load();
   }catch(e){setError(e instanceof Error?e.message:'Thao tác thất bại');}
   finally{setBusy(false);}
 }
 return <div className="space-y-4 text-slate-200">
  <form onSubmit={e=>void invite(e)} className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-3 space-y-2">
    <h4 className="font-bold">Mời tài khoản nội bộ QTND / QTV qua email</h4>
    <p className="text-xs text-slate-300">Người nhận tự thiết lập mật khẩu qua liên kết 30 phút. QTV không được xem mật khẩu. Cần cấu hình dịch vụ email trước khi dùng.</p>
    <div className="flex flex-wrap gap-2">
      <input required minLength={2} maxLength={150} className="rounded bg-[#090d20] p-2 text-sm" placeholder="Họ tên" value={inviteName} onChange={e=>setInviteName(e.target.value)}/>
      <input required type="email" className="rounded bg-[#090d20] p-2 text-sm" placeholder="Email người nhận" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}/>
      <select aria-label="Vai trò tài khoản mới" className="rounded bg-[#090d20] p-2 text-sm" value={inviteRole} onChange={e=>setInviteRole(e.target.value as 'qtnd'|'qtv')}><option value="qtnd">QTND</option><option value="qtv">QTV</option></select>
      <button disabled={busy} className="rounded bg-indigo-700 px-3 py-2 text-sm">Gửi lời mời</button>
    </div>
  </form>
  <div className="flex flex-wrap gap-2">
   <input aria-label="Tìm tài khoản" className="rounded-lg bg-[#090d20] border border-white/20 p-2 text-sm flex-1 min-w-44" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm tên, email, điện thoại"/>
   <select aria-label="Vai trò" className="rounded-lg bg-[#090d20] border border-white/20 p-2 text-sm" value={role} onChange={e=>{setRole(e.target.value);setPage(1);}}>
    <option value="">Mọi vai trò</option><option value="student">Student</option><option value="qtnd">QTND</option><option value="qtv">QTV</option>
   </select>
   <select aria-label="Trạng thái" className="rounded-lg bg-[#090d20] border border-white/20 p-2 text-sm" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
    <option value="">Mọi trạng thái</option><option value="active">Hoạt động</option><option value="pending">Chờ kích hoạt</option><option value="locked">Khóa</option><option value="disabled">Vô hiệu</option>
   </select>
   <button type="button" onClick={()=>void load()} className="rounded-lg bg-indigo-700 px-3 py-2 text-sm">Tải lại</button>
   <button type="button" disabled={auditBusy} onClick={()=>void showAudit()} className="rounded-lg border border-indigo-400/50 px-3 py-2 text-sm">Xem Audit Log</button>
  </div>
  {error && <p role="alert" className="text-rose-300 text-sm">{error}</p>}
  {notice && <p role="status" className="text-emerald-300 text-sm">{notice}</p>}
  <div className="overflow-x-auto"><table className="min-w-full text-xs">
   <thead><tr className="border-b border-white/20 text-left"><th className="p-2">Tài khoản</th><th className="p-2">Vai trò</th><th className="p-2">Trạng thái</th><th className="p-2">Thao tác</th></tr></thead>
   <tbody>{items.map(a=><tr key={a.id} className="border-b border-white/10">
    <td className="p-2">{a.full_name}<div className="text-slate-400">{a.email||a.phone||a.id}</div></td>
    <td className="p-2">{a.roles.join(', ')}</td><td className="p-2">{a.status}</td>
    <td className="p-2"><div className="flex flex-wrap gap-1">
     {a.status==='active' && a.id!==currentUser.id && !(a.roles.includes('qtv') && (activeQtvCount===null || activeQtvCount<=1)) && <button disabled={busy} onClick={()=>void act(a,'lock')} className="rounded bg-rose-700 px-2 py-1">Khóa</button>}
     {a.status==='locked' && <button disabled={busy} onClick={()=>void act(a,'unlock')} className="rounded bg-emerald-700 px-2 py-1">Mở khóa</button>}
     {a.status!=='disabled' && a.id!==currentUser.id && !(a.status==='active' && a.roles.includes('qtv') && (activeQtvCount===null || activeQtvCount<=1)) && <button disabled={busy} onClick={()=>void act(a,'disable')} className="rounded bg-slate-700 px-2 py-1">Vô hiệu</button>}
     {a.id===currentUser.id && <span className="text-amber-300">Không thể tự khóa/vô hiệu</span>}
     {a.id!==currentUser.id && a.status==='active' && a.roles.includes('qtv') && (activeQtvCount===null || activeQtvCount<=1) && <span title="Hệ thống phải còn ít nhất một QTV hoạt động" className="text-amber-300">Bảo vệ QTV cuối cùng</span>}
     {a.email && a.status==='active' && <button disabled={busy} title="Gửi liên kết đặt lại mật khẩu qua email, QTV không thấy mật khẩu" onClick={()=>void resetLink(a)} className="rounded bg-cyan-800 px-2 py-1">Gửi link đặt lại MK</button>}
     <button title="Thu hồi các phiên hiện tại; tài khoản có thể đăng nhập lại" disabled={busy} onClick={()=>void act(a,'force-logout')} className="rounded bg-indigo-700 px-2 py-1">Buộc đăng xuất</button>
    </div></td>
   </tr>)}</tbody>
  </table></div>
  <div className="flex gap-3 items-center text-xs"><span>Tổng: {total}</span><button disabled={busy||page<=1} onClick={()=>setPage(p=>p-1)}>Trước</button><span>Trang {page}</span><button disabled={busy||page*20>=total} onClick={()=>setPage(p=>p+1)}>Sau</button></div>
  {auditLoaded && <section className="rounded-xl border border-white/15 p-3 space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold">Nhật ký quản trị (100 sự kiện gần nhất)</h4>
      <button disabled={auditBusy} onClick={()=>void showAudit()} className="text-indigo-300 underline">Làm mới</button>
    </div>
    <div className="overflow-x-auto max-h-80 overflow-y-auto"><table className="min-w-full text-xs">
      <thead><tr className="text-left border-b border-white/20"><th className="p-2">Thời điểm</th><th className="p-2">Thao tác</th><th className="p-2">QTV thực hiện (ID)</th><th className="p-2">Tài khoản mục tiêu (ID)</th><th className="p-2">Lý do / Phiên thu hồi</th></tr></thead>
      <tbody>{auditItems.filter(e=>e.action.startsWith('ADMIN_ACCOUNT_') || e.action==='FIRST_QTV_BOOTSTRAP').map(e=><tr key={e.id} className="border-b border-white/10">
        <td className="p-2 whitespace-nowrap">{new Date(e.created_at).toLocaleString('vi-VN')}</td>
        <td className="p-2">{e.action}</td><td className="p-2 break-all">{e.actor_id}</td><td className="p-2 break-all">{e.target_id}</td>
        <td className="p-2">{String(e.details?.reason ?? '')}{typeof e.details?.revokedSessions==='number' ? ` • ${e.details.revokedSessions} phiên` : ''}</td>
      </tr>)}</tbody>
    </table></div>
  </section>}
 </div>;
}
