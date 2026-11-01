import { Router } from 'express';
import { getProfile, updateProfile, requestDeletion, exportMyData } from '../controllers/profile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', getProfile);
profileRouter.patch('/', updateProfile);
profileRouter.post('/delete-request', requestDeletion);
profileRouter.get('/export', exportMyData);
