import express from "express";
import adminController from "../controllers/adminController";
import { authenticateToken } from "../middlewares/authMiddleware";
const router = express.Router();

// Users
router.get('/users', authenticateToken, adminController.getUsers);
router.post('/users', authenticateToken, adminController.addUser);
router.patch('/users/:id', authenticateToken, adminController.toggleIsBlocked);

//Volunteers
router.get('/volunteers', adminController.getVolunteers);
router.post('/volunteers', adminController.addVolunteer);
router.patch('/volunteers/:id', adminController.toggleIsBlocked);

export default router;