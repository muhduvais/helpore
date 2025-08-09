import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { INotificationService } from '../../services/interfaces/ServiceInterface';
import { JwtPayload } from 'jsonwebtoken';
import { HttpStatusCode } from '../../constants/httpStatus';
import { ErrorMessages } from '../../constants/errorMessages';

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
            const { userId } = req.user as JwtPayload;
            const notifications = await this.notificationService.getUserNotifications(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data: notifications });
        } catch (error) {
            console.error(ErrorMessages.NOTIFICATION_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: ErrorMessages.NOTIFICATION_FETCH_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.params;
            const { userId } = req.user as JwtPayload;
            await this.notificationService.markAsRead(notificationId, userId);
            res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.NOTIFICATION_MARK_READ_SUCCESS });
        } catch (error) {
            console.error(ErrorMessages.NOTIFICATION_MARK_READ_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: ErrorMessages.NOTIFICATION_MARK_READ_FAILED, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user as JwtPayload;
            await this.notificationService.markAllAsRead(userId);
            res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.NOTIFICATION_MARK_ALL_READ_SUCCESS });
        } catch (error) {
            console.error(ErrorMessages.NOTIFICATION_MARK_ALL_READ_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: ErrorMessages.NOTIFICATION_MARK_ALL_READ_FAILED, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async deleteNotification(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.params;
            const { userId } = req.user as JwtPayload;
            await this.notificationService.deleteNotification(notificationId, userId);
            res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.NOTIFICATION_DELETE_SUCCESS });
        } catch (error) {
            console.error(ErrorMessages.NOTIFICATION_DELETE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: ErrorMessages.NOTIFICATION_DELETE_FAILED, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    async deleteAllNotifications(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user as JwtPayload;
            await this.notificationService.deleteAllNotifications(userId);
            res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.NOTIFICATION_DELETE_ALL_SUCCESS });
        } catch (error) {
            console.error(ErrorMessages.NOTIFICATION_DELETE_ALL_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: ErrorMessages.NOTIFICATION_DELETE_ALL_FAILED, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }
}