// interfaces/chatInterface.ts
import mongoose from 'mongoose';

export interface IMessage {
  _id?: mongoose.Types.ObjectId | string;
  sender: mongoose.Schema.Types.ObjectId | string;
  senderType: 'users' | 'volunteers';
  receiver: mongoose.Schema.Types.ObjectId | string;
  receiverType: 'users' | 'volunteers';
  content: string;
  read: boolean;
  requestId: mongoose.Schema.Types.ObjectId | string;
  conversationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  media: string[];
}

export interface IMessageDocument extends IMessage, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  participants: (mongoose.Types.ObjectId | string)[];
  participantType: 'users' | 'volunteers';
  requestId: mongoose.Types.ObjectId | string;
  lastMessage?: string;
  lastMessageTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversationDocument extends mongoose.Document, IConversation {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface AuthMessage extends WebSocketMessage {
  type: 'auth';
  token: string;
}

export interface JoinConversationMessage extends WebSocketMessage {
  type: 'join-conversation';
  requestId: string;
}

export interface LeaveConversationMessage extends WebSocketMessage {
  type: 'leave-conversation';
  requestId: string;
}

export interface TypingMessage extends WebSocketMessage {
  type: 'typing';
  requestId: string;
  isTyping: boolean;
}

export interface NewMessageNotification extends WebSocketMessage {
  type: 'new-message';
  message: IMessage;
}

export interface TypingNotification extends WebSocketMessage {
  type: 'user-typing';
  userId: string;
  isTyping: boolean;
}