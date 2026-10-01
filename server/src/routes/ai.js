import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => res.json({ success: true, message: 'Endpoint active' }));

export default router;
