import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IChatController } from '../interfaces/IChatController';
import { IChatService } from '../../services/interfaces/ServiceInterface';
import { JwtPayload } from 'jsonwebtoken';

@injectable()
export class ChatController implements IChatController {
    constructor(
        @inject('IChatService') private readonly chatService: IChatService,
    ) {
        this.sendMessage = this.sendMessage.bind(this);
        this.getConversationMessages = this.getConversationMessages.bind(this);
        this.getUserConversations = this.getUserConversations.bind(this);
        this.markConversationAsRead = this.markConversationAsRead.bind(this);
    }

    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { receiverId, content, requestId, senderType, receiverType } = req.body;
            const { userId: senderId } = req.user as JwtPayload;

            const message = await this.chatService.sendMessage(senderId, receiverId, content, requestId, senderType, receiverType);
            res.status(201).json({ success: true, data: message });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ success: false, message: 'Error sending message', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async getConversationMessages(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const messages = await this.chatService.getConversationMessages(requestId);
            res.status(200).json({ success: true, messages });
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ success: false, message: 'Error fetching messages', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async getUserConversations(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user as JwtPayload;
            const conversations = await this.chatService.getUserConversations(userId);
            res.status(200).json({ success: true, messages: conversations });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({ success: false, message: 'Error fetching conversations', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async markConversationAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { conversationId } = req.params;
            const { userId } = req.user as JwtPayload;

            await this.chatService.markConversationAsRead(conversationId, userId);
            res.status(200).json({ success: true, message: 'Messages marked as read' });
        } catch (error) {
            console.error('Error marking messages as read:', error);
            res.status(500).json({ success: false, message: 'Error marking messages as read', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
}