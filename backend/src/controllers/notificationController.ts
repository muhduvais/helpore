import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { INotificationService } from '../services/interfaces/ServiceInterface';

@injectable()
export class NotificationController {
    constructor(
        @inject('INotificationService') private readonly notificationService: INotificationService,
    ) {
        this.getUserNotifications = this.getUserNotifications.bind(this);
        this.markAsRead = this.markAsRead.bind(this);
        this.markAllAsRead = this.markAllAsRead.bind(this);
        this.deleteNotification = this.deleteNotification.bind(this);
        this.deleteAllNotifications = this.deleteAllNotifications.bind(this);
    }

    async getUserNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;
            const notifications = await this.notificationService.getUserNotifications(userId);
            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching notifications',
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.params;
            const userId = req.user.userId;
            await this.notificationService.markAsRead(notificationId, userId);
            res.status(200).json({ success: true, message: 'Notification marked as read' });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error marking notification as read', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;
            await this.notificationService.markAllAsRead(userId);
            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error marking all notifications as read', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async deleteNotification(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.params;
            const userId = req.user.userId;
            await this.notificationService.deleteNotification(notificationId, userId);
            res.status(200).json({ success: true, message: 'Notification deleted' });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error deleting notification', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async deleteAllNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;
            await this.notificationService.deleteAllNotifications(userId);
            res.status(200).json({ success: true, message: 'All notifications deleted' });
        } catch (error) {
            console.error('Error deleting all notifications:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error deleting all notifications', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }
}