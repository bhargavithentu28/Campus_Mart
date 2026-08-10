import { Router } from 'express';
import {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege
} from '../controllers/collegeController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

// Public / Authenticated lookup
router.get('/', getColleges);
router.get('/:id', getCollegeById);

// Admin-only management
router.post('/', protect, adminOnly, createCollege);
router.patch('/:id', protect, adminOnly, updateCollege);
router.delete('/:id', protect, adminOnly, deleteCollege);

export default router;
