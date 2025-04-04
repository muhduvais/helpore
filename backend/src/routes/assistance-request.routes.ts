import express from 'express';
import { container } from 'tsyringe';
import { IAssistanceRequestController } from '../controllers/interfaces/IAssistanceRequestController';

const router = express.Router();

const assistanceRequestController = container.resolve<IAssistanceRequestController>('IAssistanceRequestController');

router.get('/pending', assistanceRequestController.getPendingRequests);
router.get('/', assistanceRequestController.getAssistanceRequests);
router.get('/me', assistanceRequestController.getMyAssistanceRequests);
router.get('/nearBy', assistanceRequestController.getNearbyRequests);
router.get('/processing', assistanceRequestController.getProcessingRequests);
router.get('/:id', assistanceRequestController.getAssistanceRequestDetails);
router.post('/', assistanceRequestController.requestAssistance);
router.patch('/:id/assignVolunteer', assistanceRequestController.assignVolunteer);
router.patch('/:id/status', assistanceRequestController.updateRequestStatus);


export default router;
