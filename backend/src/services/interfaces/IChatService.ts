import { ConversationDTO } from "../../dtos/conversation.dto";
import { MessageDTO } from "../../dtos/message.dto";
import { IMessageDocument } from "../../interfaces/chat.interface";

export interface IChatService {
    sendMessage(senderId: string, receiverId: string, content: string, requestId: string, senderType: 'users' | 'volunteers', receiverType: 'users' | 'volunteers', uploadedMediaUrls: string[]): Promise<IMessageDocument>;
    uploadMedia(mediaFiles: Express.Multer.File[], requestId: string): Promise<string[]>
    getConversationMessages(requestId: string): Promise<MessageDTO[]>;
    getUserConversations(userId: string): Promise<ConversationDTO[]>;
    markConversationAsRead(conversationId: string, userId: string): Promise<void>;
}