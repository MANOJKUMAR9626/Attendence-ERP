import express from 'express';
import { protect } from '../middleware/auth.js';
import { getUnreadCount, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/unread', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);

export default router;
