import { injectable } from "tsyringe";
import { IUser, IUserDocument } from "../../interfaces/user.interface";
import User from "../../models/user.model";
import { v2 as cloudinary } from 'cloudinary';
import { IUserRepository } from "../interfaces/IUserRepository";
import { BaseRepository } from "./base.repository";

@injectable()
export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
    constructor() {
        super(User);
    }

    async createUser(userData: Partial<IUser>): Promise<IUserDocument> {
        return await this.create(userData);
      }

    async findUsers(query: object, skip: number, limit: number): Promise<IUserDocument[] | null> {
        return await this.findAll(query, skip, limit);
    }

    async findUserById(id: string): Promise<IUserDocument | null> {
        return await this.findById(id);
    }

    async findUserByEmail(email: string): Promise<IUserDocument | null> {
        return await User.findOne({ email, role: 'user' });
    }

    async findUserDetails(id: string): Promise<IUserDocument | null> {
        return await this.findById(id);
    }

    async updateUser(id: string, submitData: Partial<IUserDocument>): Promise<IUserDocument | null> {
        return await this.findByIdAndUpdate(id, submitData);
    }

    async countUsers(query: object): Promise<number> {
        return await this.count(query);
    }

    async findPassword(userId: string): Promise<string | null> {
        try {
            const user = await this.findById(userId);
            return user?.password || null;
        } catch (error) {
            console.error("Error finding password:", error);
            return null;
        }
    }

    async updatePassword(userId: string, newPassword: string): Promise<boolean> {
        try {
            await this.findByIdAndUpdate(userId, { password: newPassword });
            return true;
        } catch (error) {
            console.error("Error updating password:", error);
            return false;
        }
    }

    async updateProfilePicture(userId: string, profilePicture: string): Promise<boolean> {
        try {
            await this.findByIdAndUpdate(userId, { profilePicture });
            return true;
        } catch (error) {
            console.error("Error updating profile picture:", error);
            return false;
        }
    }

    async updateUserCertificates(userId: string, uploadedCertificateUrl: string): Promise<boolean> {
        try {
            await this.findByIdAndUpdate(userId, { 
                $push: { certificates: uploadedCertificateUrl }
            });
            return true;
        } catch (error) {
            console.error("Error updating profile picture:", error);
            return false;
        }
    }

    async deleteFile(publicId: string): Promise<any> {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          
          if (result.result !== 'ok') {
            throw new Error(`Failed to delete file from Cloudinary: ${result.result}`);
          }
          
          return result;
        } catch (error) {
          console.error('Repository - Error deleting file from Cloudinary:', error);
          throw error;
        }
      };

      async removeCertificateUrl(userId: string, certificateUrl: string): Promise<IUser> {
        try {
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { certificates: certificateUrl } },
            { new: true }
          );
          
          if (!updatedUser) {
            throw new Error('User not found');
          }
          
          return updatedUser;
        } catch (error) {
          console.error('Repository - Error removing certificate URL from user:', error);
          throw error;
        }
      };

      async checkCertificate(userId: string): Promise<boolean | undefined> {
        try {
          const user = await this.findById(userId);
          if (!user) return;
          return user.certificates.length > 0;
        } catch (error) {
          console.error('Error checking the certificates:', error);
          throw error;
        }
      };
}