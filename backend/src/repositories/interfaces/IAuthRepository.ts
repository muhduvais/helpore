import { IUser, IUserDocument } from "../../interfaces/user.interface";
import { IUserCreationData } from "../implementation/auth.repository";

export interface IAuthRepository {
  findUser(email: string): Promise<IUserDocument | null>;
  findUserById(userId: string): Promise<IUser | null>;
  findIsBlocked(userId: string): Promise<boolean | null>;
  createUser(userData: IUserCreationData): Promise<IUserDocument | null>;
  storeResetToken(email: string, resetToken: string, tokenExpiry: Date): Promise<void>;
  resetPassword(email: string, password: string): Promise<void>;
  findUserByResetToken(resetToken: string): Promise<IUser | null>;
}