import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { searchService } from '../modules/search/searchService';

export async function searchListings(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      q,
      category,
      condition,
      transactionType,
      minPrice,
      maxPrice,
      collegeId,
      departmentId,
      sort,
      page,
      limit
    } = req.query;

    const result = await searchService.search({
      search: q as string,
      category: category as string,
      condition: condition as any,
      transactionType: transactionType as any,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      collegeId: (collegeId as string) || req.user?.collegeId,
      departmentId: departmentId as string,
      sort: sort as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12
    }, req.user?.id);

    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function interpretSearchQuery(req: AuthenticatedRequest, res: Response) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required.' });
    }
    const filters = await searchService.interpretNaturalQuery(prompt);
    return res.status(200).json({ success: true, filters });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getTrendingSearches(req: AuthenticatedRequest, res: Response) {
  try {
    const collegeId = (req.query.collegeId as string) || req.user?.collegeId;
    const trends = await searchService.getTrendingSearches(collegeId);
    return res.status(200).json({ success: true, trending: trends });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSearchHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const history = await searchService.getSearchHistory(req.user.id);
    return res.status(200).json({ success: true, history });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function clearSearchHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    await searchService.clearSearchHistory(req.user.id);
    return res.status(200).json({ success: true, message: 'History cleared' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSavedSearches(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const saved = await searchService.getSavedSearches(req.user.id);
    return res.status(200).json({ success: true, saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createSavedSearch(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { name, filters } = req.body;
    const saved = await searchService.createSavedSearch(req.user.id, name, filters || {});
    return res.status(201).json({ success: true, saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getRecentlyViewed(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const products = await searchService.getRecentlyViewed(req.user.id);
    return res.status(200).json({ success: true, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCampusHeatmap(req: AuthenticatedRequest, res: Response) {
  try {
    const collegeId = (req.query.collegeId as string) || req.user?.collegeId;
    const heatmap = await searchService.getCampusHeatmap(collegeId);
    return res.status(200).json({ success: true, heatmap });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
