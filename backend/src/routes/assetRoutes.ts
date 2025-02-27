import express from 'express';
import multer from 'multer';
import path from 'path';
import { container } from 'tsyringe';
import { IAssetController } from '../controllers/interfaces/IAssetController';

const router = express.Router();

const assetController = container.resolve<IAssetController>('IAssetController');

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

router.post('/uploadImage', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, assetController.uploadAssetImage);

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetDetails);
router.post('/', assetController.addAsset);
router.put('/:id', assetController.updateAsset);


export default router;
