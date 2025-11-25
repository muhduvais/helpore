import express from 'express';
import { container } from 'tsyringe';
import { IAssetController } from '../controllers/interfaces/IAssetController';
import { handleInvalidFile, uploadMiddleware } from '../middlewares';

const router = express.Router();

const assetController = container.resolve<IAssetController>('IAssetController');

router.post('/image', uploadMiddleware('file'), handleInvalidFile, assetController.uploadAssetImage);

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetDetails);
router.post('/', assetController.addAsset);
router.put('/:id', assetController.updateAsset);


export default router;
