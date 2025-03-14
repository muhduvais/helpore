import { injectable } from 'tsyringe';
import Notification, { INotificationDocument } from '../../models/notification.model';
import { INotificationRepository } from '../interfaces/INotificationRepository';

@injectable()
export class NotificationRepository implements INotificationRepository {
  async createNotification(notificationData: Partial<INotificationDocument>): Promise<INotificationDocument> {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async getUserNotifications(userId: string): Promise<INotificationDocument[]> {
    return await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ user: userId, read: false });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await Notification.findByIdAndDelete(notificationId);
  }

  async deleteAllUserNotifications(userId: string): Promise<void> {
    await Notification.deleteMany({ user: userId });
  }
}