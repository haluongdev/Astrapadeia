import React, { useCallback, useEffect, useState } from 'react';
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const base = `${API}/api/admin/sys`;
async function getJson(path:string):Promise<any> {
  const r=await fetch(base+path,{credentials:'include'});
  const d=await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(d.error || d.message || `HTTP ${r.status}`);
  return d;
}
type View='overview'|'audit'|'config';
export function SystemRealPanel({view}:{view:View}){
  const [data,setData]=useState<any>(null);
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const [page,setPage]=useState(1);
  const [actor,setActor]=useState('');
  const [action,setAction]=useState('');
  const [target,setTarget]=useState('');
  const [start,setStart]=useState('');
  const [end,setEnd]=useState('');
  const query=new URLSearchParams({page:String(page),actor,action,target,start,end}).toString();
  const load=useCallback(async()=>{
    if(view==='config')return;
    setLoading(true);setErr('');
    try{setData(await getJson(view==='overview'?'/overview':`/audit?${query}`));}
    catch(e){setErr(e instanceof Error?e.message:'Không tải được dữ liệu');}
    finally{setLoading(false);}
  },[view,query]);
  useEffect(()=>{void load();},[load]);
  const input='rounded-md bg-slate-900 border border-white/20 text-white px-3 py-2 text-sm';
  if(view==='config') return <div className="cosmic-card p-5 rounded-xl space-y-3">
    <h3 className="font-bold text-white">Cấu hình tham số hệ thống</h3>
    <p className="text-amber-200 text-sm">Chưa triển khai lưu tham số vào backend. Giao diện cũ dùng dữ liệu mô phỏng, nên đã tạm dừng chức năng lưu để tránh thông báo thành công không thật.</p>
    <p className="text-slate-300 text-sm">Cần đối chiếu quy tắc bảo mật và các middleware xác thực trước khi áp dụng cấu hình mật khẩu, phiên, đăng ký, AI và VIP.</p>
  </div>;
  return <div className="space-y-4 text-white">
    <div className="flex justify-between items-center gap-2">
      <h3 className="font-bold">{view==='overview'?'Tổng quan hệ thống — dữ liệu thật':'Audit Log — chỉ đọc'}</h3>
      <button className={input} onClick={()=>void load()} disabled={loading}>Tải lại</button>
    </div>
    {err && <div role="alert" className="text-red-200 border border-red-400 rounded-lg p-3">{err}</div>}
    {loading && <p className="text-slate-400">Đang tải...</p>}
    {view==='overview' && data?.accounts && <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([['Tài khoản',data.accounts.total],['Hoạt động',data.accounts.active],['Bị khóa',data.accounts.locked],['Chờ kích hoạt',data.accounts.pending],['Vô hiệu hóa',data.accounts.disabled],['Tài khoản đăng nhập hôm nay',data.loginAccountsToday],['Yêu cầu xóa mới',data.pendingDeletionRequests]] as Array<[string,number]>).map(([name,n])=><div key={name} className="p-4 rounded-xl bg-slate-900 border border-white/10"><p className="text-xs text-slate-400">{name}</p><strong className="text-2xl">{n}</strong></div>)}
      </div>
      <p className="text-sm text-slate-300">Theo vai trò: {(data.roles||[]).map((r:any)=>`${r.id}: ${r.accounts}`).join(' • ')}</p>
      <div className="border border-amber-500/40 rounded-lg p-3 text-amber-200 text-sm">{data.metricsNote}</div>
      <DeletionRequests/>
    </div>}
    {view==='audit' && <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input aria-label="Người thực hiện" placeholder="Email người thực hiện" value={actor} onChange={e=>{setActor(e.target.value);setPage(1);}} className={input}/>
        <input aria-label="Hành động" placeholder="Hành động" value={action} onChange={e=>{setAction(e.target.value);setPage(1);}} className={input}/>
        <input aria-label="Đối tượng" placeholder="Đối tượng" value={target} onChange={e=>{setTarget(e.target.value);setPage(1);}} className={input}/>
        <label className="text-xs text-slate-300">Từ <input type="date" value={start} onChange={e=>{setStart(e.target.value);setPage(1);}} className={input}/></label>
        <label className="text-xs text-slate-300">Đến <input type="date" value={end} onChange={e=>{setEnd(e.target.value);setPage(1);}} className={input}/></label>
      </div>
      <button className={input} onClick={async()=>{
        try{
          const r=await fetch(`${base}/audit.csv?${new URLSearchParams({actor,action,target,start,end})}`,{credentials:'include'});
          if(!r.ok)throw new Error(`HTTP ${r.status}`);
          const blob=await r.blob();const u=URL.createObjectURL(blob);const a=document.createElement('a');
          a.href=u;a.download='scholyx-audit.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
        }catch(e){setErr(e instanceof Error?e.message:'Không xuất được CSV');}
      }}>Xuất CSV theo bộ lọc (tối đa 10.000)</button>
      <p className="text-sm text-slate-400">Tổng: {data?.total??'—'} bản ghi</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs">
        <thead><tr className="text-slate-300"><th className="p-2">Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead>
        <tbody>{(Array.isArray(data?.items)?data.items:[]).map((a:any)=><tr key={a.id} className="border-t border-white/10"><td className="p-2 whitespace-nowrap">{new Date(a.created_at).toLocaleString('vi-VN')}</td><td>{a.actor_email||a.actor_id||'Hệ thống'}</td><td>{a.action}</td><td>{a.target_id}</td><td className="break-all max-w-sm">{JSON.stringify(a.details||{})}</td></tr>)}</tbody>
      </table></div>
      <div className="flex items-center gap-3 text-sm"><button className={input} disabled={page<=1} onClick={()=>setPage(v=>v-1)}>Trước</button><span>Trang {page}</span><button className={input} disabled={page*30>=(data?.total??0)} onClick={()=>setPage(v=>v+1)}>Sau</button></div>
    </div>}
  </div>;
}
function DeletionRequests(){
 const [items,setItems]=useState<any[]>([]);
 const [error,setError]=useState('');
 useEffect(()=>{getJson('/deletion-requests').then(d=>setItems(Array.isArray(d.items)?d.items:[])).catch(e=>setError(String(e)));},[]);
 return <div className="rounded-xl border border-white/10 p-4 space-y-2">
  <h4 className="font-semibold">Yêu cầu xóa dữ liệu cá nhân (chỉ theo dõi)</h4>
  <p className="text-sm text-amber-200">Chưa có quy trình xóa/ẩn danh dữ liệu hoàn chỉnh. Không đánh dấu đã xử lý khi chưa thực hiện xóa dữ liệu theo SRS.</p>
  {error && <p className="text-red-300">{error}</p>}
  {items.slice(0,15).map(i=><p key={i.id} className="text-sm text-slate-300">{i.email||i.account_id} — {i.status} — {new Date(i.created_at).toLocaleString('vi-VN')}</p>)}
  {!items.length && <p className="text-slate-400 text-sm">Không có yêu cầu trong dữ liệu đã tải.</p>}
 </div>;
}
