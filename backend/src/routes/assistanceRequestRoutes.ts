import express from 'express';
import { container } from 'tsyringe';
import { IAssistanceRequestController } from '../controllers/interfaces/IAssistanceRequestController';

const router = express.Router();

const assistanceRequestController = container.resolve<IAssistanceRequestController>('IAssistanceRequestController');

router.get('/', assistanceRequestController.getAssistanceRequests);
router.get('/:id', assistanceRequestController.getAssistanceRequestDetails);
router.post('/', assistanceRequestController.requestAssistance);
router.patch('/:id', assistanceRequestController.assignVolunteer);
router.get('/', assistanceRequestController.getNearbyRequests);
router.patch('/:id', assistanceRequestController.updateRequestStatus);


export default router;
