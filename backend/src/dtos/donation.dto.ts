import { UserDTO } from "./user.dto";

export class DonationDTO {
  id!: string;
  stripeSessionId!: string;
  stripePaymentId!: string;
  amount!: number;
  campaign!: string;
  message?: string;
  isAnonymous!: boolean;
  userId?: UserDTO | null;
  status!: "pending" | "completed" | "failed" | "refunded";
  date!: string;
  createdAt!: string;
  updatedAt!: string;
}
