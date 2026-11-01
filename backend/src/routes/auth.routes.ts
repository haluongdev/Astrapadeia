import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, activate, login, me, logout, devOtpInbox, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

import { consumeAdminLink } from '../controllers/adminPhase2.controller.js';

export const authRouter = Router();

const authRateLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 5 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: process.env.NODE_ENV === 'production' ? 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' : 'Quá nhiều yêu cầu, vui lòng thử lại sau 5 giây' },
});

authRouter.use(authRateLimiter);

authRouter.post('/register', register);
authRouter.post('/activate', activate);
authRouter.post('/dev-otp', devOtpInbox);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, me);
authRouter.post('/logout', requireAuth, logout);

authRouter.post('/admin-password-link', consumeAdminLink);
