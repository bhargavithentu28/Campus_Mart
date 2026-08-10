import { Router } from 'express';
import {
  searchListings,
  interpretSearchQuery,
  getTrendingSearches,
  getSearchHistory,
  clearSearchHistory,
  getSavedSearches,
  createSavedSearch,
  getRecentlyViewed,
  getCampusHeatmap
} from '../controllers/searchController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', searchListings);
router.post('/ai-interpret', interpretSearchQuery);
router.get('/trending', getTrendingSearches);
router.get('/heatmap', getCampusHeatmap);

// Authenticated Routes
router.get('/history', protect, getSearchHistory);
router.delete('/history', protect, clearSearchHistory);
router.get('/saved', protect, getSavedSearches);
router.post('/saved', protect, createSavedSearch);
router.get('/recently-viewed', protect, getRecentlyViewed);

export default router;
