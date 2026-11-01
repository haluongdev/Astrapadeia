import React,{useEffect,useState} from 'react';
const base=(import.meta.env.VITE_API_BASE_URL||'http://localhost:4000')+'/api/admin/management';
const field='bg-slate-900 border border-white/20 rounded px-3 py-2 text-white text-sm';
async function api(path:string,method='GET',body?:unknown):Promise<any>{
 const r=await fetch(base+path,{credentials:'include',method,
 headers:body===undefined?undefined:{'Content-Type':'application/json'},
 body:body===undefined?undefined:JSON.stringify(body)});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error('API '+path+' [HTTP '+r.status+']: '+(d.message||d.error||'Yêu cầu thất bại'));
 return d;
}
const money=(x:unknown)=>Number(x||0).toLocaleString('vi-VN')+' ₫';
export function SYSSettingsReal(){
 const [items,setItems]=useState<any[]>([]),[error,setError]=useState(''),[message,setMessage]=useState('');
 const refresh=()=>api('/settings').then(d=>{setItems(d.items||[]);setError('');}).catch(e=>setError(String(e)));
 useEffect(()=>{refresh();},[]);
 const labels:Record<string,string>={registration_enabled:'Cho phép đăng ký',minimum_password_length:'Độ dài mật khẩu tối thiểu',ai_enabled:'Bật AI',vip_sales_enabled:'Cho phép bán PRE',session_idle_minutes:'Thời gian phiên (phút)',failed_login_threshold:'Ngưỡng đăng nhập sai'};
 return <div className="space-y-4 text-white"><h3 className="font-bold">Cấu hình hệ thống</h3>
 <p className="text-amber-200 text-sm">Chỉ công tắc đăng ký và độ dài mật khẩu khi đăng ký được thực thi hiện tại. Các mục khác mới lưu, CHƯA áp dụng toàn hệ thống.</p>
 {error&&<p role="alert" className="text-red-300">{error}</p>}{message&&<p className="text-green-300">{message}</p>}
 {items.map(row=><div className="flex flex-wrap gap-3 justify-between border border-white/10 rounded p-3" key={row.key}>
 <div>{labels[row.key]||row.key}<p className="text-xs text-slate-400">{['registration_enabled','minimum_password_length'].includes(row.key)?'Đang áp dụng':'Chưa áp dụng vào nghiệp vụ'}</p></div>
 <div className="flex gap-2">{typeof row.value==='boolean'?<select className={field} value={String(row.value)} onChange={e=>setItems(v=>v.map(i=>i.key===row.key?{...i,value:e.target.value==='true'}:i))}><option value="true">Bật</option><option value="false">Tắt</option></select>:
 <input className={field+' w-24'} type="number" value={row.value} onChange={e=>setItems(v=>v.map(i=>i.key===row.key?{...i,value:Number(e.target.value)}:i))}/>}
 <button className={field} onClick={async()=>{try{const d=await api('/settings/'+row.key,'PUT',{value:row.value});setMessage(d.applied?'Đã lưu và áp dụng':'Đã lưu, CHƯA áp dụng');refresh();}catch(e){setError(String(e));}}}>Lưu</button></div>
 </div>)}</div>;
}

