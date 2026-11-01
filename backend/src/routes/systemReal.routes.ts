import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { systemOverview, systemAudit, systemAuditCsv, systemDeletionRequests } from '../controllers/systemReal.controller.js';

export const systemRealRouter = Router();
systemRealRouter.use(requireAuth);
systemRealRouter.use(requireRole('qtv'));
systemRealRouter.get('/overview', systemOverview);
systemRealRouter.get('/audit', systemAudit);
systemRealRouter.get('/audit.csv', systemAuditCsv);
systemRealRouter.get('/deletion-requests', systemDeletionRequests);
