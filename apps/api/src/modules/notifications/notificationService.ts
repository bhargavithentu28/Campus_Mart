import { prisma } from '../../infrastructure/database/prisma';

export class NotificationService {
  /**
   * Get user's notifications sorted by newest first
   */
  async getUserNotifications(recipientId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId },
        orderBy: { createdAt: 'desc' },
        take: 30
      }),
      prisma.notification.count({
        where: { recipientId, isRead: false }
      })
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string, recipientId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, recipientId },
      data: { isRead: true }
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(recipientId: string) {
    return prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true }
    });
  }
}

export const notificationService = new NotificationService();
