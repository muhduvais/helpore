import { injectable, inject } from 'tsyringe';
import { IMessageDocument, IConversationDocument } from '../interfaces/chatInterface';
import { IChatService } from './interfaces/ServiceInterface';
import { IChatRepository } from '../repositories/interfaces/IChatRepository';

@injectable()
export class ChatService implements IChatService {
    constructor(
        @inject('IChatRepository') private readonly chatRepository: IChatRepository,
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