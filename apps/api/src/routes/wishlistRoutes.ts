import { Router } from 'express';
import { toggleWishlist, getMyWishlist } from '../controllers/wishlistController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.get('/', getMyWishlist);
router.post('/:productId', toggleWishlist);
router.delete('/:productId', toggleWishlist);

export default router;
