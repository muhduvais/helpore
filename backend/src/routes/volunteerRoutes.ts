import express from 'express';
import { container } from 'tsyringe';
import { IVolunteerController } from '../controllers/interfaces/IVolunteerController';
import { authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

const volunteerController = container.resolve<IVolunteerController>('IVolunteerController');

router.use(authorizeRole('admin'));

router.get('/', volunteerController.getVolunteers);
router.post('/', volunteerController.addVolunteer);
router.patch('/:id/:action', volunteerController.toggleIsBlocked);
router.get('/:id', volunteerController.getVolunteerDetails);


export default router;
