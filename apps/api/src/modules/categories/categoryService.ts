import { prisma } from '../../infrastructure/database/prisma';

export class CategoryService {
  /**
   * Get all active categories with product counts
   */
  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  /**
   * Admin: Add a new category
   */
  async createCategory(name: string, slug: string, icon?: string, description?: string) {
    const slugFormatted = slug.toLowerCase().trim().replace(/\s+/g, '-');
    
    const existing = await prisma.category.findUnique({
      where: { slug: slugFormatted }
    });

    if (existing) {
      throw new Error(`Category with slug '${slugFormatted}' already exists.`);
    }

    return prisma.category.create({
      data: {
        name,
        slug: slugFormatted,
        icon,
        description
      }
    });
  }
}

export const categoryService = new CategoryService();
