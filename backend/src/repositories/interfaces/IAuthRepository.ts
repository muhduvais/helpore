import { IUser, IUserDocument } from "../../interfaces/user.interface";

export interface IAuthRepository {
  findUser(email: string): Promise<IUserDocument | null>;
  findUserById(userId: string): Promise<IUser | null>;
  findIsBlocked(userId: string): Promise<boolean | null>;
  createUser(userData: Partial<IUser>): Promise<IUserDocument | null>;
  storeResetToken(email: string, resetToken: string, tokenExpiry: Date): Promise<void>;
  resetPassword(email: string, password: string): Promise<void>;
  findUserByResetToken(resetToken: string): Promise<IUser | null>;
}