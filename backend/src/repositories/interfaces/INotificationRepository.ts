import { IUser, IUserDocument } from "../../interfaces/user.interface";
import { INotificationDocument } from "../../models/notification.model";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationRepository {
    createNotification(notificationData: Partial<INotificationDocument>): Promise<INotificationDocument>;
    getUserNotifications(userId: string): Promise<INotificationDocument[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
    deleteAllUserNotifications(userId: string): Promise<void>;
}