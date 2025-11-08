import { injectable, inject } from 'tsyringe';
import { IMessageDocument, IConversationDocument } from '../../interfaces/chat.interface';
import { IChatService } from '../interfaces/ServiceInterface';
import { IChatRepository } from '../../repositories/interfaces/IChatRepository';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository';
import { io, uploadToCloudinary } from '../../utils';
import { ErrorMessages } from '../../constants/errorMessages';
import { MessageDTO } from '../../dtos/message.dto';
import { toMessageListDTO } from '../../mappers/message.mapper';
import { ConversationDTO } from '../../dtos/conversation.dto';
import { toConversationListDTO } from '../../mappers/conversation.mapper';

export type CloudinaryFile = { public_id: string; secure_url: string };

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
        receiverType: 'users' | 'volunteers',
        uploadedMediaUrls: string[]
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
                media: uploadedMediaUrls,
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
                media: uploadedMediaUrls,
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
                media: uploadedMediaUrls,
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


    async uploadMedia(mediaFiles: Express.Multer.File[], requestId: string): Promise<string[]> {
        try {
            const results = await uploadToCloudinary(mediaFiles, 'message-media', requestId);

            const mediaUrls = results.map((fileObj) => fileObj.secure_url);

            return mediaUrls;
        } catch (error) {
            console.error(ErrorMessages.CHAT_UPLOAD_MEDIA_FAILED, error);
            throw new Error(ErrorMessages.CHAT_UPLOAD_MEDIA_FAILED);
        }
    }

    async getConversationMessages(requestId: string): Promise<MessageDTO[]> {
        try {
            const messages = await this.chatRepository.getMessagesByRequestId(requestId);
            if (!messages) {
                throw new Error(ErrorMessages.CHAT_FETCH_MESSAGES_FAILED);
            }
            return toMessageListDTO(messages);
        } catch (error) {
            console.error(ErrorMessages.CHAT_FETCH_MESSAGES_FAILED, error);
            throw new Error(ErrorMessages.CHAT_FETCH_MESSAGES_FAILED);
        }
    }

    async getUserConversations(userId: string): Promise<ConversationDTO[]> {
        try {
            const conversations = await this.chatRepository.getUserConversations(userId);
            if (!conversations) {
                throw new Error(ErrorMessages.CHAT_FETCH_MESSAGES_FAILED);
            }
            return toConversationListDTO(conversations);
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