// models/Message.ts
import mongoose, { Schema } from "mongoose";
import { IMessageDocument } from "../interfaces/chatInterface";

const messageSchema = new Schema<IMessageDocument>({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType',
  },
  senderType: {
    type: String,
    required: true,
    enum: ['users', 'volunteers'],
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverType',
  },
  receiverType: {
    type: String,
    required: true,
    enum: ['users', 'volunteers'],
  },
  content: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'assistanceRequests',
    required: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversations',
  }
}, {
  timestamps: true,
});

const Message = mongoose.model<IMessageDocument>('messages', messageSchema);
export default Message;