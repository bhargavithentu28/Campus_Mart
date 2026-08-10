import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { categoryService } from '../modules/categories/categoryService';

export async function getCategories(req: AuthenticatedRequest, res: Response) {
  try {
    const categories = await categoryService.getCategories();
    return res.status(200).json({ success: true, categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, slug, icon, description } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Category name and slug are required.' });
    }

    const category = await categoryService.createCategory(name, slug, icon, description);
    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
