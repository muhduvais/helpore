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

@injectable()
export class AuthService implements IAuthService {

    constructor(
        @inject('IAuthRepository') private readonly authRepository: IAuthRepository,
        @inject('IOtpRepository') private readonly otpRepository: IOtpRepository
    ) {}

    async registerUser(name: string, email: string, password: string): Promise<string | boolean> {
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
            console.error('Error registering the user', error);
            return null;
        }
    }

    async resendOtp(email: string): Promise<string | null> {
        try {
            const redisData = await redisClient.get(`temp_registration:${email}`);
            if (!redisData) {
                console.log('Registration data not found in Redis');
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
            console.error('Error generating and resending OTP:', error);
            return null;
        }
    }

    async generateOtp(email: string): Promise<string | null> {
        try {
            const otp = generateOTP();
            await this.otpRepository.storeOtp(email, otp);
            return otp;
        } catch (error) {
            console.error('Error generating OTP:', error);
            return null;
        }
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        try {
            const redisData = await redisClient.get(`temp_registration:${email}`);
            if (!redisData) {
                console.log('Registration data not found or expired in Redis');
                return false;
            }

            const registrationData = JSON.parse(redisData);

            if (otp !== registrationData.otp) {
                console.log('Invalid OTP');
                return false;
            }

            const user: Partial<IUser> = {
                email: registrationData.email,
                name: registrationData.name,
                password: registrationData.password,
                googleId: null,
            };

            await this.authRepository.createUser(user);

            await redisClient.del(`temp_registration:${email}`);

            return true;
        } catch (error) {
            console.error('Error verifying OTP:', error);
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
            console.error('Error verifying login:', error);
            throw new Error('Login failed');
        }
    }

    async generateAccessToken(userId: string, role: string): Promise<string> {
        try {
            return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '5m' });
        } catch (error) {
            console.error('Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }

    async generateRefreshToken(userId: string, role: string): Promise<string> {
        try {
            return jwt.sign({ userId, role }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '3h' });
        } catch (error) {
            console.error('Error generating refresh token:', error);
            throw new Error('Failed to generate refresh token');
        }
    }

    async verifyRefreshToken(refreshToken: string): Promise<any> {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
            return decoded as any;
        } catch (error) {
            console.error('Error verifying refresh token:', error);
            return null;
        }
    }

    async findIsBlocked(userId: string): Promise<boolean> {
        try {
            return await this.authRepository.findIsBlocked(userId);
        } catch (error) {
            console.error('Error authenticating user:', error);
            return null;
        }
    }

    async findOrCreateUser(profile: any): Promise<IUserDocument | null> {
        try {
            const email = profile.email;
            const existingUser = await this.authRepository.findUser(email);

            if (existingUser) {
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
            console.error('Error finding/creating the user:', error);
            return null;
        }
    }

    async findUserById(userId: string): Promise<IUser | null> {
        try {
            return await this.authRepository.findUserById(userId);
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async sendResetLink(email: string) {
        try {
            const existingUser = await this.authRepository.findUser(email);
            if (!existingUser) {
                return false;
            }
            const payload = { userId: existingUser._id, email };
            const resetToken = jwt.sign(payload, process.env.RESET_LINK_SECRET, { expiresIn: '3h' });
            const tokenExpiry = new Date(Date.now() + 3600 * 1000);
            await this.authRepository.storeResetToken(email, resetToken, tokenExpiry);

            const CLIENT_URL = process.env.CLIENT_URL;
            const resetLink = `${CLIENT_URL}/user/resetPassword?token=${resetToken}`;
            await sendResetEmail(email, "Password Reset", `Click here to reset your password: ${resetLink}`);

            console.log("Reset link sent:", resetLink);
            return true;
        } catch (error) {
            console.error('Error sending reset link to the mail:', error);
            return null;
        }
    }

    async resetPassword(email, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.authRepository.resetPassword(email, hashedPassword);
        } catch (error) {
            console.error('Error reseting the password:', error);
            throw new Error('Error reseting the password');
        }
    }
}
