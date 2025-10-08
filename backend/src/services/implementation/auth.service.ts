import { inject, injectable } from 'tsyringe';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../../utils';
import { sendOtpEmail } from './otp.service';
import { sendResetEmail } from '../../utils';
import { IUser, IUserDocument } from '../../interfaces/user.interface';
import { redisClient } from '../../utils';
import { IAuthRepository } from '../../repositories/interfaces/IAuthRepository';
import { IOtpRepository } from '../../repositories/interfaces/IOtpRepository';
import { IAuthService } from '../interfaces/ServiceInterface';
import { IUserCreationData } from '../../repositories/implementation/auth.repository';
import { IAddressRepository } from '../../repositories/interfaces/IAddressRepository';
import { Types } from 'mongoose';
import { ErrorMessages } from '../../constants/errorMessages'; // <-- Add this import

@injectable()
export class AuthService implements IAuthService {

    constructor(
        @inject('IAuthRepository') private readonly authRepository: IAuthRepository,
        @inject('IAddressRepository') private readonly addressRepository: IAddressRepository,
        @inject('IOtpRepository') private readonly otpRepository: IOtpRepository
    ) { }

    async registerUser(name: string, email: string, password: string): Promise<string | boolean | null> {
        try {
            const existingUser = await this.authRepository.findUser(email);
            if (existingUser) {
                return false;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const otp = generateOTP();

            const registrationData = {
                name,
                email,
                password: hashedPassword,
                otp,
            };

            await redisClient.setEx(`temp_registration:${email}`, 3600, JSON.stringify(registrationData));

            await sendOtpEmail(email, otp);
            console.log('OTP:', otp);

            return email;
        } catch (error) {
            console.error(ErrorMessages.REGISTER_USER_FAILED, error);
            return null;
        }
    }

    async resendOtp(email: string): Promise<string | null> {
        try {
            const redisData = await redisClient.get(`temp_registration:${email}`);
            if (!redisData) {
                console.log(ErrorMessages.EMAIL_NOT_FOUND_TEMP_REGISTRATION);
                return null;
            }

            const registrationData = JSON.parse(redisData);

            const newOtp = generateOTP();

            const updatedData = {
                ...registrationData,
                otp: newOtp,
            };

            await redisClient.set(
                `temp_registration:${email}`,
                JSON.stringify(updatedData),
                { EX: 3600 }
            );

            await sendOtpEmail(email, newOtp);

            return newOtp;
        } catch (error) {
            console.error(ErrorMessages.OTP_GENERATE_FAILED, error);
            return null;
        }
    }

    async generateOtp(email: string): Promise<string | null> {
        try {
            const otp = generateOTP();
            await this.otpRepository.storeOtp(email, otp);
            return otp;
        } catch (error) {
            console.error(ErrorMessages.OTP_GENERATE_FAILED, error);
            return null;
        }
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        try {
            const redisData = await redisClient.get(`temp_registration:${email}`);
            if (!redisData) {
                console.log(ErrorMessages.EMAIL_NOT_FOUND_TEMP_REGISTRATION);
                return false;
            }

            const registrationData = JSON.parse(redisData);

            if (otp !== registrationData.otp) {
                console.log(ErrorMessages.WRONG_OTP);
                return false;
            }

            const user: IUserCreationData = {
                email: registrationData.email,
                name: registrationData.name,
                password: registrationData.password,
                googleId: null,
            };

            const newUser = await this.authRepository.createUser(user);
            if (!newUser) {
                return false;
            }

            const addressData = {
                entity: newUser._id as Types.ObjectId,
                type: 'user',
                fname: newUser.name.split(' ')[0],
                lname: newUser.name.split(' ')[1],
            }
            const addressResult = await this.addressRepository.addAddress(addressData);
            console.log('addressResult: ', addressResult)

            await redisClient.del(`temp_registration:${email}`);

            return true;
        } catch (error) {
            console.error(ErrorMessages.OTP_VERIFICATION_FAILED, error);
            return false;
        }
    }

    async verifyLogin(email: string, password: string): Promise<any> {
        try {
            const user = await this.authRepository.findUser(email);
            if (user && await bcrypt.compare(password, user.password)) {
                return user;
            }
            return null;
        } catch (error) {
            console.error(ErrorMessages.LOGIN_FAILED, error);
            throw new Error(ErrorMessages.LOGIN_FAILED);
        }
    }

    async generateAccessToken(userId: string, role: string): Promise<string> {
        try {
            return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: process.env.ACCESS_EXPIRES_IN! });
        } catch (error) {
            console.error(ErrorMessages.ACCESS_TOKEN_FAILED, error);
            throw new Error(ErrorMessages.ACCESS_TOKEN_FAILED);
        }
    }

    async generateRefreshToken(userId: string, role: string): Promise<string> {
        try {
            return jwt.sign({ userId, role }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: process.env.REFRESH_EXPIRES_IN });
        } catch (error) {
            console.error(ErrorMessages.REFRESH_TOKEN_FAILED, error);
            throw new Error(ErrorMessages.REFRESH_TOKEN_FAILED);
        }
    }

    async verifyRefreshToken(refreshToken: string): Promise<any> {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
            return decoded as any;
        } catch (error) {
            console.error(ErrorMessages.REFRESH_TOKEN_FAILED, error);
            return null;
        }
    }

    async findIsBlocked(userId: string): Promise<boolean | null> {
        try {
            return await this.authRepository.findIsBlocked(userId);
        } catch (error) {
            console.error(ErrorMessages.AUTHENTICATE_USER_FAILED, error);
            return null;
        }
    }

    async findOrCreateUser(profile: any): Promise<IUserDocument | null> {
        try {
            const email = profile.email;
            const existingUser = await this.authRepository.findUser(email);

            if (existingUser) {
                if (existingUser?.isBlocked) return null;
                return existingUser;
            }

            const newUser = {
                email,
                name: profile.name,
                googleId: profile.uid,
                password: null,
                profilePicture: profile.picture,
                role: 'user',
            };

            return await this.authRepository.createUser(newUser);
        } catch (error) {
            console.error(ErrorMessages.GOOGLE_LOGIN_FAILED, error);
            return null;
        }
    }

    async findUserById(userId: string): Promise<IUser | null> {
        try {
            return await this.authRepository.findUserById(userId);
        } catch (error) {
            console.error(ErrorMessages.USER_NOT_FOUND, error);
            return null;
        }
    }

    async sendResetLink(email: string) {
        try {
            const existingUser = await this.authRepository.findUser(email);
            if (!existingUser) {
                return false;
            }
            if (!process.env.RESET_LINK_SECRET) {
                throw new Error(ErrorMessages.RESET_LINK_SECRET_MISSING);
            }
            const payload = { userId: existingUser._id, email };
            const resetToken = jwt.sign(payload, process.env.RESET_LINK_SECRET, { expiresIn: process.env.RESET_EXPIRES_IN });
            const tokenExpiry = new Date(Date.now() + 3600 * 1000);
            await this.authRepository.storeResetToken(email, resetToken, tokenExpiry);

            const CLIENT_URL = process.env.CLIENT_URL;
            const resetLink = `${CLIENT_URL}/user/resetPassword?token=${resetToken}`;
            await sendResetEmail(email, "Password Reset", `Click here to reset your password: ${resetLink}`);

            console.log(ErrorMessages.RESET_LINK_SENT, resetLink);
            return true;
        } catch (error) {
            console.error(ErrorMessages.FORGOT_PASSWORD_FAILED, error);
            return null;
        }
    }

    async resetPassword(email: string, password: string) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.authRepository.resetPassword(email, hashedPassword);
        } catch (error) {
            console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
            throw new Error(ErrorMessages.PASSWORD_UPDATE_FAILED);
        }
    }
}