export function SYSVipReal(){
 const [plans,setPlans]=useState<any[]>([]),[tx,setTx]=useState<any[]>([]),[demoTx,setDemoTx]=useState<any[]>([]),[grants,setGrants]=useState<any[]>([]),[stale,setStale]=useState<any[]>([]);
 const [report,setReport]=useState<any>(null),[error,setError]=useState(''),[msg,setMsg]=useState(''),[status,setStatus]=useState(''),[search,setSearch]=useState('');
 const [name,setName]=useState(''),[days,setDays]=useState(30),[price,setPrice]=useState(0),[desc,setDesc]=useState('');
 const [editing,setEditing]=useState(''),[editName,setEditName]=useState(''),[editDays,setEditDays]=useState(30),[editPrice,setEditPrice]=useState(0),[editDesc,setEditDesc]=useState('');
 const [benefits,setBenefits]=useState('{"ai":true}'),[limits,setLimits]=useState('{"aiPerDay":50}');
 const [grantAccount,setGrantAccount]=useState(''),[grantPlan,setGrantPlan]=useState(''),[grantDays,setGrantDays]=useState(30),[grantReason,setGrantReason]=useState('');
 const reload=async()=>{try{
 const [p,t,g,r,q,d]=await Promise.all([api('/vip/plans'),api('/vip/transactions-detailed?status='+encodeURIComponent(status)+'&account='+encodeURIComponent(search)),api('/vip/grants'),api('/vip/report-full'),api('/vip/reconciliation'),api('/vip/demo-transactions')]);
 setPlans(p.items||[]);setTx(t.items||[]);setDemoTx(d.items||[]);setGrants(g.items||[]);setReport(r);setStale(q.items||[]);setError('');
 }catch(e){setError(String(e));}};
 useEffect(()=>{reload();},[status]);
 const run=async(action:()=>Promise<any>,success:string)=>{setError('');setMsg('');try{await action();setMsg(success);await reload();}catch(e){setError(String(e));}};
 const edit=(p:any)=>{setEditing(p.id);setEditName(p.name);setEditDays(p.duration_days);setEditPrice(Number(p.price_vnd));setEditDesc(p.description||'');
 setBenefits(JSON.stringify(p.benefits?.features||{},null,2));setLimits(JSON.stringify(p.benefits?.limits||{},null,2));};
 const saveEdit=()=>run(async()=>{
 await api('/vip/plans/'+editing,'PATCH',{name:editName,durationDays:Number(editDays),priceVnd:Number(editPrice),description:editDesc});
 await api('/vip/plans/'+editing+'/benefits','PUT',{benefits:JSON.parse(benefits),limits:JSON.parse(limits)});
 setEditing('');
 },'Đã lưu gói và quyền lợi. Hai thao tác được ghi audit riêng.');
 return <div className="space-y-6 text-white">
 <h3 className="font-bold text-lg">Quản lý gói PRE & giao dịch — PostgreSQL</h3>
 <p className="text-amber-200 text-sm">Chưa kết nối cổng thanh toán. Không thể đối soát tự động, thu tiền hoặc hoàn tiền thật. Các giao dịch chờ quá 15 phút được liệt kê để điều tra, không tự chuyển thành đã thanh toán.</p>
 {error&&<p role="alert" className="text-red-300">{error}</p>}{msg&&<p role="status" className="text-green-300">{msg}</p>}
 <button className={field} onClick={reload}>Tải lại dữ liệu</button>
 <section className="border border-white/10 rounded-xl p-4 space-y-3"><h4 className="font-semibold">1. Tạo gói PRE</h4>
 <div className="flex flex-wrap gap-2"><input className={field} placeholder="Tên gói" value={name} onChange={e=>setName(e.target.value)}/>
 <input className={field+' w-24'} aria-label="Số ngày" type="number" value={days} onChange={e=>setDays(Number(e.target.value))}/>
 <input className={field+' w-36'} aria-label="Giá VND" type="number" value={price} onChange={e=>setPrice(Number(e.target.value))}/>
 <input className={field} placeholder="Mô tả" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
 <button className={field} onClick={()=>run(()=>api('/vip/plans','POST',{name,durationDays:days,priceVnd:price,description:desc,benefits:{}}),'Đã tạo gói. Chọn Sửa để thiết lập quyền lợi và hạn mức.')}>Tạo gói</button>
 <h4 className="font-semibold">Danh sách gói ({plans.length})</h4>
 {plans.map(p=><div key={p.id} className="border border-white/10 rounded p-3 space-y-2"><div className="flex flex-wrap justify-between gap-2">
 <div><b>{p.name}</b><p className="text-xs text-slate-400">{p.duration_days} ngày · {money(p.price_vnd)} · {p.active?'Bật bán':'Tắt bán'}</p></div>
 <div className="flex gap-2"><button className={field} onClick={()=>edit(p)}>Sửa gói</button>
 <button className={field} onClick={()=>run(()=>api('/vip/plans/'+p.id,'PATCH',{active:!p.active}),p.active?'Đã tắt bán':'Đã bật trạng thái gói; cổng thanh toán chưa tích hợp')}>{p.active?'Tắt':'Bật'}</button></div></div>
 {editing===p.id&&<div className="space-y-2 border-t border-white/10 pt-2">
 <div className="flex flex-wrap gap-2"><input className={field} value={editName} onChange={e=>setEditName(e.target.value)} aria-label="Sửa tên"/>
 <input className={field+' w-24'} type="number" value={editDays} onChange={e=>setEditDays(Number(e.target.value))} aria-label="Sửa ngày"/>
 <input className={field+' w-36'} type="number" value={editPrice} onChange={e=>setEditPrice(Number(e.target.value))} aria-label="Sửa giá"/>
 <input className={field} value={editDesc} onChange={e=>setEditDesc(e.target.value)} aria-label="Sửa mô tả"/></div>
 <p className="text-xs text-slate-400">Quyền lợi dạng JSON boolean. Hạn mức dạng JSON số nguyên không âm.</p>
 <div className="flex flex-wrap gap-2"><label className="text-xs">Quyền lợi<textarea rows={3} className={field+' block w-60'} value={benefits} onChange={e=>setBenefits(e.target.value)}/></label>
 <label className="text-xs">Hạn mức<textarea rows={3} className={field+' block w-60'} value={limits} onChange={e=>setLimits(e.target.value)}/></label></div>
 <div className="flex gap-2"><button className={field} onClick={saveEdit}>Lưu</button><button className={field} onClick={()=>setEditing('')}>Hủy</button></div>
 </div>}</div>)}
 </section>
 <section className="border border-white/10 rounded-xl p-4 space-y-3"><h4 className="font-semibold">2. Giao dịch & đối soát</h4>
 <div className="flex flex-wrap gap-2"><select className={field} value={status} onChange={e=>setStatus(e.target.value)}><option value="">Mọi trạng thái</option>{['pending','paid','failed','cancelled','refunded'].map(s=><option key={s}>{s}</option>)}</select>
 <input className={field} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Lọc email"/><button className={field} onClick={reload}>Lọc</button></div>
 <p className="text-amber-200 text-xs">Có {stale.length} giao dịch pending quá 15 phút cần đối soát với nhà cung cấp. Chưa thể chốt tự động khi chưa tích hợp cổng.</p>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="text-left">Thời gian</th><th className="text-left">Email / Gói</th><th>Trạng thái</th><th className="text-right">Giá</th><th>Nhà cung cấp</th></tr></thead><tbody>
 {tx.map(t=><tr key={t.id} className="border-t border-white/10"><td>{String(t.created_at||'').slice(0,16)}</td><td>{t.email}<p className="text-xs">{t.plan_name}</p></td><td className="text-center">{t.status}</td><td className="text-right">{money(t.amount_vnd)}</td><td>{t.provider_transaction_id||t.provider}</td></tr>)}
 </tbody></table></div>{!tx.length&&<p className="text-slate-400">Chưa có giao dịch hợp lệ trong database.</p>}
 <div className="mt-4 border-t border-white/10 pt-3 space-y-2">
 <h5 className="font-semibold text-amber-200">Giao dịch mô phỏng Học sinh ({demoTx.length}) — không tính doanh thu</h5>
 <p className="text-xs text-slate-400">Dữ liệu mô phỏng được lưu riêng, không xác nhận thanh toán ngân hàng, không tự kích hoạt PRE thật.</p>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="text-left">Thời gian</th><th className="text-left">Học sinh / mã</th><th>Trạng thái</th><th className="text-right">Số tiền mô phỏng</th><th>Phương thức</th></tr></thead>
 <tbody>{demoTx.filter(t=>(!search||String(t.email||'').toLowerCase().includes(search.toLowerCase()))&&(!status||t.status===status)).map(t=><tr className="border-t border-white/10" key={t.id}>
 <td>{String(t.created_at||'').slice(0,16)}</td><td>{t.email}<p className="text-xs">{t.client_reference} · {t.plan_name}</p></td>
 <td className="text-center">{t.status==='simulated'?'Mô phỏng hoàn tất': 'Chờ mô phỏng'}</td>
 <td className="text-right">{money(t.amount_vnd)}</td><td>{t.payment_method}</td></tr>)}</tbody></table></div>
 </div>
 </section>
 <section className="border border-white/10 rounded-xl p-4 space-y-3"><h4 className="font-semibold">3. Cấp/thu hồi PRE thủ công</h4>
 <div className="flex flex-wrap gap-2"><input className={field+' w-72'} value={grantAccount} onChange={e=>setGrantAccount(e.target.value)} placeholder="UUID tài khoản"/>
 <select className={field} value={grantPlan} onChange={e=>setGrantPlan(e.target.value)}><option value="">Chọn gói</option>{plans.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select>
 <input className={field+' w-24'} type="number" value={grantDays} min={1} onChange={e=>setGrantDays(Number(e.target.value))} aria-label="Số ngày cấp"/>
 <input className={field} placeholder="Lý do bắt buộc" value={grantReason} onChange={e=>setGrantReason(e.target.value)}/></div>
 <button className={field} onClick={()=>run(()=>api('/vip/grants','POST',{accountId:grantAccount,planId:grantPlan,expiresAt:new Date(Date.now()+Number(grantDays)*86400000).toISOString(),reason:grantReason}),'Đã cấp PRE thủ công, ghi audit; không phát sinh doanh thu')}>Cấp PRE</button>
 {grants.map(g=><div key={g.id} className="flex flex-wrap gap-2 justify-between border-t border-white/10 py-2 text-sm"><span>{g.email} · {g.plan_name} · hết hạn {String(g.expires_at).slice(0,10)} {g.revoked_at?'(đã thu hồi)':''}</span>
 {!g.revoked_at&&<button className={field} onClick={()=>{const why=window.prompt('Nhập lý do thu hồi PRE (ít nhất 5 ký tự)');if(why!==null)run(()=>api('/vip/grants/'+g.id+'/revoke','POST',{reason:why}),'Đã thu hồi PRE và ghi audit');}}>Thu hồi</button>}</div>)}
 </section>
 <section className="border border-white/10 rounded-xl p-4 space-y-3"><h4 className="font-semibold">4. Báo cáo doanh thu và chuyển đổi</h4>
 <p className="text-sm">Học sinh active: {report?.conversion?.total_students??'—'} · PRE active: {report?.conversion?.active_pre??'—'} · Chuyển đổi: {report?.conversion?.conversion_pct??'—'}%</p>
 <div className="flex flex-wrap gap-6"><div><b>Doanh thu theo ngày</b>{(report?.daily||[]).map((r:any)=><p key={r.period} className="text-sm">{r.period}: {money(r.revenue_vnd)} ({r.transactions})</p>)}</div>
 <div><b>Doanh thu theo tháng</b>{(report?.monthly||[]).map((r:any)=><p key={r.period} className="text-sm">{r.period}: {money(r.revenue_vnd)} ({r.transactions})</p>)}</div></div>
 <p className="text-xs text-amber-200">{report?.note}</p></section>
 </div>;
}
