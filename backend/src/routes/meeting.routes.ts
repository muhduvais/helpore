import express from 'express';
import { container } from 'tsyringe';
import { IMeetingController } from '../controllers/interfaces/IMeetingController';

const router = express.Router();

const meetingController = container.resolve<IMeetingController>('IMeetingController');

router.post('/', meetingController.createMeeting);
router.get('/user', meetingController.getUserMeetings);
router.get('/', meetingController.getMeetings);
router.get('/:meetingId', meetingController.getMeetingById);
router.patch('/:meetingId/status', meetingController.updateMeetingStatus);
router.post('/generateToken', meetingController.generateZegoToken);

export default router;