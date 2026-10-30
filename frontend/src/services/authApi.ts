/** Adapter for real backend. Existing AppContext mock flows remain unchanged until explicitly migrated. */
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
export type ApiUser = {
  id: string; fullName: string; email: string | null; phone: string | null;
  grade: 10 | 11 | 12; status: 'pending'|'active'|'locked'|'disabled';
};
async function request<T>(path:string, options:RequestInit={}):Promise<T>{
  const response = await fetch(`${BASE}${path}`,{
    ...options, credentials:'include',
    headers:{'Content-Type':'application/json',...options.headers}
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(payload.error||`HTTP ${response.status}`);
  return payload as T;
}
export const authApi={
  register:(body:{fullName:string;email:string;grade:10|11|12;password:string;agreeTerms:boolean;agreePrivacy:boolean;termsVersion:string;privacyVersion:string})=>
    request<{status:'pending';message:string}>('/api/auth/register',{method:'POST',body:JSON.stringify(body)}),
  activate:(email:string,code:string)=>
    request<{status:'active'}>('/api/auth/activate',{method:'POST',body:JSON.stringify({email,code})}),
  login:(identifier:string,password:string)=>
    request<{user:ApiUser}>('/api/auth/login',{method:'POST',body:JSON.stringify({identifier,password})}),
  me:()=>request<{user:ApiUser}>('/api/auth/me'),
  logout:()=>request<{ok:boolean}>('/api/auth/logout',{method:'POST'}),
  profile:()=>request('/api/profile'),
  updateProfile:(body:Record<string,unknown>)=>request('/api/profile',{method:'PATCH',body:JSON.stringify(body)}),
  requestDeletion:()=>request('/api/profile/delete-request',{method:'POST'}),
};
