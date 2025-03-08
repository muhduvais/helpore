import express from 'express';
import { container } from 'tsyringe';
import { IDonationController } from '../controllers/interfaces/IDonationController';

const router = express.Router();

const donationController = container.resolve<IDonationController>('IDonationController');

router.post('/create-checkout-session', donationController.createCheckoutSession);
router.get('/history', donationController.fetchDontaionHistory);
router.get('/receipt/:donationId', donationController.fetchDontaionHistory);


export default router;
