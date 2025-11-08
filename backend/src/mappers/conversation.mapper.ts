import { plainToInstance } from 'class-transformer';
import { ConversationDTO } from '../dtos/conversation.dto';
import { IConversationDocument } from '../interfaces/chat.interface';

export const toConversationDTO = (conversation: IConversationDocument): ConversationDTO => {
  return plainToInstance(ConversationDTO, {
    id: conversation._id.toString(),
    participants: conversation.participants.map(p => p.toString()),
    participantType: conversation.participantType,
    requestId: conversation.requestId.toString(),
    lastMessage: conversation.lastMessage,
    lastMessageTime: conversation.lastMessageTime?.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  });
};

export const toConversationListDTO = (conversations: IConversationDocument[]): ConversationDTO[] => {
  return conversations.map(toConversationDTO);
};
