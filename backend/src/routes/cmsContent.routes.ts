import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';
import { BadRequestError } from '../errors/AppError.js';

export const cmsContentRouter = Router();
cmsContentRouter.use(requireAuth);
const allowed: Record<string,string> = {
  lessons:'cms.lessons', questions:'cms.questions', exams:'cms.questions', rag:'cms.rag'
};
function kindGuard(req:Request,res:Response,next:NextFunction) {
  const kind=String(req.params.kind||'');
  const permission=allowed[kind];
  if (!permission) {res.status(404).json({error:'Unknown CMS resource'});return;}
  requirePermission(permission)(req,res,next);
}
cmsContentRouter.get('/:kind',kindGuard,async(req,res,next)=>{
  try {
    const rows=await pool.query(
      'SELECT content_id AS id,payload,updated_at FROM public.cms_documents WHERE kind=$1 ORDER BY updated_at DESC LIMIT 500',
      [req.params.kind]);
    res.setHeader('Cache-Control','no-store');
    res.json({items:rows.rows});
  } catch(e){next(e);}
});
cmsContentRouter.put('/:kind/:id',kindGuard,async(req,res,next)=>{
  try {
    const id=String(req.params.id||'');
    const obj=req.body;
    if (!/^[\w-]{1,120}$/.test(id) || !obj || typeof obj!=='object' || Array.isArray(obj) ||
      obj.id!==id || !String(obj.title||obj.content||'').trim() ||
      Buffer.byteLength(JSON.stringify(obj),'utf8')>200000)
      throw new BadRequestError('CMS document invalid or too large');
    const c=await pool.connect();let begun=false;
    try {
      await c.query('BEGIN');begun=true;
      await c.query(`INSERT INTO public.cms_documents(kind,content_id,payload,updated_by)
       VALUES($1,$2,$3::jsonb,$4)
       ON CONFLICT(kind,content_id) DO UPDATE SET payload=excluded.payload,updated_by=excluded.updated_by,updated_at=NOW()`,
       [req.params.kind,id,JSON.stringify(obj),req.account!.id]);
      await c.query(`INSERT INTO public.audit_logs(actor_id,action,target_id,details)
       VALUES($1,'CMS_UPSERT',$2,$3::jsonb)`,
       [req.account!.id,req.params.kind+':'+id,JSON.stringify({kind:req.params.kind})]);
      await c.query('COMMIT');begun=false;
      res.json({ok:true,id});
    }catch(e){if(begun)await c.query('ROLLBACK');throw e;}
    finally{c.release();}
  }catch(e){next(e);}
});
cmsContentRouter.delete('/:kind/:id',kindGuard,async(req,res,next)=>{
  try {
    const id=String(req.params.id||'');
    if (!/^[\w-]{1,120}$/.test(id)) throw new BadRequestError('Invalid CMS id');
    const c=await pool.connect();let begun=false;
    try{
      await c.query('BEGIN');begun=true;
      const result=await c.query('DELETE FROM public.cms_documents WHERE kind=$1 AND content_id=$2',[req.params.kind,id]);
      await c.query(`INSERT INTO public.audit_logs(actor_id,action,target_id,details)
       VALUES($1,'CMS_DELETE',$2,$3::jsonb)`,
       [req.account!.id,req.params.kind+':'+id,JSON.stringify({kind:req.params.kind,deleted:result.rowCount})]);
      await c.query('COMMIT');begun=false;
      res.json({ok:true,deleted:result.rowCount});
    }catch(e){if(begun)await c.query('ROLLBACK');throw e;}
    finally{c.release();}
  }catch(e){next(e);}
});
