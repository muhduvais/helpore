import express from "express";
import adminController from "../controllers/adminController";
import { authenticateToken } from "../middlewares/authMiddleware";
const router = express.Router();

router.get('/users', authenticateToken, adminController.getUsers);
router.post('/users', adminController.addUser);

export default router;