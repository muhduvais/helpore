import 'reflect-metadata';
import express from 'express';
import { container } from 'tsyringe';
import { IAuthController } from '../controllers/interfaces/IAuthController';
import { registerDependencies } from '../container';

registerDependencies();

const router = express.Router();

const authController = container.resolve<IAuthController>('IAuthController');

router.get('/authenticateUser/:id', (req,res,next) => authController.authenticateUser(req,res));

router.post('/admin/login', (req,res,next) =>  authController.loginUser(req,res));
router.post('/login', (req, res, next) => authController.loginUser(req, res));
router.post('/logout', (req, res, next) => authController.logoutUser(req, res));
router.post('/register', (req, res, next) => authController.registerUser(req, res));
router.post('/verifyOtp', (req, res, next) => authController.verifyOtp(req, res));
router.post('/resendOtp', (req, res, next) => authController.resendOtp(req, res));
router.post('/refreshToken', (req, res, next) => authController.refreshToken(req, res));
router.post('/forgotPassword', (req, res, next) => authController.forgotPassword(req, res));
router.post('/resetPassword', (req, res, next) => authController.resetPassword(req, res));
router.post('/google-login', (req, res, next) => authController.googleLogin(req, res));

export default router;
