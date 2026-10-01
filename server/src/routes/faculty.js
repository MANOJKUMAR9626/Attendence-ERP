import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getAllocations, getTodayTimetable, getStudentsBySection, getAttendanceHistory, getAllStudentsForFaculty, getFacultyProfile } from '../controllers/facultyController.js';
import { getDepartments } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('faculty'));

router.get('/allocations', getAllocations);
router.get('/timetable/today', getTodayTimetable);
router.get('/profile', getFacultyProfile);
router.get('/students', getAllStudentsForFaculty);
router.get('/students/:sectionId', getStudentsBySection);
router.get('/departments', getDepartments);
router.get('/attendance-history', getAttendanceHistory);

export default router;
