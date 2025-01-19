import express from "express";
import adminController from "../controllers/adminController";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
const adminRoutes = express.Router();

adminRoutes.use(authenticateToken);
adminRoutes.use(authorizeRole('admin'));

// Users
adminRoutes.get('/users', adminController.getUsers);
adminRoutes.post('/users', adminController.addUser);
adminRoutes.patch('/users/:id/:action', adminController.toggleIsBlocked);
adminRoutes.get('/users/:id', adminController.getUserDetails);

//Volunteers
adminRoutes.get('/volunteers', adminController.getVolunteers);
adminRoutes.post('/volunteers', adminController.addVolunteer);
adminRoutes.patch('/volunteers/:id/:action', adminController.toggleIsBlocked);

export default adminRoutes;