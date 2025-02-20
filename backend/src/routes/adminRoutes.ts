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
        return cb(new Error('Invalid file type. Only JPEG, JPG, and PNG allowed!'));
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

// Asset image uploading
adminRoutes.post('/assetImage', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, adminController.uploadAssetImage);

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
adminRoutes.patch('/volunteers/:id/:action', adminController.volunteerToggleIsBlocked);
adminRoutes.get('/volunteers/:id', adminController.getVolunteerDetails);

// Assets
adminRoutes.get('/assets', adminController.getAssets);
adminRoutes.get('/assets/:id', adminController.getAssetDetails);
adminRoutes.post('/assets', adminController.addAsset);
adminRoutes.put('/assets/:id', adminController.updateAsset);

// Asset requests
adminRoutes.get('/assetRequests', adminController.fetchAssetRequests);
adminRoutes.patch('/assetRequests/:id', adminController.updateAssetRequestStatus);

//Assistance requests
adminRoutes.get('/assistanceRequests', adminController.getAssistanceRequests);
adminRoutes.get('/assistanceRequests/:id', adminController.getAssistanceRequestDetails);
adminRoutes.patch('/assistanceRequests/:id', adminController.assignVolunteer);

export default adminRoutes;