import { injectable } from "tsyringe";
import Message from '../../models/message.model';
import Conversation from '../../models/conversation.model';
import { IMessageDocument, IConversationDocument } from '../../interfaces/chat.interface';
import mongoose from 'mongoose';
import { IChatRepository } from '../interfaces/IChatRepository';
import { io } from "../../utils";

@injectable()
export class ChatRepository implements IChatRepository {

    async createMessage(messageData: Partial<IMessageDocument>): Promise<IMessageDocument> {
        const message = new Message(messageData);
        const savedMessage = await message.save();

        const requestId = String(messageData.requestId);


        return savedMessage;
    }


    async getMessagesByRequestId(requestId: string): Promise<IMessageDocument[]> {
        return await Message.find({ requestId: new mongoose.Types.ObjectId(requestId) })
            .sort({ createdAt: 1 });
    }

    async getConversationByRequestId(requestId: string): Promise<IConversationDocument | null> {
        return await Conversation.findOne({ requestId: new mongoose.Types.ObjectId(requestId) });
    }

    async createOrUpdateConversation(conversationData: Partial<IConversationDocument>): Promise<IConversationDocument> {
        const { requestId, lastMessage, lastMessageTime, participants } = conversationData;

        const conversation = await Conversation.findOneAndUpdate(
            { requestId: new mongoose.Types.ObjectId(requestId as string) },
            {
                $set: { lastMessage, lastMessageTime },
                $setOnInsert: { participants }
            },
            { new: true, upsert: true }
        );

        return conversation;
    }

    async getUserConversations(userId: string): Promise<IConversationDocument[]> {
        return await Conversation.find({
            participants: new mongoose.Types.ObjectId(userId)
        })
            .sort({ lastMessageTime: -1 });
    }

    async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
        await Message.updateMany(
            {
                conversationId: new mongoose.Types.ObjectId(conversationId),
                receiver: new mongoose.Types.ObjectId(userId),
                read: false
            },
            { $set: { read: true } }
        );
    }
}