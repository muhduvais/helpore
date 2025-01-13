import express from 'express';
const router = express.Router();
import authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

router.post('/admin/login', authController.loginUser);

router.post('/register', authController.registerUser);
router.post('/verifyOtp', authController.verifyOtp);
router.post('/resendOtp', authController.resendOtp);
router.post('/login', authController.loginUser);
router.post('/refreshToken', authController.refreshToken);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);

router.post('/google-login', authController.googleLogin);

export default router;
