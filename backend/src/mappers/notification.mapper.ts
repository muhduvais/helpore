import { plainToInstance } from "class-transformer"
import { INotificationDocument } from "../models/notification.model";
import { NotificationDTO } from "../dtos/notification.dto";

export const toNotificationDTO = (notification: INotificationDocument): NotificationDTO => {
    return plainToInstance(NotificationDTO, {
        id: notification._id,
        user: notification.user,
        type: notification.type,
        content: notification.content,
        read: notification.read,
        createdAt: notification.createdAt,
        requestId: notification.requestId,
        sender: notification.sender,
        userType: notification.userType,
        senderType: notification.senderType,
        media: notification.media,
    });
}

export const toNotificationListDTO = (notifications: INotificationDocument[]): NotificationDTO[] => {
    return notifications.map((notification) => toNotificationDTO(notification));
}