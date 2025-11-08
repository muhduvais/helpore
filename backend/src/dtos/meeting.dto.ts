import { Expose } from "class-transformer";

export class MeetingDTO {
  @Expose()
  id!: string;

  @Expose()
  adminId!: string;

  @Expose()
  title!: string;

  @Expose()
  participants!: string[];

  @Expose()
  scheduledTime!: Date;

  @Expose()
  status!: "scheduled" | "active" | "completed" | "cancelled";

  @Expose()
  createdAt!: Date;
}
