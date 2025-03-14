import { IConversationDocument, IMessageDocument } from "../../interfaces/chat.interface";

export interface IChatRepository {
  createMessage(messageData: Partial<IMessageDocument>): Promise<IMessageDocument>;
  getMessagesByRequestId(requestId: string): Promise<IMessageDocument[]>;
  getConversationByRequestId(requestId: string): Promise<IConversationDocument | null>;
  createOrUpdateConversation(conversationData: Partial<IConversationDocument>): Promise<IConversationDocument>;
  getUserConversations(userId: string): Promise<IConversationDocument[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
}