import AuthRepository from '../repositories/authRepository';
import OtpRepository from '../repositories/otpRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/otp';
import { sendOtpEmail } from './otpService';
import { sendResetEmail } from '../utils/email';
import { IUser } from '../interfaces/userInterface';

class AuthService {
    private authRepository: AuthRepository;
    private otpRepository: OtpRepository;

    constructor() {
        this.authRepository = new AuthRepository();
        this.otpRepository = new OtpRepository();
    }

    async registerUser(name: string, email: string, password: string): Promise<string | boolean> {
        try {
            const existingUser = await this.authRepository.findUser(email);
            if (existingUser) {
                return false;
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser: Partial<IUser> = {
                email,
                name,
                googleId: null,
                password: hashedPassword,
              };

            const user = await this.authRepository.createUser(newUser);
            const registeredMail = user.email;

            const otp = generateOTP();
            await this.otpRepository.storeOtp(email, otp);
            await sendOtpEmail(registeredMail, otp);
            console.log('OTP:', otp);

            return registeredMail;
        } catch (error) {
            console.error('Error registering the user', error);
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
            return await this.otpRepository.verifyOtp(email, otp);
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

    async verifyRefreshToken(refreshToken: string): Promise<string | null> {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
            return (decoded as any).userId;
        } catch (error) {
            console.error('Error verifying refresh token:', error);
            return null;
        }
    }

    async generateAccessToken(userId: string): Promise<string> {
        try {
            return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '20s' });
        } catch (error) {
            console.error('Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }

    async findOrCreateUser(profile: any): Promise<IUser | null> {
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

    async sendResetLink (email: string) {
        try {
            const existingUser = await this.authRepository.findUser(email);
            if (!existingUser) {
                return false;
            }

            const payload = { email };
            const resetToken = jwt.sign(payload, process.env.RESET_LINK_SECRET, { expiresIn: '1h' });
            const tokenExpiry = new Date(Date.now() + 3600 * 1000);
            await this.authRepository.storeResetToken(email, resetToken, tokenExpiry);

            const resetLink = `http://localhost:5173/users/resetPassword?token=${resetToken}`;
            await sendResetEmail(email, "Password Reset", `Click here to reset your password: ${resetLink}`);

            console.log("Reset link sent:", resetLink);
            return true;
        } catch (error) {
            console.error('Error sending reset link to the mail:', error);
            return null;
        }
    }

    async resetPassword (email, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.authRepository.resetPassword(email, hashedPassword);
        } catch (error) {
            console.error('Error reseting the password:', error);
            throw new Error('Error reseting the password');
        }
    }
}

export default AuthService;
