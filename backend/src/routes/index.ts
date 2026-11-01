import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { profileRouter } from './profile.routes.js';
import { adminRouter } from './admin.routes.js';
import { studentPreRouter } from './studentPre.routes.js';
import { cmsContentRouter } from './cmsContent.routes.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/pre', studentPreRouter);

apiRouter.use('/cms', cmsContentRouter);
