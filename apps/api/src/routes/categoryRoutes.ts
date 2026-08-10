import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, createCategory);

export default router;
