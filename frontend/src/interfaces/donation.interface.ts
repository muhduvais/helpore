import { IUser } from "./userInterface";

export interface IDonation extends Document {
  _id: string;
  stripeSessionId: string;
  stripePaymentId: string;
  amount: number;
  campaign: string;
  message?: string;
  isAnonymous: boolean;
  userId?: IUser | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}