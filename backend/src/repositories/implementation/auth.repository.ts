import { injectable } from "tsyringe";
import User from "../../models/user.model";
import { IUser, IUserDocument } from "../../interfaces/user.interface";
import { IAuthRepository } from "../interfaces/IAuthRepository";

@injectable()
export class AuthRepository implements IAuthRepository {
  async findUser(email: string): Promise<IUserDocument | null> {
    try {
      return await User.findOne({ email, isBlocked: false });
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async findUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findIsBlocked(userId: string): Promise<boolean | null> {
    try {
      const user = await User.findById(userId);
      return user ? user.isBlocked : null;
    } catch (error) {
      console.error('Error checking blocked status:', error);
      throw error;
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUserDocument | null> {
    try {
      const user = new User({
        ...userData,
        isVerified: true,
        role: 'user'
      });
      
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async storeResetToken(email: string, resetToken: string, tokenExpiry: Date): Promise<void> {
    try {
      await User.updateOne(
        { email },
        { 
          resetToken,
          resetTokenExpiry: tokenExpiry,
        }
      );
    } catch (error) {
      console.error('Error storing reset token:', error);
      throw error;
    }
  }

  async resetPassword(email: string, password: string): Promise<void> {
    try {
      await User.updateOne(
        { email },
        { 
          password,
          resetToken: null,
          resetTokenExpiry: null
        }
      );
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async findUserByResetToken(resetToken: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        resetToken,
        resetTokenExpiry: { $gt: new Date() }
      });
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    }
  }
}