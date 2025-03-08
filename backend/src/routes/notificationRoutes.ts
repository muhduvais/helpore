import express from 'express';
import { container } from 'tsyringe';
import { INotificationController } from '../controllers/interfaces/INotificationController';

const router = express.Router();

const notificationController = container.resolve<INotificationController>('INotificationController');

router.get('/', notificationController.getUserNotifications);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);
router.delete('/', notificationController.deleteAllNotifications);



export default router;
