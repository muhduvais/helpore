import { Expose } from "class-transformer";

export class UserDTO {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  age!: number;

  @Expose()
  gender!: string;

  @Expose()
  phone!: number;

  @Expose()
  email!: string;

  @Expose()
  profilePicture!: string;

  @Expose()
  certificates!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  isBlocked!: boolean;

  @Expose()
  isVerified!: boolean;

  @Expose()
  role!: string;

  @Expose()
  tasks!: number;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}
