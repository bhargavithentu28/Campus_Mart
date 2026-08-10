import { prisma } from '../../infrastructure/database/prisma';

export class WishlistService {
  /**
   * Toggle product in user's wishlist (adds if missing, removes if present)
   */
  async toggleWishlist(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) {
      throw new Error('Product not found.');
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await prisma.$transaction([
        prisma.wishlist.delete({ where: { id: existing.id } }),
        prisma.product.update({
          where: { id: productId },
          data: { likesCount: { decrement: 1 } }
        })
      ]);

      return { wishlisted: false, message: 'Removed from wishlist.' };
    } else {
      await prisma.$transaction([
        prisma.wishlist.create({
          data: { userId, productId }
        }),
        prisma.product.update({
          where: { id: productId },
          data: { likesCount: { increment: 1 } }
        })
      ]);

      return { wishlisted: true, message: 'Saved to wishlist.' };
    }
  }

  /**
   * Get user's wishlisted products
   */
  async getMyWishlist(userId: string) {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            seller: { select: { id: true, name: true, avatar: true } },
            category: { select: { name: true, slug: true } }
          }
        }
      }
    });

    return items.map(item => item.product).filter(p => !p.deletedAt);
  }
}

export const wishlistService = new WishlistService();
