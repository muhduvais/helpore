import express from 'express';
import { container } from 'tsyringe';
import { IAddressController } from '../controllers/interfaces/IAddressController';

const router = express.Router();

const addressController = container.resolve<IAddressController>('addressController');

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);


export default router;
