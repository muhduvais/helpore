import express from 'express';
import { container } from 'tsyringe';
import { IAuthController } from '../controllers/interfaces/IAuthController';

const router = express.Router();

const authController = container.resolve<IAuthController>('AuthController');

router.get('/authenticateUser/:id', authController.authenticateUser.bind(authController));

router.post('/admin/login', authController.loginUser.bind(authController));
router.post('/login', authController.loginUser.bind(authController));
router.post('/register', authController.registerUser.bind(authController));
router.post('/verifyOtp', authController.verifyOtp.bind(authController));
router.post('/resendOtp', authController.resendOtp.bind(authController));
router.post('/refreshToken', authController.refreshToken.bind(authController));
router.post('/forgotPassword', authController.forgotPassword.bind(authController));
router.post('/resetPassword', authController.resetPassword.bind(authController));
router.post('/google-login', authController.googleLogin.bind(authController));

export default router;
