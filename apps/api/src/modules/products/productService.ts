import { TransactionType, ProductStatus, ProductCondition, Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma';
import { moderateListing, predictPrice } from '../../services/gemini';

export interface QueryProductsFilter {
  search?: string;
  category?: string;
  condition?: ProductCondition;
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  collegeId?: string;
  departmentId?: string;
  status?: ProductStatus;
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  rentalPrice?: number;
  condition: ProductCondition;
  categorySlug: string;
  transactionType?: TransactionType;
  images: string[];
  pickupLocation: string;
  pickupTime?: string;
  isNegotiable?: boolean;
  departmentId?: string;
  tags?: string[];
}

// State Machine Allowed Transitions Guard
const ALLOWED_STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  DRAFT: [ProductStatus.ACTIVE, ProductStatus.PENDING_REVIEW, ProductStatus.ARCHIVED],
  PENDING_REVIEW: [ProductStatus.ACTIVE, ProductStatus.REJECTED, ProductStatus.ARCHIVED],
  ACTIVE: [ProductStatus.RESERVED, ProductStatus.SOLD, ProductStatus.RENTED, ProductStatus.BORROWED, ProductStatus.EXCHANGED, ProductStatus.DONATED, ProductStatus.EXPIRED, ProductStatus.ARCHIVED],
  RESERVED: [ProductStatus.ACTIVE, ProductStatus.SOLD, ProductStatus.RENTED, ProductStatus.BORROWED, ProductStatus.EXCHANGED, ProductStatus.DONATED, ProductStatus.ARCHIVED],
  SOLD: [ProductStatus.ARCHIVED],
  RENTED: [ProductStatus.ACTIVE, ProductStatus.ARCHIVED],
  BORROWED: [ProductStatus.ACTIVE, ProductStatus.ARCHIVED],
  EXCHANGED: [ProductStatus.ARCHIVED],
  DONATED: [ProductStatus.ARCHIVED],
  EXPIRED: [ProductStatus.ACTIVE, ProductStatus.ARCHIVED],
  REJECTED: [ProductStatus.ARCHIVED],
  ARCHIVED: []
};

export class ProductService {
  /**
   * Fetch paginated marketplace products with multi-filter support
   */
  async getProducts(filters: QueryProductsFilter) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: filters.status || ProductStatus.ACTIVE
    };

    if (filters.collegeId) {
      where.collegeId = filters.collegeId;
    }

    if (filters.category) {
      where.categorySlug = filters.category.toLowerCase();
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.transactionType) {
      where.transactionType = filters.transactionType;
    }

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search.toLowerCase() } }
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (filters.sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (filters.sort === 'popular') {
      orderBy = { viewsCount: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              badges: true,
              isVerified: true
            }
          },
          college: {
            select: { id: true, name: true, code: true }
          },
          category: {
            select: { name: true, slug: true, icon: true }
          },
          aiAnalysis: {
            select: { scamScore: true, isFlagged: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Get single product listing by ID (increments view counter)
   */
  async getProductById(productId: string) {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { viewsCount: { increment: 1 } },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            badges: true,
            isVerified: true,
            createdAt: true,
            _count: { select: { products: true, reviewsReceived: true } }
          }
        },
        college: true,
        department: true,
        category: true,
        aiAnalysis: true
      }
    });

    if (!product || product.deletedAt) {
      throw new Error('Product listing not found.');
    }

    return product;
  }

  /**
   * Create new marketplace listing (runs AI checks & saves image URLs)
   */
  async createProduct(sellerId: string, collegeId: string, data: CreateProductData) {
    const moderation = await moderateListing(data.title, data.description, data.price, data.categorySlug);
    const pricingPrediction = await predictPrice(data.title, data.categorySlug, data.condition, data.price);

    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        rentalPrice: data.rentalPrice,
        condition: data.condition,
        categorySlug: data.categorySlug.toLowerCase(),
        sellerId,
        collegeId,
        departmentId: data.departmentId,
        pickupLocation: data.pickupLocation,
        pickupTime: data.pickupTime,
        isNegotiable: data.isNegotiable ?? false,
        transactionType: data.transactionType ?? TransactionType.SELL,
        status: moderation.isFlagged ? ProductStatus.PENDING_REVIEW : ProductStatus.ACTIVE,
        tags: data.tags || [],
        images: {
          create: data.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0
          }))
        },
        aiAnalysis: {
          create: {
            recommendedPrice: pricingPrediction.recommendedPrice,
            quickSalePrice: pricingPrediction.quickSalePrice,
            marketPrice: pricingPrediction.marketPrice,
            scamScore: moderation.scamScore,
            aiSummary: pricingPrediction.explanation,
            isFlagged: moderation.isFlagged
          }
        }
      },
      include: {
        images: true,
        seller: {
          select: { id: true, name: true, avatar: true }
        },
        aiAnalysis: true
      }
    });

    return product;
  }

  /**
   * Update listing details (with ownership guard)
   */
  async updateProduct(productId: string, userId: string, isAdmin: boolean, data: Partial<CreateProductData>) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.deletedAt) {
      throw new Error('Product not found.');
    }

    if (existing.sellerId !== userId && !isAdmin) {
      throw new Error('Not authorized to modify this listing.');
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title ?? existing.title,
        description: data.description ?? existing.description,
        price: data.price ?? existing.price,
        rentalPrice: data.rentalPrice ?? existing.rentalPrice,
        condition: data.condition ?? existing.condition,
        pickupLocation: data.pickupLocation ?? existing.pickupLocation,
        pickupTime: data.pickupTime ?? existing.pickupTime,
        isNegotiable: data.isNegotiable ?? existing.isNegotiable
      },
      include: { images: true }
    });
  }

  /**
   * Transition product status using strict State Machine rules
   */
  async changeStatus(productId: string, userId: string, isAdmin: boolean, targetStatus: ProductStatus) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.deletedAt) {
      throw new Error('Product not found.');
    }

    if (existing.sellerId !== userId && !isAdmin) {
      throw new Error('Not authorized to modify this listing status.');
    }

    const currentStatus = existing.status;
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus) && !isAdmin) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${targetStatus}.`);
    }

    return prisma.product.update({
      where: { id: productId },
      data: { status: targetStatus }
    });
  }

  /**
   * Delete listing (Soft delete)
   */
  async deleteProduct(productId: string, userId: string, isAdmin: boolean) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new Error('Product not found.');
    }

    if (existing.sellerId !== userId && !isAdmin) {
      throw new Error('Not authorized to delete this listing.');
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date()
      }
    });
  }

  /**
   * Get products by seller ID
   */
  async getProductsBySeller(sellerId: string) {
    return prisma.product.findMany({
      where: { sellerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { images: true, category: true }
    });
  }
}

export const productService = new ProductService();
