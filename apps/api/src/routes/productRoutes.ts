import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  changeProductStatus,
  deleteProduct,
  getMyProducts,
  apiGenerateDescription,
  apiPredictPrice,
  apiSuggestCategoryAndTags
} from '../controllers/productController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public / Filtered product listing
router.get('/', getAllProducts);
router.get('/my-listings', protect, getMyProducts);
router.get('/:id', getProductById);

// Protected product management
router.post('/', protect, createProduct);
router.patch('/:id', protect, updateProduct);
router.patch('/:id/status', protect, changeProductStatus);
router.delete('/:id', protect, deleteProduct);

// AI Assistance
router.post('/ai/generate-desc', protect, apiGenerateDescription);
router.post('/ai/predict-price', protect, apiPredictPrice);
router.post('/ai/suggest-category-tags', protect, apiSuggestCategoryAndTags);

export default router;
