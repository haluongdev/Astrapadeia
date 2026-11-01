const API=import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
export type CmsKind='lessons'|'questions'|'exams'|'rag';
async function call<T>(kind:CmsKind,path:string,init:RequestInit={}):Promise<T>{
  const r=await fetch(`${API}/api/cms/${kind}${path}`,{
    credentials:'include',...init,
    headers:{'Content-Type':'application/json',...init.headers}
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error || `CMS HTTP ${r.status}`);
  return data as T;
}
export const cmsApi={
  list:(kind:CmsKind)=>call<{items:Array<{id:string;payload:Record<string,unknown>;updated_at:string}>}>(kind,''),
  save:(kind:CmsKind,doc:Record<string,unknown>)=>call<{ok:boolean}>(kind,`/${encodeURIComponent(String(doc.id))}`,{method:'PUT',body:JSON.stringify(doc)}),
  remove:(kind:CmsKind,id:string)=>call<{ok:boolean}>(kind,`/${encodeURIComponent(id)}`,{method:'DELETE'})
};
