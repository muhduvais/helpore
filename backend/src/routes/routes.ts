import "reflect-metadata";
import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import volunteerRoutes from './volunteerRoutes';
import addressRoutes from './addresssRoutes';
import assetRoutes from './assetRoutes';
import assetRequestRoutes from './assetRequestRoutes';
import assistanceRequestRoutes from './assistanceRequestRoutes';
import donationRoutes from './donationRoutes';
import chatRoutes from './chatRoutes';
import notificationRoutes from './notificationRoutes';
import { authenticateToken } from '../middlewares/authMiddleware';

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