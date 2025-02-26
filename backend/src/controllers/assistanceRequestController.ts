import { Request, Response } from 'express';
import { inject, injectable } from "tsyringe";
import { IAssistanceRequestController } from './interfaces/IAssistanceRequesController';
import { IAssistanceRequestService } from '../services/interfaces/ServiceInterface';

@injectable()
export class AssistanceRequestController implements IAssistanceRequestController {
    constructor(
        @inject("IAssistanceRequestService") private readonly assistanceRequestService: IAssistanceRequestService) { }

    async requestAssistance(req: Request, res: Response): Promise<void> {
        const userId = req.user.userId;
        const { formData } = req.body;

        formData.user = userId;
        formData.status = 'pending';
        formData.volunteer = null;

        try {
            const createAssistanceRequest = await this.assistanceRequestService.createAssistanceRequest(formData);
            if (createAssistanceRequest) {
                res.status(200).json({ success: true, message: 'Request created successfully!' });
            }
        } catch (error) {
            console.error('Error creating the request: ', error);
            res.status(500).json({ message: 'Error creating the request: ', error });
        }
    }

    async getNearbyRequests(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user.userId;
            const page = parseInt(req.query.page as string, 10) || 1;
            const search = req.query.search as string;
            const filter = req.query.filter as string;

            const { requests, total } = await this.assistanceRequestService.getNearbyRequests(
                volunteerId,
                page,
                search,
                filter
            );

            const totalPages = Math.ceil(total / 4);

            res.status(200).json({
                success: true,
                nearbyRequests: requests,
                totalPages,
                documentsCount: total
            });
        } catch (error) {
            console.error('Error fetching nearby requests:', error);
            res.status(500).json({ success: false, message: 'Error fetching nearby requests' });
        }
    }

    async updateRequestStatus(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user.userId;
            const requestId = req.params.id;
            const { action } = req.body;

            const updatedRequest = await this.assistanceRequestService.updateRequestStatus(
                requestId,
                volunteerId,
                action,
            );

            if (updatedRequest === 'Request approved') {
                res.status(200).json({
                    success: true,
                    message: "Request approved!",
                    data: updatedRequest
                });
                return;
            }

            if (updatedRequest === 'Request rejected') {
                res.status(200).json({
                    success: true,
                    message: "Request declined!",
                    data: updatedRequest
                });
                return;
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAssistanceRequests(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        const filter = req.query.filter as string;
        const priority = req.query.priority as string;
        const sort = req.query.sort as string;
        let skip = !search ? (page - 1) * limit : 0;

        try {
            const assistanceRequests = await this.assistanceRequestService.fetchAssistanceRequests(search, filter, skip, limit, sort, priority);
            const documentsCount = await this.assistanceRequestService.countAssistanceRequests(search, filter, priority);
            const totalPages = Math.ceil(documentsCount / limit);

            res.status(200).json({ success: true, assistanceRequests, totalPages, totalRequests: documentsCount });
        } catch (error) {
            console.error('Error fetching assistance requests:', error);
            res.status(500).json({ message: 'Error fetching assistance requests', error });
        }
    }

    async getAssistanceRequestDetails(req: Request, res: Response): Promise<void> {
        const requestId = req.params.id;
        try {
            const requestDetails = await this.assistanceRequestService.fetchAssistanceRequestDetails(requestId);
            if (requestDetails) {
                res.status(200).json({ success: true, requestDetails });
            } else {
                res.status(404).json({ success: false, message: 'Assistance request not found!' });
            }
        } catch (error) {
            console.error('Error fetching assistance request details:', error);
            res.status(500).json({ message: 'Error fetching assistance request details', error });
        }
    }

    async assignVolunteer(req: Request, res: Response): Promise<void> {
        const requestId = req.params.id;
        const { volunteerId } = req.body;

        try {
            const isTasksLimit = await this.assistanceRequestService.checkTasksLimit(volunteerId);
            if (isTasksLimit) {
                res.status(400).json({ success: false, message: 'Volunteer can process only 5 tasks at a time!' });
                return;
            }

            const assignSuccess = await this.assistanceRequestService.assignVolunteer(requestId, volunteerId);
            if (assignSuccess) {
                res.status(200).json({ success: true, message: 'Assigned volunteer successfully!' });
            } else {
                res.status(400).json({ success: false, message: 'Failed to assign volunteer!' });
            }
        } catch (error) {
            console.error('Error assigning volunteer:', error);
            res.status(500).json({ message: 'Error assigning volunteer', error });
        }
    }
}
