import { Router } from 'express';
import {
  getStats,
  getReports,
  resolveReport,
  getUsersList,
  toggleUserSuspension,
  getAuditLogs,
  getFeatureFlags,
  toggleFeatureFlag,
  getSystemHealth
} from '../controllers/adminController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('MODERATOR', 'COLLEGE_ADMIN', 'SUPER_ADMIN'));

router.get('/stats', getStats);
router.get('/reports', getReports);
router.post('/reports/:id/resolve', resolveReport);

router.get('/users', getUsersList);
router.post('/users/:userId/suspend', toggleUserSuspension);

router.get('/audit-logs', getAuditLogs);
router.get('/feature-flags', getFeatureFlags);
router.post('/feature-flags/toggle', toggleFeatureFlag);
router.get('/health', getSystemHealth);

export default router;
