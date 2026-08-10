import { Router } from 'express';
import { getDepartments, createDepartment } from '../controllers/departmentController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

router.get('/', getDepartments);
router.post('/', protect, adminOnly, createDepartment);

export default router;
