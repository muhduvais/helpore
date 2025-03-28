import express from 'express';
import { container } from 'tsyringe';
import { IMeetingController } from '../controllers/interfaces/IMeetingController';

const router = express.Router();

const meetingController = container.resolve<IMeetingController>('IMeetingController');

router.post('/generateToken', meetingController.generateZegoToken);

export default router;
