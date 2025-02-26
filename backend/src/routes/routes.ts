import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import volunteerRoutes from './volunteerRoutes';
import addressRoutes from './addresssRoutes';
import assetRoutes from './assetRoutes';
import assetRequestRoutes from './assetRequestRoutes';
import assistanceRequestRoutes from './assistanceRequestRoutes';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(express.json())

router.use('/auth', authRoutes);

router.use(authenticateToken);

router.use('/users', userRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/addresses', addressRoutes);
router.use('/assets', assetRoutes);
router.use('/assetRequests', assetRequestRoutes);
router.use('/assistanceRequests', assistanceRequestRoutes);

export default router;