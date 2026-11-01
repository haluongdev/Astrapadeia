import React,{useEffect,useState} from 'react';
type Role={id:string;description:string;is_system:boolean;account_count:number;permissions:string[]};
type Permission={id:string;description:string;module:string;action:string};
type Assignment={account_id:string;role_id:string;email:string|null;full_name:string;status:string};
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const api = `${API_BASE}/api/admin/rbac`;
async function request(path:string,method='GET',body?:unknown) {
 const r=await fetch(api+path,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.message||data.error||`HTTP ${r.status}`);
 return data;
}
function RBACAdminContent(){
 const [roles,setRoles]=useState<Role[]>([]);
 const [permissions,setPermissions]=useState<Permission[]>([]);
 const [assignments,setAssignments]=useState<Assignment[]>([]);
 const [selected,setSelected]=useState('qtv');
 const [chosen,setChosen]=useState<string[]>([]);
 const [newId,setNewId]=useState('');
 const [newDesc,setNewDesc]=useState('');
 const [account,setAccount]=useState('');
 const [targetRole,setTargetRole]=useState('student');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [loadError,setLoadError]=useState('');
 async function refresh(){
   const data=await request('');
   if (!Array.isArray(data?.roles) || !Array.isArray(data?.permissions) || !Array.isArray(data?.assignments)) {
     throw new Error('API RBAC trả dữ liệu không đúng cấu trúc. Kiểm tra backend /api/admin/rbac, quyền QTV và Console/Network.');
   }
   const safeRoles:Role[] = data.roles.map((r:Role)=>({...r,permissions:Array.isArray(r.permissions)?r.permissions:[]}));
   setRoles(safeRoles);setPermissions(data.permissions);setAssignments(data.assignments);
   setChosen(safeRoles.find((r:Role)=>r.id===selected)?.permissions||[]);
   setLoadError('');
 }
 useEffect(()=>{refresh().catch(e=>setLoadError(e instanceof Error?e.message:String(e)));},[]);
 useEffect(()=>{setChosen(roles.find(r=>r.id===selected)?.permissions||[]);},[selected,roles]);
 async function run(f:()=>Promise<unknown>){
  setBusy(true);setNotice('');
  try{await f();await refresh();setNotice('Đã lưu và ghi audit thành công.');}
  catch(e){setNotice(e instanceof Error?e.message:String(e));}
  finally{setBusy(false);}
 }
 const chosenRole=roles.find(r=>r.id===selected);
 if(loadError) return <div role="alert" className="rounded-xl border border-rose-500 p-5 space-y-3 text-white"><h3 className="font-bold">Không tải được Vai trò & Quyền</h3><p className="text-sm">{loadError}</p><button type="button" className="rounded-lg bg-rose-600 px-3 py-2" onClick={()=>refresh().catch(e=>setLoadError(e instanceof Error?e.message:String(e)))}>Thử tải lại</button></div>;
 const field='bg-[#090d20] text-white border border-white/20 rounded-lg p-2 text-sm';
 const btn='rounded-lg bg-rose-600 px-3 py-2 text-white text-sm disabled:opacity-50';
 return <div className="space-y-5 text-white">
  <div className="rounded-2xl border border-white/10 p-5 space-y-3">
   <h3 className="font-bold">Vai trò và số tài khoản thực tế</h3>
   <div className="flex flex-wrap gap-2">{roles.map(r=><button key={r.id} className={`rounded-lg p-3 border ${selected===r.id?'border-rose-500':'border-white/20'}`} onClick={()=>setSelected(r.id)}>{r.id} ({r.account_count}) {r.is_system?'🔒':''}</button>)}</div>
   <div className="flex flex-wrap gap-2">
    <input aria-label="Mã vai trò mới" placeholder="Mã vai trò mới" value={newId} onChange={e=>setNewId(e.target.value)} className={field}/>
    <input aria-label="Mô tả vai trò" placeholder="Mô tả" value={newDesc} onChange={e=>setNewDesc(e.target.value)} className={field}/>
    <button disabled={busy} className={btn} onClick={()=>run(()=>request('/roles','POST',{id:newId,description:newDesc}))}>Tạo vai trò</button>
   </div>
   {chosenRole&&!chosenRole.is_system&&<div className="flex gap-2">
    <button disabled={busy} className={btn} onClick={()=>run(()=>request('/roles/'+selected,'PATCH',{description:newDesc}))}>Sửa mô tả</button>
    <button disabled={busy} className={btn} onClick={()=>{if(confirm('Xóa vai trò '+selected+'?'))run(()=>request('/roles/'+selected,'DELETE'));}}>Xóa vai trò</button>
   </div>}
  </div>
  <div className="rounded-2xl border border-white/10 p-5 space-y-3">
   <h3 className="font-bold">Tập quyền của vai trò: {selected}</h3>
   <p className="text-xs text-slate-300">Tập quyền từ PostgreSQL, nhóm theo module. Cập nhật có hiệu lực khi truy cập API tiếp theo. Quyền cốt lõi QTV được bảo vệ.</p>
   {Array.from(new Set(permissions.map(p=>p.module))).map(m=><div key={m} className="border-t border-white/10 pt-2">
     <h4 className="text-sm font-bold text-rose-300">{m}</h4>
     {permissions.filter(p=>p.module===m).map(p=><label key={p.id} className="flex items-center gap-2 text-sm py-1">
       <input type="checkbox" checked={chosen.includes(p.id)} onChange={e=>setChosen(prev=>e.target.checked?[...prev,p.id]:prev.filter(x=>x!==p.id))}/>
       <span>{p.description} <small className="text-slate-400">({p.id})</small></span>
     </label>)}
   </div>)}
   <button disabled={busy||!chosenRole} className={btn} onClick={()=>run(()=>request('/roles/'+selected+'/permissions','PUT',{permissions:chosen}))}>Lưu tập quyền và ghi Audit</button>
  </div>
  <div className="rounded-2xl border border-white/10 p-5 space-y-3">
    <h3 className="font-bold">Gán / gỡ vai trò tài khoản</h3>
    <p className="text-xs text-slate-300">Nhập UUID tài khoản (xem tại màn hình Tài khoản). Không thể tự gỡ QTV, gỡ vai trò duy nhất hoặc làm mất QTV cuối cùng.</p>
    <input value={account} onChange={e=>setAccount(e.target.value)} placeholder="UUID tài khoản" className={field}/>
    <select className={field} value={targetRole} onChange={e=>setTargetRole(e.target.value)}>{roles.map(r=><option key={r.id} value={r.id}>{r.id}</option>)}</select>
    <button disabled={busy} className={btn} onClick={()=>run(()=>request('/accounts/'+account+'/role','POST',{role:targetRole,mode:'grant'}))}>Gán vai trò</button>{' '}
    <button disabled={busy} className={btn} onClick={()=>{if(confirm('Gỡ vai trò '+targetRole+'?'))run(()=>request('/accounts/'+account+'/role','POST',{role:targetRole,mode:'revoke'}));}}>Gỡ vai trò</button>
    <div className="max-h-44 overflow-auto text-xs text-slate-300">{assignments.map((a,i)=><div key={i} className="py-1">{a.email||a.full_name} | {a.role_id} | <button className="underline" onClick={()=>{setAccount(a.account_id);setTargetRole(a.role_id);}}>Chọn UUID</button></div>)}</div>
  </div>
  {notice&&<div role="status" className="rounded-lg border border-rose-500 p-3 text-sm">{notice}</div>}
 </div>;
}

class RBACScreenBoundary extends React.Component<{children:React.ReactNode},{error:string}> {
 state={error:''};
 static getDerivedStateFromError(error:Error){return {error:error.message||'Lỗi React không xác định'};}
 componentDidCatch(error:Error){console.error('RBAC UI render error',error);}
 render(){
  if(this.state.error) return <div role="alert" className="rounded-xl border border-rose-500 p-5 text-white space-y-2"><b>Lỗi hiển thị Vai trò & Quyền</b><p>{this.state.error}</p><p className="text-sm">Mở F12 → Console để xem chi tiết. Không cần chạy lại migration.</p></div>;
  return this.props.children;
 }
}

export function RBACAdminReal(){return <RBACScreenBoundary><RBACAdminContent/></RBACScreenBoundary>;}
