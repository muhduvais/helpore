import express from 'express';
import { container } from 'tsyringe';
import { IChatController } from '../controllers/interfaces/IChatController';

const router = express.Router();

const chatController = container.resolve<IChatController>('IChatController');

router.post('/messages', chatController.sendMessage);
router.get('/conversations/:requestId/messages', chatController.getConversationMessages);
router.get('/conversations', chatController.getUserConversations);
router.put('/conversations/:conversationId/read', chatController.markConversationAsRead);

export default router;