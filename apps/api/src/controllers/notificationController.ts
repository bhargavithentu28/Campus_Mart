import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { notificationService } from '../modules/notifications/notificationService';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const data = await notificationService.getUserNotifications(userId);
    return res.status(200).json({ success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await notificationService.markAsRead(id, userId);
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
