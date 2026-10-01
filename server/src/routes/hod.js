import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getFacultyOverview,
  getDeptAnalytics,
  getAtRiskStudents,
  getAttendanceReview
} from '../controllers/hodController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('hod'));

router.get('/faculty', getFacultyOverview);
router.get('/analytics', getDeptAnalytics);
router.get('/risk', getAtRiskStudents);
router.get('/attendance', getAttendanceReview);

export default router;
