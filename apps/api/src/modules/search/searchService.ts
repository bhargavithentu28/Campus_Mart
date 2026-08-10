import { productService, QueryProductsFilter } from '../products/productService';
import { prisma } from '../../infrastructure/database/prisma';
import { interpretNaturalLanguageQuery } from '../../services/gemini';

export class SearchService {
  /**
   * Search marketplace listings with query logging
   */
  async search(queryFilters: QueryProductsFilter, userId?: string) {
    if (userId && queryFilters.search && queryFilters.search.trim()) {
      prisma.searchHistory.create({
        data: {
          userId,
          query: queryFilters.search.trim()
        }
      }).catch(err => console.error('Failed to log search history:', err));
    }

    return productService.getProducts(queryFilters);
  }

  /**
   * Interpret Natural Language query via Gemini AI
   */
  async interpretNaturalQuery(prompt: string) {
    return interpretNaturalLanguageQuery(prompt);
  }

  /**
   * Get student search history
   */
  async getSearchHistory(userId: string) {
    return prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, query: true, createdAt: true }
    });
  }

  /**
   * Clear student search history
   */
  async clearSearchHistory(userId: string) {
    return prisma.searchHistory.deleteMany({ where: { userId } });
  }

  /**
   * Delete single search history item
   */
  async deleteSearchHistoryItem(userId: string, id: string) {
    return prisma.searchHistory.deleteMany({ where: { id, userId } });
  }

  /**
   * Get student saved searches
   */
  async getSavedSearches(userId: string) {
    return prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Create saved search configuration
   */
  async createSavedSearch(userId: string, name: string, filters: QueryProductsFilter) {
    return prisma.savedSearch.create({
      data: {
        userId,
        query: name || filters.search || 'Saved Search',
        filters: JSON.parse(JSON.stringify(filters))
      }
    });
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(userId: string, id: string) {
    return prisma.savedSearch.deleteMany({ where: { id, userId } });
  }

  /**
   * Get student recently viewed products
   */
  async getRecentlyViewed(userId: string) {
    const items = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 12,
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

    return items.map(i => i.product).filter(p => p && !p.deletedAt);
  }

  /**
   * Get trending search terms by college
   */
  async getTrendingSearches(collegeId?: string) {
    const trends = await prisma.campusTrend.findMany({
      where: collegeId ? { collegeId } : undefined,
      orderBy: { searchCount: 'desc' },
      take: 8
    });

    if (trends.length === 0) {
      return ['Cycles', 'iPads', 'Calculators', 'HC Verma Books', 'Drawing Boards', 'Study Desk', 'Lab Manuals'];
    }

    return trends.map(t => t.category);
  }

  /**
   * Get anonymized campus location heatmap
   */
  async getCampusHeatmap(collegeId?: string) {
    const heatmap = await prisma.heatmapEvent.findMany({
      where: collegeId ? { collegeId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (heatmap.length === 0) {
      return [
        { locationName: 'Hostel Block 3 Lounge', activityCount: 142, growth: '+34%' },
        { locationName: 'Central Library Courtyard', activityCount: 98, growth: '+18%' },
        { locationName: 'Main Gate Security Desk', activityCount: 76, growth: '+12%' },
        { locationName: 'Engineering Building Canteen', activityCount: 64, growth: '+8%' }
      ];
    }

    return heatmap.map(h => ({
      locationName: h.location,
      activityCount: 50,
      growth: '+15%'
    }));
  }
}

export const searchService = new SearchService();
