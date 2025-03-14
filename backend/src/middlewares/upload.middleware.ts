import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

declare module 'express' {
    interface Request {
        fileValidationError?: string;
    }
}

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedTypes.includes(file.mimetype)) {
        req.fileValidationError = 'Invalid file type. Only JPEG, JPG, and PNG allowed!';
        cb(null, false);
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const handleInvalidFile = (req: Request, res: Response, next: NextFunction) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }

    if (!req.file && req.method !== 'GET') {
        return res.status(400).json({ error: 'Please provide a valid image file' });
    }

    next();
};

// Error handler - single file
export const uploadMiddleware = (field: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        upload.single(field)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File size too large. Max 5MB allowed.' });
                }
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    };
};

// Error handler - multiple files
export const uploadMultipleMiddleware = (field: string, maxCount: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        upload.array(field, maxCount)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    };
};

export default upload;