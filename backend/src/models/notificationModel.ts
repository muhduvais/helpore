import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  user: mongoose.Types.ObjectId | string;
  type: 'message' | 'system';
  content: string;
  read: boolean;
  createdAt: Date;
  requestId?: mongoose.Types.ObjectId | string;
  sender?: mongoose.Types.ObjectId | string;
  userType: string;
  senderType: string;
}

const notificationSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['users', 'volunteers']
  },
  type: {
    type: String,
    required: true,
    enum: ['message', 'system']
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  requestId: {
    type: Schema.Types.ObjectId,
    ref: 'Request'
  },
  sender: {
    type: Schema.Types.ObjectId,
    refPath: 'senderType'
  },
  senderType: {
    type: String,
    enum: ['users', 'volunteers']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.model<INotificationDocument>('notifications', notificationSchema);
export default Notification;