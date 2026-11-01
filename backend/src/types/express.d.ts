import { Account } from './index.js';

declare global {
  namespace Express {
    interface Request {
      account?: Account;
      requestId?: string;
    }
  }
}

export {};
