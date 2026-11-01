import { systemRealRouter } from './systemReal.routes.js';
import { Router } from 'express';
import { getAccounts, getAuditLogs, manageAccount } from '../controllers/admin.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';
import * as rbac from '../controllers/rbac.controller.js';

import { inviteInternal, requestAdminReset } from '../controllers/adminPhase2.controller.js';

import { sysVipRouter } from './sysVip.routes.js';
export const adminRouter = Router();
adminRouter.use('/management',sysVipRouter);
adminRouter.use('/sys', systemRealRouter);
adminRouter.use(requireAuth);

adminRouter.get('/accounts',requirePermission('admin.accounts'),getAccounts);
adminRouter.get('/audit',requirePermission('system.audit'),getAuditLogs);
adminRouter.post('/accounts/:id/:action',requirePermission('admin.accounts'),manageAccount);

adminRouter.post('/internal-invite',requirePermission('admin.accounts'),inviteInternal);
adminRouter.post('/accounts/:id/reset-link',requirePermission('admin.accounts'),requestAdminReset);

// Permission-specific RBAC endpoints. Permissions checked server-side on every request.
adminRouter.get('/rbac',requirePermission('rbac.manage'),rbac.listRoles);
adminRouter.get('/rbac/accounts/:id/effective',requirePermission('rbac.manage'),rbac.accountEffective);
adminRouter.post('/rbac/roles',requirePermission('rbac.manage'),rbac.createRole);
adminRouter.patch('/rbac/roles/:id',requirePermission('rbac.manage'),rbac.updateRole);
adminRouter.delete('/rbac/roles/:id',requirePermission('rbac.manage'),rbac.deleteRole);
adminRouter.put('/rbac/roles/:id/permissions',requirePermission('rbac.manage'),rbac.setPermissions);
adminRouter.post('/rbac/accounts/:id/role',requirePermission('rbac.manage'),rbac.changeAssignment);
