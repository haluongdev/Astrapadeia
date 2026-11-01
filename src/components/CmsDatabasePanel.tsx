import React from 'react';
import { cmsApi, CmsKind } from '../services/cmsApi';

type Item={id:string;payload:Record<string,unknown>;updated_at:string};
const kinds:Record<CmsKind,string>={lessons:'Bài học',questions:'Câu hỏi',exams:'Đề thi',rag:'Tài liệu RAG'};
export const CmsDatabasePanel:React.FC<{initialTab?:string}>=({initialTab})=>{
  const resolve=(v?:string):CmsKind=>v==='exam_matrix'?'exams':v==='rag'?'rag':v==='lessons'?'lessons':'questions';
  const [kind,setKind]=React.useState<CmsKind>(resolve(initialTab));
  const [items,setItems]=React.useState<Item[]>([]);
  const [id,setId]=React.useState('');
  const [title,setTitle]=React.useState('');
  const [body,setBody]=React.useState('');
  const [status,setStatus]=React.useState('');
  const [notice,setNotice]=React.useState('');
  const [busy,setBusy]=React.useState(false);
  React.useEffect(()=>setKind(resolve(initialTab)),[initialTab]);
  const refresh=React.useCallback(async()=>{
    setBusy(true);
    try{const data=await cmsApi.list(kind);setItems(data.items);setNotice(`${data.items.length} mục lưu trong PostgreSQL`);}
    catch(e){setNotice('Lỗi CMS backend: '+String(e));}
    finally{setBusy(false);}
  },[kind]);
  React.useEffect(()=>{void refresh();},[refresh]);
  const save=async()=>{
    if(!title.trim()||!body.trim()){setNotice('Cần nhập tiêu đề và nội dung');return;}
    const key=id||`cms-${Date.now()}`;
    if(!/^[\w-]{1,120}$/.test(key)){setNotice('ID không hợp lệ');return;}
    setBusy(true);
    try{
      const current=items.find(x=>x.id===key)?.payload || {};
      const doc={...current,id:key,title:title.trim(),content:body.trim(),status:status||'draft'};
      await cmsApi.save(kind,doc);
      setId(key);setNotice('Đã lưu thành công vào PostgreSQL');
      await refresh();
    }catch(e){setNotice('Chưa lưu: '+String(e));}
    finally{setBusy(false);}
  };
  const erase=async(item:Item)=>{
    if(!confirm(`Xóa ${item.id} khỏi CMS PostgreSQL?`))return;
    setBusy(true);
    try{await cmsApi.remove(kind,item.id);setNotice('Đã xóa và ghi audit');await refresh();}
    catch(e){setNotice('Không thể xóa: '+String(e));}
    finally{setBusy(false);}
  };
  return <section className="mb-5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-slate-100">
    <h3 className="font-bold text-emerald-300">CMS PostgreSQL — QTND / QTV (dữ liệu thật)</h3>
    <p className="text-xs text-slate-300 my-2">Các thao tác trong khung này được xác thực bằng cookie, kiểm tra quyền CMS tại backend và ghi audit. Trình soạn thảo mẫu phía dưới vẫn là dữ liệu frontend cũ; chưa được đồng bộ tự động.</p>
    <div className="flex flex-wrap gap-2 my-3">
      {(Object.keys(kinds) as CmsKind[]).map(k=><button key={k} type="button" onClick={()=>{setKind(k);setId('');setTitle('');setBody('');setStatus('');}} className={`px-3 py-1 rounded border ${kind===k?'border-emerald-400 bg-emerald-700':'border-slate-600'}`}>{kinds[k]}</button>)}
      <button type="button" onClick={()=>void refresh()} disabled={busy} className="px-3 py-1 border border-slate-500 rounded">Tải lại DB</button>
    </div>
    <div className="grid gap-2 md:grid-cols-2">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tiêu đề" aria-label="CMS title" className="rounded p-2 bg-slate-900 border border-slate-700"/>
      <select value={status} onChange={e=>setStatus(e.target.value)} aria-label="CMS status" className="rounded p-2 bg-slate-900 border border-slate-700">
        <option value="">Trạng thái: nháp</option><option value="draft">Nháp</option><option value="review">Chờ duyệt</option><option value="published">Xuất bản</option>
      </select>
    </div>
    <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Nội dung hoặc mô tả" className="mt-2 w-full rounded p-2 bg-slate-900 border border-slate-700"/>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={()=>void save()} disabled={busy} className="px-3 py-2 rounded bg-emerald-700 disabled:opacity-50">{id?'Cập nhật PostgreSQL':'Tạo mới PostgreSQL'}</button>
      <button type="button" onClick={()=>{setId('');setTitle('');setBody('');setStatus('');}} className="px-3 py-2 rounded border border-slate-600">Tạo mục khác</button>
    </div>
    {notice&&<p role="status" className="text-xs mt-3 text-amber-200">{notice}</p>}
    <ul className="mt-3 max-h-64 overflow-auto space-y-2">
      {items.map(it=><li key={it.id} className="flex gap-2 justify-between items-center border-b border-white/10 py-2">
        <div><strong>{String(it.payload.title||it.id)}</strong><span className="ml-2 text-xs text-slate-400">{String(it.payload.status||'draft')}</span></div>
        <div className="flex gap-2">
          <button type="button" className="text-emerald-300 underline" onClick={()=>{setId(it.id);setTitle(String(it.payload.title||''));setBody(String(it.payload.content||''));setStatus(String(it.payload.status||'draft'));}}>Sửa</button>
          <button type="button" className="text-rose-300 underline" onClick={()=>void erase(it)}>Xóa</button>
        </div>
      </li>)}
    </ul>
  </section>;
};
