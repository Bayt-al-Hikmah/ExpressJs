let csrfToken=null;
export async function refreshCsrfToken(){ const r=await fetch('/api/csrf-token'); const j=await r.json(); if(!r.ok) throw new Error(j.message||'CSRF error'); csrfToken=j.data.csrfToken; }
export async function apiRequest(url, options={}){
  const headers=new Headers(options.headers||{}); const method=(options.method||'GET').toUpperCase();
  if(!['GET','HEAD','OPTIONS'].includes(method) && csrfToken) headers.set('X-CSRF-Token', csrfToken);
  const res=await fetch(url,{...options, headers, credentials:'same-origin'});
  if(res.status===204) return null;
  const ct=res.headers.get('content-type')||''; const result=ct.includes('application/json')?await res.json():null;
  if(!res.ok){ const e=new Error(result?.message||`Request failed ${res.status}`); e.status=res.status; throw e; }
  return result;
}
