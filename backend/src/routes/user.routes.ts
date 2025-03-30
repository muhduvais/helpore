import express from 'express';
import { container } from 'tsyringe';
import { IUserController } from '../controllers/interfaces/IUserController';
import { uploadMiddleware } from '../middlewares';

const router = express.Router();

const userController = container.resolve<IUserController>('IUserController');

router.post('/certificate', uploadMiddleware('file'), userController.uploadCertificateImage);

router.get('/', userController.getUsers);
router.get('/me', userController.getUserDetails);
router.put('/', userController.updateUserDetails);
router.post('/', userController.addUser);
router.patch('/profilePicture', userController.updateProfilePicture);
router.patch('/password', userController.changePassword);
router.get('/:id', userController.getUserDetails);
router.patch('/:id/:blockAction', userController.toggleIsBlocked);
router.delete('/certificate', userController.deleteCertificate);


export default router;
