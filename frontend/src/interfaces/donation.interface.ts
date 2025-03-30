import mongoose from "mongoose";
import { IUser } from "./userInterface";

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