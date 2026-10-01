import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Only admins can update settings, but maybe others can read it? Let's restrict to admin for now.
router.route('/')
  .get(getSettings)
  .put(authorize('admin'), updateSettings);

export default router;
