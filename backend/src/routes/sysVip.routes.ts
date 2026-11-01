import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';
import * as s from '../controllers/sysVip.controller.js';
export const sysVipRouter=Router();
sysVipRouter.use(requireAuth);
sysVipRouter.get('/settings',requirePermission('system.config'),s.getSettings);
sysVipRouter.put('/settings/:key',requirePermission('system.config'),s.changeSetting);
sysVipRouter.post('/deletion-requests/:id/review',requirePermission('system.deletions'),s.processDeletion);
sysVipRouter.get('/vip/plans',requirePermission('vip.plans'),s.listPlans);
sysVipRouter.post('/vip/plans',requirePermission('vip.plans'),s.createPlan);
sysVipRouter.patch('/vip/plans/:id',requirePermission('vip.plans'),s.updatePlan);
sysVipRouter.get('/vip/transactions',requirePermission('vip.transactions'),s.vipTransactions);
sysVipRouter.get('/vip/report',requirePermission('vip.transactions'),s.vipReport);

import * as pre from '../controllers/preManagement.controller.js';
sysVipRouter.put('/vip/plans/:id/benefits',requirePermission('vip.plans'),pre.planBenefits);
sysVipRouter.get('/vip/grants',requirePermission('vip.transactions'),pre.listManualGrants);
sysVipRouter.post('/vip/grants',requirePermission('vip.transactions'),pre.createManualGrant);
sysVipRouter.post('/vip/grants/:id/revoke',requirePermission('vip.transactions'),pre.revokeManualGrant);
sysVipRouter.get('/vip/promos',requirePermission('vip.plans'),pre.listPromos);
sysVipRouter.post('/vip/promos',requirePermission('vip.plans'),pre.createPromo);
sysVipRouter.patch('/vip/promos/:id',requirePermission('vip.plans'),pre.togglePromo);
sysVipRouter.get('/vip/transactions-detailed',requirePermission('vip.transactions'),pre.transactionsDetailed);
sysVipRouter.get('/vip/reconciliation',requirePermission('vip.transactions'),pre.reconciliation);
sysVipRouter.get('/vip/report-full',requirePermission('vip.transactions'),pre.reporting);

import { adminDemo } from '../controllers/preDemoBridge.controller.js';
sysVipRouter.get('/vip/demo-transactions',requirePermission('vip.transactions'),adminDemo);
