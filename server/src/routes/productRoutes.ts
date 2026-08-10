import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  toggleLikeProduct,
  reportProduct,
  apiGenerateDescription,
  apiPredictPrice,
  markProductSold
} from '../controllers/productController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/create', protect, createProduct);
router.post('/:id/like', protect, toggleLikeProduct);
router.post('/report', protect, reportProduct);
router.put('/mark-sold/:id', protect, markProductSold);

// AI helpers
router.post('/ai/generate-desc', protect, apiGenerateDescription);
router.post('/ai/predict-price', protect, apiPredictPrice);

export default router;
