import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/user/:userId', getUserReviews);
router.post('/', protect, createReview);

export default router;
