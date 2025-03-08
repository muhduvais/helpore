import { IUser, IUserDocument } from "../../interfaces/userInterface";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUserDocument> {
    createUser(userData: Partial<IUser>): Promise<IUserDocument>;
    findUsers(query: object, skip: number, limit: number): Promise<IUserDocument[] | null>;
    findUserById(id: string): Promise<IUserDocument | null>;
    findUserByEmail(email: string): Promise<IUserDocument | null>;
    findUserDetails(id: string): Promise<IUserDocument | null>;
    updateUser(id: string, submitData: Partial<IUserDocument>): Promise<IUserDocument | null>;
    findPassword(userId: string): Promise<string | null>;
    updatePassword(userId: string, newPassword: string): Promise<boolean>;
    updateProfilePicture(userId: string, profilePicture: string): Promise<boolean>;
    countUsers(query: object): Promise<number>;
    updateUserCertificates(userId: string, uploadedCertificateUrl: string): Promise<boolean>;
    deleteFile(publicId: string): Promise<any>;
    removeCertificateUrl(userId: string, certificateUrl: string): Promise<IUser>;
}