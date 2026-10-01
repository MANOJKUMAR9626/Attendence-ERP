import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createLeaveRequest,
  getMyLeaves,
  getAdvisorLeaves,
  getHODLeaves,
  updateLeaveStatus
} from '../controllers/leaveController.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), createLeaveRequest);
router.get('/my', authorize('student'), getMyLeaves);

router.get('/advisor', authorize('faculty'), getAdvisorLeaves);
router.get('/hod', authorize('hod', 'faculty'), getHODLeaves);

router.put('/:id/status', authorize('faculty', 'hod'), updateLeaveStatus);

export default router;
