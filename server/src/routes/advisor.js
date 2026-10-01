import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getClassDetails, getLeaveRequests, updateLeaveRequest } from '../controllers/advisorController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('class_advisor'));

router.get('/class', getClassDetails);
router.get('/leaves', getLeaveRequests);
router.put('/leaves/:id', updateLeaveRequest);

export default router;
