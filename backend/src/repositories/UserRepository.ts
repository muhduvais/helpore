import { injectable } from "tsyringe";
import { IUser, IUserDocument } from "../interfaces/userInterface";
import User from "../models/userModel";
import { IUserRepository } from "./interfaces/IUserRepository";
import { BaseRepository } from "./BaseRepository";

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
        return await this.findByEmail(email);
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
}