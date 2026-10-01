import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { getHODDashboard, getAdvisorDashboard, getFacultyDashboard, getStudentDashboard, getParentDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/admin', authorize('admin'), getAdminStats);
router.get('/hod', authorize('hod'), getHODDashboard);
router.get('/advisor', authorize('class_advisor'), getAdvisorDashboard);
router.get('/faculty', authorize('faculty'), getFacultyDashboard);
router.get('/student', authorize('student'), getStudentDashboard);
router.get('/parent', authorize('parent'), getParentDashboard);

export default router;
