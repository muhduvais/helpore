import { Expose } from "class-transformer";

export class NotificationDTO {
  @Expose()
  id!: string;

  @Expose()
  user!: string;

  @Expose()
  type!: "message" | "system";

  @Expose()
  content!: string;

  @Expose()
  read!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  requestId!: string;

  @Expose()
  sender!: string;

  @Expose()
  userType!: string;

  @Expose()
  senderType!: string;

  @Expose()
  media!: string[];
}
