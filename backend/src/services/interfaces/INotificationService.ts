import { NotificationDTO } from "../../dtos/notification.dto";
import { INotificationDocument } from "../../models/notification.model";

export interface INotificationService {
    createNotification(
        userId: string,
        userType: 'users' | 'volunteers',
        type: 'message' | 'system',
        content: string,
        requestId?: string,
        sender?: string,
        senderType?: 'users' | 'volunteers'
    ): Promise<INotificationDocument>;
    getUserNotifications(userId: string): Promise<NotificationDTO[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    deleteAllNotifications(userId: string): Promise<void>;
}