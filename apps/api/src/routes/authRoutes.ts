import { Router } from 'express';
import {
  getColleges,
  sendOTP,
  verifyOTP,
  googleLogin,
  refreshSession,
  logout,
  logoutAll,
  getProfile
} from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/colleges', getColleges);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google-login', googleLogin);
router.post('/refresh', refreshSession);

// Protected routes
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getProfile);

export default router;
