import { IUser, IUserDocument } from "../../interfaces/userInterface";
import { INotificationDocument } from "../../models/notificationModel";
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