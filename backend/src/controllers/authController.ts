import AuthService from '../services/authService';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { firebaseAdmin } from '../config/firebase.config';
import dotenv from 'dotenv';
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    }

    async registerUser(req, res) {
        try {
            const { name, email, password } = req.body;
            const registeredMail = await this.authService.registerUser(name, email, password);
            console.log('registered mail: ', registeredMail);
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

    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            const otp = await this.authService.generateOtp(email);
            if (otp) {
                console.log('New otp: ', otp);
                res.status(200).json({ success: true, message: 'Otp generated successfully!' });
            }
        } catch (error) {
            console.log('Error generating the OTP:', error);
            res.status(500).json({ message: 'Error generating the OTP', error });
        }
    }

    async verifyOtp(req, res) {
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

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.verifyLogin(email, password);
            if (!user) {
                res.status(400).json({ message: 'Invalid email or password!' });
                return;
            }
            const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
            const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                message: 'Login successful!',
                responseData: {
                    email: user.email,
                    accessToken,
                    refreshToken,
                    isAdmin: user.isAdmin,
                },
            });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in', error });
        }
    }

    async refreshToken(req, res) {
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

    async googleLogin(req, res) {
        const { idToken } = req.body;

        try {
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
            const user = await this.authService.findOrCreateUser(decodedToken);

            const accessToken = jwt.sign({ userId: user.uid }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
            const refreshToken = jwt.sign({ userId: user.uid }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });

            res.status(200).json({ 
                success: true,
                accessToken,
                refreshToken,
                user: {
                    email: user.email,
                    isAdmin: false,
                }
            });
        } catch (error) {
            if (error.code === 'auth/invalid-id-token') {
                res.status(400).json({ message: 'Invalid Google ID Token' });
                console.log('Invalid Google ID Token', error);
            } else {
                res.status(500).json({ message: 'Something went wrong during login', error: error.message });
                console.log('Something went wrong during login', error);
            }
        }
    }
}

export default new AuthController();
