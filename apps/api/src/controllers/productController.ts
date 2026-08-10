import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { productService } from '../modules/products/productService';
import { createProductSchema } from '@campusmart/validation';
import { generateProductDescription, predictPrice, suggestCategoryAndTags } from '../services/gemini';

export async function getAllProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      search,
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

    const result = await productService.getProducts({
      search: search as string,
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
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProductById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    return res.status(200).json({ success: true, product });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const parseResult = createProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid product data'
      });
    }

    const sellerId = req.user!.id;
    const collegeId = req.user!.collegeId;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'User must belong to a verified college to post listings.' });
    }

    const product = await productService.createProduct(sellerId, collegeId, {
      title: parseResult.data.title,
      description: parseResult.data.description,
      price: parseResult.data.price,
      rentalPrice: parseResult.data.rentalPrice,
      condition: parseResult.data.condition as any,
      categorySlug: parseResult.data.category,
      transactionType: parseResult.data.transactionType as any,
      images: parseResult.data.images,
      pickupLocation: parseResult.data.pickupLocation,
      pickupTime: parseResult.data.pickupTime,
      isNegotiable: parseResult.data.isNegotiable,
      departmentId: parseResult.data.departmentId,
      tags: parseResult.data.tags
    });

    return res.status(201).json({
      success: true,
      message: 'Product listing published successfully.',
      product
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = !!req.user?.isAdmin;

    const updated = await productService.updateProduct(id, userId, isAdmin, req.body);
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = !!req.user?.isAdmin;

    await productService.deleteProduct(id, userId, isAdmin);
    return res.status(200).json({ success: true, message: 'Product listing deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function changeProductStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;
    const isAdmin = !!req.user?.isAdmin;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updated = await productService.changeStatus(id, userId, isAdmin, status);
    return res.status(200).json({
      success: true,
      message: `Product status updated to ${status}.`,
      product: updated
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getMyProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const sellerId = req.user!.id;
    const products = await productService.getProductsBySeller(sellerId);
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function apiGenerateDescription(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, category, condition, specifications } = req.body;
    if (!title || !category || !condition) {
      return res.status(400).json({ success: false, message: 'Title, Category, and Condition are required.' });
    }
    const description = await generateProductDescription(title, category, condition, specifications);
    return res.status(200).json({ success: true, description });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function apiPredictPrice(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, category, condition, price } = req.body;
    if (!title || !category || !condition || !price) {
      return res.status(400).json({ success: false, message: 'Title, Category, Condition, and Price are required.' });
    }
    const prediction = await predictPrice(title, category, condition, parseFloat(price));
    return res.status(200).json({ success: true, ...prediction });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function apiSuggestCategoryAndTags(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    const suggestion = await suggestCategoryAndTags(title, description);
    return res.status(200).json({ success: true, ...suggestion });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
