import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAuthService } from '../../services/interfaces/ServiceInterface';
import { IAuthController } from '../interfaces/IAuthController';
import { firebaseAdmin } from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

@injectable()
export class AuthController implements IAuthController {
    constructor(
        @inject('IAuthService') private readonly authService: IAuthService,
    ) {
        this.registerUser = this.registerUser.bind(this);
        this.resendOtp = this.resendOtp.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.authenticateUser = this.authenticateUser.bind(this);
    }

    async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;
            const registeredMail = await this.authService.registerUser(name, email, password);

            if (registeredMail) {
                res.status(201).json({ success: true, registeredMail });
            } else {
                res.status(400).json({ success: false, message: 'Email is already registered!' });
            }
        } catch (error) {
            console.error('Error registering the user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            const otp = await this.authService.resendOtp(email);

            if (otp) {
                console.log('New OTP:', otp);
                res.status(200).json({ success: true, message: 'OTP generated successfully!' });
            } else {
                res.status(404).json({ success: false, message: 'Email not found in temporary registration!' });
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
            const { email, password } = req.body.data;
            const selectedRole = req.body.selectedRole;

            const user = await this.authService.verifyLogin(email, password);

            if (!user || user.role !== selectedRole) {
                res.status(400).json({ message: 'Invalid email or password!' });
                return;
            }

            const accessToken = await this.authService.generateAccessToken(user._id, user.role);
            const refreshToken = await this.authService.generateRefreshToken(user._id, user.role);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3 * 60 * 60 * 1000
            });

            res.status(200).json({
                message: 'Login successful!',
                accessToken,
                user: {
                    id: user._id,
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
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                console.log(' Refresh token is missing!');
                res.status(403).json({ message: 'Refresh token is missing!' });
                return
            }

            const payload = await this.authService.verifyRefreshToken(refreshToken);
            const userId = payload.userId;
            const role = payload.role;
            if (!userId) {
                res.status(403).json({ message: 'Invalid refresh token!' });
                return
            }

            const newAccessToken = await this.authService.generateAccessToken(userId, role);

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

            const userId = user._id as string;
            const role = user.role as string;

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "You are not registered as a volunteer!"
                });
                return;
            }

            if (user.isBlocked) {
                res.status(403).json({
                    success: false,
                    message: "Invalid email or password!"
                });
                return;
            }

            const accessToken = await this.authService.generateAccessToken(userId, role);
            const refreshToken = await this.authService.generateRefreshToken(userId, role);

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
            const decoded = jwt.verify(token, process.env.RESET_LINK_SECRET!) as JwtPayload;
            const { userId } = decoded;
            const user = await this.authService.findUserById(userId);
            if (!user) {
                res.status(400).json({ message: 'User not found!' });
                return;
            }
            const email = user.email;

            await this.authService.resetPassword(email, newPassword);
            res.status(200).json({ message: 'Password reset successful' });
        } catch (error) {
            console.log('error: ', error)
            res.status(400).json({ message: 'Invalid or expired token' });
        }
    }

    async authenticateUser(req: Request, res: Response): Promise<void> {
        const userId = req.params.id;
        try {
            const isBlocked = await this.authService.findIsBlocked(userId);
            res.status(200).json({ isBlocked, message: 'Authenticated user successfully!' });
        } catch (error) {
            console.log('Error authenticating the user!');
            res.status(500).json({ isBlocked: false, message: 'Error authenticating the user!' });
        }
    }
}