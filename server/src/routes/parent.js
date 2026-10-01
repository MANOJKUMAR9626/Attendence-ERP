import express from 'express';
import { getWardDashboard, getProfile } from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('parent'));

router.get('/dashboard', getWardDashboard);
router.get('/profile', getProfile);

export default router;

