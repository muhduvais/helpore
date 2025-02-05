import express from "express";
import adminController from "../controllers/adminController";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import multer from 'multer';
import path from 'path';

const adminRoutes = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        cb(new Error('Invalid file type. Only JPEG, JPG and PNG allowed!'));
        return;
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

adminRoutes.use(authenticateToken);
adminRoutes.use(authorizeRole('admin'));

// Assets
adminRoutes.get('/assets', adminController.getAssets);
adminRoutes.get('/assets/:id', adminController.getAssetDetails);
adminRoutes.post('/assets', adminController.addAsset);
adminRoutes.put('/assets/:id', adminController.updateAsset);
adminRoutes.post('/assetImage', upload.single('file'), adminController.uploadAssetImage);

// Users
adminRoutes.get('/users', adminController.getUsers);
adminRoutes.post('/users', adminController.addUser);
adminRoutes.patch('/users/:id/:action', adminController.toggleIsBlocked);
adminRoutes.get('/users/:id', adminController.getUserDetails);

//Volunteers
adminRoutes.get('/volunteers', adminController.getVolunteers);
adminRoutes.post('/volunteers', adminController.addVolunteer);
adminRoutes.patch('/volunteers/:id/:action', adminController.volunteerToggleIsBlocked);
adminRoutes.get('/volunteers/:id', adminController.getVolunteerDetails);

export default adminRoutes;