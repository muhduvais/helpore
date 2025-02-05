import express from "express";
import userController from "../controllers/userController";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
const userRoutes = express.Router();

userRoutes.use(authenticateToken);
userRoutes.use(authorizeRole('user'));

userRoutes.get('/me', userController.getUserDetails);
userRoutes.patch('/password', userController.changePassword);

userRoutes.get('/assets', userController.getAssets);
userRoutes.get('/assets/:id', userController.getAssetDetails);

userRoutes.get('/assetRequests', userController.getAssetRequests);
userRoutes.get('/assetRequests/:id', userController.getAssetRequestDetails);
userRoutes.post('/assetRequests/:id', userController.requestAsset);

export default userRoutes;