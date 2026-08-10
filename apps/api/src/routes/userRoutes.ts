import { Router } from 'express';
import { getMe, updateMe, getUserById } from '../controllers/userController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/:id', getUserById);

export default router;
