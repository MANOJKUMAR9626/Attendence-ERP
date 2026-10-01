import express from 'express';
import { login, register, refreshToken, getMe, logout, forgotPassword, resetPassword, sendEmailVerification, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.post('/send-verification', protect, sendEmailVerification);
router.post('/verify-email', protect, verifyEmail);
router.get('/me', protect, getMe);

export default router;
