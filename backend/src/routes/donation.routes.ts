import express from 'express';
import { container } from 'tsyringe';
import { IDonationController } from '../controllers/interfaces/IDonationController';

const router = express.Router();

const donationController = container.resolve<IDonationController>('IDonationController');

router.get('/', donationController.getDonations);
router.post('/create-checkout-session', donationController.createCheckoutSession);
router.get('/history', donationController.fetchDontaionHistory);
router.get('/receipt/:donationId', donationController.generateReceipt);
router.get('/export', donationController.exportDonations);


export default router;
