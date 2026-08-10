import { Router } from 'express';
import { sendOTP, verifyOTP, googleLogin, getProfile, updateProfile } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google-login', googleLogin);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
