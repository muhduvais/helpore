import { Request, Response } from 'express';
import AuthService from '../services/authService';
import { TokenPayload } from '../interfaces/authInterface';
import jwt from 'jsonwebtoken';
import { firebaseAdmin } from '../config/firebase.config';
import dotenv from 'dotenv';
dotenv.config();

class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
        this.registerUser = this.registerUser.bind(this);
        this.resendOtp = this.resendOtp.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
    }

    async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;
            const registeredMail = await this.authService.registerUser(name, email, password);
            
            if (registeredMail) {
                res.status(201).json({ success: true, registeredMail });
            } else {
                res.status(400).json({ success: false, message: 'This email is already registered!' });
            }
        } catch (error) {
            console.error('Error registering the user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            const otp = await this.authService.generateOtp(email);
            if (otp) {
                console.log('New otp: ', otp);
                res.status(200).json({ success: true, message: 'Otp generated successfully!' });
            }
        } catch (error) {
            console.error('Error generating the OTP:', error);
            res.status(500).json({ message: 'Error generating the OTP', error });
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;
            const verified = await this.authService.verifyOtp(email, otp);
            if (!verified) {
                res.status(400).json({ message: 'Wrong OTP!' });
                return;
            }
            res.status(200).json({ message: 'OTP verification successful!' });
        } catch (error) {
            console.error('Error verifying the OTP:', error);
            res.status(500).json({ message: 'Error verifying the OTP', error });
        }
    }

    async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, selectedRole } = req.body;

            const user = await this.authService.verifyLogin(email, password);
            
            if (!user || user.role !== selectedRole) {
                res.status(400).json({ message: 'Invalid email or password!'});
                return;
            }

            const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '20s' });
            const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '1h' });
            
            res.status(200).json({
                message: 'Login successful!',
                accessToken,
                refreshToken,
                user: {
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in', error });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(401).json({ message: 'Refresh token not found' });
                return;
            }

            const userId = await this.authService.verifyRefreshToken(refreshToken);
            if (!userId) {
                res.status(403).json({ message: 'Invalid refresh token' });
                return;
            }

            const newAccessToken = await this.authService.generateAccessToken(userId);
            res.status(200).json({ accessToken: newAccessToken });
        } catch (error) {
            console.error('Error refreshing token:', error);
            res.status(500).json({ message: 'Error refreshing token', error });
        }
    }

    async googleLogin(req: Request, res: Response): Promise<void> {
        const { idToken } = req.body;

        try {
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
            const user = await this.authService.findOrCreateUser(decodedToken);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "You are not registered as a volunteer!"
                });
                return;
            }

            const accessToken = jwt.sign({ userId: user.uid }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '20s' });
            const refreshToken = jwt.sign({ userId: user.uid }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '1h' });

            res.status(200).json({
                success: true,
                accessToken,
                refreshToken,
                user: {
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error: any) {
            if (error.code === 'auth/invalid-id-token') {
                res.status(400).json({ message: 'Invalid Google ID Token' });
                console.error('Invalid Google ID Token', error);
            } else {
                res.status(500).json({ message: 'Something went wrong during login', error: error.message });
                console.error('Something went wrong during login', error);
            }
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            const sendResetLink = await this.authService.sendResetLink(email);
            if (!sendResetLink) {
                res.status(400).json({ message: 'The email is not registered!' });
            } else {
                res.status(200).json({ message: 'Reset link has been sent to your email!' });
            }
        } catch (error: any) {
            res.status(500).json({ message: 'Something went wrong!', error: error.message });
            console.error('Something went wrong during sending the reset link', error);
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        const { token, newPassword } = req.body;
        try {
            const decoded = jwt.verify(token, process.env.RESET_LINK_SECRET!) as TokenPayload;
            const { email } = decoded;
            await this.authService.resetPassword(email, newPassword);
            res.status(200).json({ message: 'Password reset successful' });
        } catch (error) {
            res.status(400).json({ message: 'Invalid or expired token' });
        }
    }
}

export default new AuthController();
