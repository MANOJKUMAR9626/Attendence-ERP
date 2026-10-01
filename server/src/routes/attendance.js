import express from 'express';
import { markAttendance, getStudentSummary, getOrCreateSession } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/mark', authorize('admin', 'faculty', 'hod'), markAttendance);
router.post('/session', authorize('admin', 'faculty', 'hod'), getOrCreateSession);
router.get('/summary/:studentId', getStudentSummary); // All roles can view summary

export default router;
