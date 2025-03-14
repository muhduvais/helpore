import express from 'express';
import multer from 'multer';
import path from 'path';
import { container } from 'tsyringe';
import { IUserController } from '../controllers/interfaces/IUserController';

const router = express.Router();

const userController = container.resolve<IUserController>('IUserController');

const storage = multer.diskStorage({
    destination: 'uploads/user_certificates',
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

router.post('/certificate', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message === 'File too large' ? 'File size should be less than 5MB' : err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, userController.uploadCertificateImage);

router.get('/', userController.getUsers);
router.get('/me', userController.getUserDetails);
router.put('/', userController.updateUserDetails);
router.post('/', userController.addUser);
router.patch('/profilePicture', userController.updateProfilePicture);
router.patch('/password', userController.changePassword);
router.get('/:id', userController.getUserDetails);
router.patch('/:id/:blockAction', userController.toggleIsBlocked);
router.patch('/profilePicture', userController.updateProfilePicture);
router.delete('/certificate', userController.deleteCertificate);


export default router;
