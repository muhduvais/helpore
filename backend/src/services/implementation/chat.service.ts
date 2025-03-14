import { injectable, inject } from 'tsyringe';
import { IMessageDocument, IConversationDocument } from '../../interfaces/chat.interface';
import { IChatService } from '../interfaces/ServiceInterface';
import { IChatRepository } from '../../repositories/interfaces/IChatRepository';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository';
import { io } from '../../utils';

@injectable()
export class ChatService implements IChatService {
    constructor(
        @inject('IChatRepository') private readonly chatRepository: IChatRepository,
        @inject('INotificationRepository') private readonly notificationRepository: INotificationRepository,
    ) { }

    async sendMessage(senderId: string, receiverId: string, content: string, requestId: string, senderType: 'users' | 'volunteers', receiverType: 'users' | 'volunteers'): Promise<IMessageDocument> {
        const message = await this.chatRepository.createMessage({
            sender: senderId,
            receiver: receiverId,
            content,
            requestId,
            read: false,
            senderType,
            receiverType,
        });

        // Update or create the conversation
        await this.chatRepository.createOrUpdateConversation({
            participants: [senderId, receiverId],
            requestId,
            lastMessage: content,
            lastMessageTime: new Date()
        });

        // Emit the message via socket.io
        io.to(`request-${requestId}`).emit('new-message', message);

        // Also emit a notification to the receiver
        io.to(`notification-${receiverId}`).emit('new-notification', {
            type: 'message',
            content: content.length > 50 ? `${content.substring(0, 50)}...` : content,
            read: false,
            requestId,
            senderId
        });

        // Create a notification for the receiver
        await this.notificationRepository.createNotification({
            user: receiverId,
            userType: receiverType,
            type: 'message',
            content: content.length > 50 ? `${content.substring(0, 50)}...` : content,
            read: false,
            requestId,
            sender: senderId,
            senderType
        });

        return message;
    }

    async getConversationMessages(requestId: string): Promise<IMessageDocument[]> {
        return this.chatRepository.getMessagesByRequestId(requestId);
    }

    async getUserConversations(userId: string): Promise<IConversationDocument[]> {
        return this.chatRepository.getUserConversations(userId);
    }

    async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
        await this.chatRepository.markMessagesAsRead(conversationId, userId);
    }
}