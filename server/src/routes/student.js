import express from 'express';
import { getDashboard, getTodayTimetable, getStudentProfile, getAttendanceHistory } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getDashboard);
router.get('/timetable/today', getTodayTimetable);
router.get('/profile', getStudentProfile);
router.get('/attendance-history', getAttendanceHistory);

export default router;

