import { Router } from 'express';
import { getStats, getReports, resolveReport, verifyUserBadge } from '../controllers/adminController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

router.get('/stats', protect, adminOnly, getStats);
router.get('/reports', protect, adminOnly, getReports);
router.post('/reports/:id/resolve', protect, adminOnly, resolveReport);
router.post('/verify-badge/:userId', protect, adminOnly, verifyUserBadge);

export default router;
