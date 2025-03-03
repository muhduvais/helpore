import express from 'express';
import { container } from 'tsyringe';
import { IUserController } from '../controllers/interfaces/IUserController';

const router = express.Router();

const userController = container.resolve<IUserController>('IUserController');

router.get('/', userController.getUsers);
router.get('/me', userController.getUserDetails);
router.put('/', userController.updateUserDetails);
router.post('/', userController.addUser);
router.patch('/profilePicture', userController.updateProfilePicture);
router.patch('/password', userController.changePassword);
router.get('/:id', userController.getUserDetails);
router.patch('/:id/:blockAction', userController.toggleIsBlocked);


export default router;
