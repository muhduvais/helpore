import { injectable, inject } from 'tsyringe';
import { IMessageDocument, IConversationDocument } from '../../interfaces/chat.interface';
import { IChatService } from '../interfaces/ServiceInterface';
import { IChatRepository } from '../../repositories/interfaces/IChatRepository';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository';
import { io } from '../../utils';
import { ErrorMessages } from '../../constants/errorMessages';

@injectable()
export class ChatService implements IChatService {
    constructor(
        @inject('IChatRepository') private readonly chatRepository: IChatRepository,
        @inject('INotificationRepository') private readonly notificationRepository: INotificationRepository,
    ) { }

    async sendMessage(
        senderId: string,
        receiverId: string,
        content: string,
        requestId: string,
        senderType: 'users' | 'volunteers',
        receiverType: 'users' | 'volunteers'
    ): Promise<IMessageDocument> {
        try {
            const message = await this.chatRepository.createMessage({
                sender: senderId,
                receiver: receiverId,
                content,
                requestId,
                read: false,
                senderType,
                receiverType,
            });

            await this.chatRepository.createOrUpdateConversation({
                participants: [senderId, receiverId],
                requestId,
                lastMessage: content,
                lastMessageTime: new Date()
            });

            // Emit new message
            io.to(`request-${requestId}`).emit('new-message', message);

            // Emit new notification
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
        } catch (error) {
            console.error(ErrorMessages.CHAT_SEND_FAILED, error);
            throw new Error(ErrorMessages.CHAT_SEND_FAILED);
        }
    }

    async getConversationMessages(requestId: string): Promise<IMessageDocument[]> {
        try {
            return await this.chatRepository.getMessagesByRequestId(requestId);
        } catch (error) {
            console.error(ErrorMessages.CHAT_FETCH_MESSAGES_FAILED, error);
            throw new Error(ErrorMessages.CHAT_FETCH_MESSAGES_FAILED);
        }
    }

    async getUserConversations(userId: string): Promise<IConversationDocument[]> {
        try {
            return await this.chatRepository.getUserConversations(userId);
        } catch (error) {
            console.error(ErrorMessages.CHAT_FETCH_CONVERSATIONS_FAILED, error);
            throw new Error(ErrorMessages.CHAT_FETCH_CONVERSATIONS_FAILED);
        }
    }

    async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
        try {
            await this.chatRepository.markMessagesAsRead(conversationId, userId);
        } catch (error) {
            console.error(ErrorMessages.CHAT_MARK_READ_FAILED, error);
            throw new Error(ErrorMessages.CHAT_MARK_READ_FAILED);
        }
    }
}