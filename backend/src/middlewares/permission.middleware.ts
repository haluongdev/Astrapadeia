import {Request,Response,NextFunction} from 'express';
import {pool} from '../config/database.js';
import {UnauthorizedError,ForbiddenError} from '../errors/AppError.js';
export function requirePermission(permission:string) {
 return async (req:Request,_res:Response,next:NextFunction):Promise<void>=>{
  try {
   if(!req.account) throw new UnauthorizedError();
   const allowed=await pool.query(`SELECT 1 FROM account_roles ar
    JOIN role_permissions rp ON rp.role_id=ar.role_id
    WHERE ar.account_id=$1 AND rp.permission_id=$2 LIMIT 1`,[req.account.id,permission]);
   if(!allowed.rowCount) throw new ForbiddenError('Không có quyền: '+permission);
   next();
  }catch(e){next(e);}
 };
}
