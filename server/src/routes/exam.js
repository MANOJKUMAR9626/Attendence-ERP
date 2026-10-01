import express from 'express';
import { getSeatingArrangement } from '../controllers/examController.js';

const router = express.Router();

router.get('/seating', getSeatingArrangement);

export default router;
