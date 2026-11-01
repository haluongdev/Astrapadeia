import { Router } from 'express';
import { requireAuth,requireRole } from '../middlewares/auth.middleware.js';
import * as c from '../controllers/studentPre.controller.js';
export const studentPreRouter=Router();
studentPreRouter.use(requireAuth,requireRole('student'));
studentPreRouter.get('/plans',c.plans);
studentPreRouter.get('/transactions',c.mine);
studentPreRouter.post('/transactions',c.create);
studentPreRouter.post('/transactions/:id/simulate',c.simulate);

import * as demoBridge from '../controllers/preDemoBridge.controller.js';
studentPreRouter.post('/demo-transactions',demoBridge.createDemo);
studentPreRouter.post('/demo-transactions/:reference/complete',demoBridge.completeDemo);

studentPreRouter.get('/demo-entitlement',demoBridge.demoEntitlement);
