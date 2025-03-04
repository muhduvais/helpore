import mongoose, { Schema } from "mongoose";
import { IConversationDocument } from "../interfaces/chatInterface";

const conversationSchema = new Schema<IConversationDocument>({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'participantType',
    required: true
  }],
  participantType: {
    type: String,
    enum: ['users', 'volunteers'],
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'requests',
    required: true
  },
  lastMessage: {
    type: String,
    required: false
  },
  lastMessageTime: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

const Conversation = mongoose.model<IConversationDocument>('conversations', conversationSchema);
export default Conversation;