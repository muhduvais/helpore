import express from 'express';
const router = express.Router();
import authController from '../controllers/authController';

router.post('/users/register', authController.registerUser);
router.post('/users/verifyOtp', authController.verifyOtp);
router.post('/users/resendOtp', authController.resendOtp);
router.post('/users/login', authController.loginUser);
router.post('/users/refreshToken', authController.refreshToken);
router.post('/users/forgotPassword', authController.forgotPassword);
router.post('/users/resetPassword', authController.resetPassword);

router.post('/google-login', authController.googleLogin);

export default router;
