import express from 'express';
import { container } from 'tsyringe';
import { IChatController } from '../controllers/interfaces/IChatController';
import { uploadMultipleMiddleware } from '../middlewares';

const router = express.Router();

const chatController = container.resolve<IChatController>('IChatController');

router.post('/messages', chatController.sendMessage);
router.get('/conversations/:requestId/messages', chatController.getConversationMessages);
router.get('/conversations', chatController.getUserConversations);
router.put('/conversations/:conversationId/read', chatController.markConversationAsRead);
router.post('/media/:requestId', uploadMultipleMiddleware('files', 5), chatController.uploadMedia);

export default router;