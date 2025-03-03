import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  stripeSessionId: string;
  stripePaymentId: string;
  amount: number;
  campaign: string;
  message?: string;
  isAnonymous: boolean;
  userId?: mongoose.Types.ObjectId | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema: Schema = new Schema(
  {
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    stripePaymentId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    campaign: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: String,
      default: ''
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      index: true,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

DonationSchema.index({ campaign: 1, status: 1, date: 1 });

const Donation = mongoose.model<IDonation>('donations', DonationSchema);
export default Donation;