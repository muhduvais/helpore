import { plainToInstance } from 'class-transformer';
import { MessageDTO } from '../dtos/message.dto';
import { IMessageDocument } from '../interfaces/chat.interface';

export const toMessageDTO = (message: IMessageDocument): MessageDTO => {
  return plainToInstance(MessageDTO, {
    id: message._id.toString(),
    sender: message.sender.toString(),
    senderType: message.senderType,
    receiver: message.receiver.toString(),
    receiverType: message.receiverType,
    content: message.content,
    read: message.read,
    requestId: message.requestId.toString(),
    conversationId: message.conversationId?.toString(),
    media: message.media || [],
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  });
};

export const toMessageListDTO = (messages: IMessageDocument[]): MessageDTO[] => {
  return messages.map(toMessageDTO);
};
