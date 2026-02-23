import { injectable, inject } from 'tsyringe';
import { INotificationService } from '../interfaces/INotificationService';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository';
import { INotificationDocument } from '../../models/notification.model';
import { NotificationDTO } from '../../dtos/notification.dto';
import { toNotificationListDTO } from '../../mappers/notification.mapper';

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject('INotificationRepository') private readonly _notificationRepository: INotificationRepository,
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
        return await this._notificationRepository.createNotification({
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

    async getUserNotifications(userId: string): Promise<NotificationDTO[]> {
        const notifications = await this._notificationRepository.getUserNotifications(userId);
        return toNotificationListDTO(notifications);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await this._notificationRepository.getUnreadCount(userId);
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this._notificationRepository.markAsRead(notificationId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this._notificationRepository.markAllAsRead(userId);
    }

    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        await this._notificationRepository.deleteNotification(notificationId);
    }

    async deleteAllNotifications(userId: string): Promise<void> {
        await this._notificationRepository.deleteAllUserNotifications(userId);
    }
}