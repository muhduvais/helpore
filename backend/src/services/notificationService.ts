import { injectable, inject } from 'tsyringe';
import { INotificationService } from './interfaces/ServiceInterface';
import { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import { INotificationDocument } from '../models/notificationModel';

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject('INotificationRepository') private readonly notificationRepository: INotificationRepository,
    ) { }

    async createNotification(
        userId: string, 
        userType: 'users' | 'volunteers', 
        type: 'message' | 'system', 
        content: string, 
        requestId?: string, 
        sender?: string,
        senderType?: 'users' | 'volunteers'
    ): Promise<INotificationDocument> {
        return await this.notificationRepository.createNotification({
            user: userId,
            userType,
            type,
            content,
            read: false,
            requestId,
            sender,
            senderType
        });
    }

    async getUserNotifications(userId: string): Promise<INotificationDocument[]> {
        return await this.notificationRepository.getUserNotifications(userId);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await this.notificationRepository.getUnreadCount(userId);
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        // You can add additional check to ensure user owns the notification
        await this.notificationRepository.markAsRead(notificationId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.markAllAsRead(userId);
    }

    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        // You can add additional check to ensure user owns the notification
        await this.notificationRepository.deleteNotification(notificationId);
    }

    async deleteAllNotifications(userId: string): Promise<void> {
        await this.notificationRepository.deleteAllUserNotifications(userId);
    }
}