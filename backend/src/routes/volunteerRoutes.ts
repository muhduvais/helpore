import express from "express";
import volunteerController from "../controllers/volunteerController";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
const volunteerRoutes = express.Router();

volunteerRoutes.use(authenticateToken);
volunteerRoutes.use(authorizeRole('volunteer'));

//Profile
volunteerRoutes.get('/me', volunteerController.getVolunteerDetails);
volunteerRoutes.put('/me', volunteerController.updateVolunteerDetails);
volunteerRoutes.patch('/me', volunteerController.updateProfilePicture);
volunteerRoutes.patch('/password', volunteerController.changePassword);

// Addresses
volunteerRoutes.get('/addresses', volunteerController.getAddresses);
volunteerRoutes.post('/addresses', volunteerController.createAddress);

//Assistance requests
volunteerRoutes.get('/assistanceRequests', volunteerController.getNearbyRequests);
volunteerRoutes.patch('/assistanceRequests/:id', volunteerController.updateRequestStatus);

export default volunteerRoutes;