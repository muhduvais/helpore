import "reflect-metadata";
import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import volunteerRoutes from './volunteer.routes';
import addressRoutes from './addresss.routes';
import assetRoutes from './asset.routes';
import assetRequestRoutes from './asset-request.routes';
import assistanceRequestRoutes from './assistance-request.routes';
import donationRoutes from './donation.routes';
import chatRoutes from './chat.routes';
import notificationRoutes from './notification.routes';
import { authenticateToken } from "../middlewares";

const router = express.Router();

router.use(express.json());

router.use('/auth', authRoutes);

router.use(authenticateToken);

router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/addresses', addressRoutes);
router.use('/assets', assetRoutes);
router.use('/assetRequests', assetRequestRoutes);
router.use('/assistanceRequests', assistanceRequestRoutes);
router.use('/donations', donationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chats', chatRoutes);

export default router;