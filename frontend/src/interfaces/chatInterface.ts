import mongoose from 'mongoose';

export interface IMessage {
  sender: mongoose.Schema.Types.ObjectId;
  receiver: mongoose.Schema.Types.ObjectId;
  content: string;
  read: boolean;
  requestId: mongoose.Schema.Types.ObjectId;
}

export interface IMessageDocument extends IMessage, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  participants: mongoose.Schema.Types.ObjectId[];
  requestId: mongoose.Schema.Types.ObjectId;
  lastMessage: string;
  lastMessageTime: Date;
}

export interface IConversationDocument extends IConversation, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}