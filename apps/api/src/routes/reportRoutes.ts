import { Router } from 'express';
import { createReport, getReports, resolveReport } from '../controllers/reportController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

router.post('/', protect, createReport);
router.get('/', protect, adminOnly, getReports);
router.patch('/:id/resolve', protect, adminOnly, resolveReport);

export default router;
