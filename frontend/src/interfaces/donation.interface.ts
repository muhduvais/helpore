import { IUser } from "./userInterface";

export interface IDonation extends Document {
  id: string;
  stripeSessionId: string;
  stripePaymentId: string;
  amount: number;
  campaign: string;
  message?: string;
  isAnonymous: boolean;
  userId?: IUser | null;
  status: "pending" | "completed" | "failed" | "refunded";
  date: string;
  createdAt: string;
  updatedAt: string;
}