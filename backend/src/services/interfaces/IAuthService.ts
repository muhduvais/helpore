import { IUser, IUserDocument } from "../../interfaces/user.interface";

export interface IAuthService {
    registerUser(name: string, email: string, password: string): Promise<string | boolean | null>;
    resendOtp(email: string): Promise<string | null>;
    generateOtp(email: string): Promise<string | null>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    verifyLogin(email: string, password: string): Promise<any>;
    generateAccessToken(userId: string, role: string): Promise<string>;
    generateRefreshToken(userId: string, role: string): Promise<string>;
    verifyRefreshToken(refreshToken: string): Promise<any>;
    findIsBlocked(userId: string): Promise<boolean | null>;
    findOrCreateUser(profile: any): Promise<IUserDocument | null>;
    findUserById(userId: string): Promise<IUser | null>;
    sendResetLink(email: string): Promise<boolean | null>;
    resetPassword(email: string, password: string): Promise<void>;
}