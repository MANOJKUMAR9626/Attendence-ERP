import express from 'express';
import {
  getProviders,
  getSMSConfig,
  updateSMSConfig,
  testConnection,
  sendTestMessage,
  getSMSStatus
} from '../controllers/smsAdminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All SMS config routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/providers', getProviders);
router.get('/config', getSMSConfig);
router.put('/config', updateSMSConfig);
router.post('/test-connection', testConnection);
router.post('/test-message', sendTestMessage);
router.get('/status', getSMSStatus);

export default router;
