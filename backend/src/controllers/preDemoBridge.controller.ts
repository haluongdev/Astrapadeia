import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/AppError.js';

const plans: Record<string, { name: string; amount: number }> = {
  'plan-comet': { name: 'Gói Sao Băng (1 Tháng)', amount: 79000 },
  'plan-galaxy': { name: 'Gói Nhật Thực (3 Tháng)', amount: 199000 },
  'plan-cosmos': { name: 'Gói Thiên Hà Trọn Năm', amount: 499000 }
};
const methods = new Set(['vietqr','momo','zalopay','vnpay']);
const clientCode = (x:unknown): x is string => typeof x === 'string' && /^TXN-[0-9]{6}$/.test(x);

export async function createDemo(req: Request, res: Response, next: NextFunction) {
  try {
    const {clientReference,planCode,method}=req.body||{};
    if(!clientCode(clientReference)||typeof planCode!=='string'||!plans[planCode]||!methods.has(method)){
      throw new BadRequestError('Thông tin giao dịch mô phỏng không hợp lệ');
    }
    const plan=plans[planCode];
    const result=await pool.query(
      `INSERT INTO pre_demo_transactions(account_id,client_reference,plan_code,plan_name,amount_vnd,payment_method)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(account_id,client_reference) DO NOTHING
       RETURNING id,client_reference,status`,
       [req.account!.id,clientReference,planCode,plan.name,plan.amount,method]);
    if(!result.rowCount) throw new ConflictError('Mã giao dịch mô phỏng đã được sử dụng');
    res.status(201).json({transaction:result.rows[0],simulation:true});
  } catch(e){ next(e); }
}

export async function completeDemo(req: Request, res: Response, next: NextFunction) {
  try {
    const code=req.params.reference;
    if(!clientCode(code)) throw new BadRequestError('Mã giao dịch không hợp lệ');
    const result=await pool.query(
      `UPDATE pre_demo_transactions
       SET status='simulated',completed_at=now()
       WHERE client_reference=$1 AND account_id=$2 AND status='pending'
       RETURNING id,client_reference,status,completed_at`,
       [code,req.account!.id]);
    if(!result.rowCount) throw new ConflictError('Không có giao dịch mô phỏng đang chờ thuộc tài khoản');
    res.json({transaction:result.rows[0],simulation:true,notice:'Mô phỏng, không thu tiền thật hoặc kích hoạt PRE trên máy chủ.'});
  } catch(e){next(e);}
}

export async function adminDemo(req: Request, res: Response, next: NextFunction) {
  try {
    const result=await pool.query(
      `SELECT t.id,t.client_reference,t.plan_name,t.amount_vnd,t.payment_method,t.status,
              t.created_at,t.completed_at,a.email
       FROM pre_demo_transactions t JOIN accounts a ON a.id=t.account_id
       ORDER BY t.created_at DESC LIMIT 200`);
    res.json({items:result.rows,simulation:true});
  }catch(e){next(e);}
}


// Restore Student DEMO access after a page reload. Never represents a real payment.
export async function demoEntitlement(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      `SELECT client_reference, plan_code, completed_at
       FROM pre_demo_transactions
       WHERE account_id=$1 AND status='simulated' AND completed_at IS NOT NULL
       ORDER BY completed_at DESC LIMIT 100`,
      [req.account!.id]);
    const durations: Record<string,number> = {'plan-comet':30,'plan-galaxy':90,'plan-cosmos':365};
    let bestExpires=0;
    let reference: string|null=null;
    for(const r of result.rows){
      const days=durations[r.plan_code];
      if(!days) continue;
      const end=new Date(r.completed_at).getTime()+days*86400000;
      if(Number.isFinite(end) && end>bestExpires){bestExpires=end;reference=r.client_reference;}
    }
    const active=bestExpires>Date.now();
    res.set('Cache-Control','no-store');
    res.json({active,kind:'pre_demo',simulation:true,
      expiresAt:active?new Date(bestExpires).toISOString():null,
      clientReference:active?reference:null,
      notice:'Quyền mô phỏng, không xác nhận đã thu tiền thật.'});
  } catch(e){next(e);}
}
