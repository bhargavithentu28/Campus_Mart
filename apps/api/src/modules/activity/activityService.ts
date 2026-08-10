import { prisma } from '../../infrastructure/database/prisma';

export class ActivityService {
  /**
   * Log safe user interaction activity
   */
  async logActivity(userId: string, action: string, metadata?: any) {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          metadata: metadata || {}
        }
      });
    } catch (err) {
      console.error('Failed to log user activity:', err);
    }
  }

  /**
   * Log recently viewed item for recommendations
   */
  async logProductView(userId: string, productId: string) {
    try {
      await prisma.recentlyViewed.upsert({
        where: {
          userId_productId: { userId, productId }
        },
        update: { viewedAt: new Date() },
        create: { userId, productId }
      });
    } catch (err) {
      console.error('Failed to log product view:', err);
    }
  }
}

export const activityService = new ActivityService();
