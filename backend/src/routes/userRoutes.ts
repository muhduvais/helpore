import express from 'express';
import { container } from 'tsyringe';
import { IUserController } from '../controllers/interfaces/IUserController';
import { authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

const userController = container.resolve<IUserController>('IUserController');

router.use(authorizeRole('admin'));

router.get('/', userController.getUsers);
router.post('/', userController.addUser);
router.patch('/:id/:action', userController.toggleIsBlocked);
router.get('/:id', userController.getUserDetails);


export default router;
