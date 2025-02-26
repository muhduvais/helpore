import express from 'express';
import { container } from 'tsyringe';
import { IAssetRequestController } from '../controllers/interfaces/IAssetRequestController';

const router = express.Router();

const assetRequestController = container.resolve<IAssetRequestController>('AssetRequestController');

router.get('/', assetRequestController.getAssetRequests);
router.get('/:id', assetRequestController.getAssetRequestDetails);
router.post('/:id', assetRequestController.requestAsset);
router.patch('/:id', assetRequestController.updateAssetRequestStatus);


export default router;
