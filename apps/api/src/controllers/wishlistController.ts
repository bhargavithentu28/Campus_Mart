import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { wishlistService } from '../modules/wishlist/wishlistService';

export async function toggleWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    const result = await wishlistService.toggleWishlist(userId, productId);
    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getMyWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const products = await wishlistService.getMyWishlist(userId);
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
