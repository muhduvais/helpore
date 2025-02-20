import express from "express";
import userController from "../controllers/userController";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
const userRoutes = express.Router();

userRoutes.use(authenticateToken);
userRoutes.use(authorizeRole('user'));

//Profile
userRoutes.get('/me', userController.getUserDetails);
userRoutes.put('/me', userController.updateUserDetails);
userRoutes.patch('/me', userController.updateProfilePicture);
userRoutes.patch('/password', userController.changePassword);

// Addresses
userRoutes.get('/addresses', userController.getAddresses);
userRoutes.post('/addresses', userController.createAddress);

//Assets
userRoutes.get('/assets', userController.getAssets);
userRoutes.get('/assets/:id', userController.getAssetDetails);

//Asset requests
userRoutes.get('/assetRequests', userController.getAssetRequests);
userRoutes.get('/assetRequests/:id', userController.getAssetRequestDetails);
userRoutes.post('/assetRequests/:id', userController.requestAsset);

//Assistance requests
userRoutes.get('/assistanceRequests', userController.getAssistanceRequests);
userRoutes.get('/assistanceRequests/:id', userController.getAssistanceRequestDetails);
userRoutes.post('/assistanceRequests', userController.requestAssistance);

export default userRoutes;