import { Request, Response } from 'express';
import { inject, injectable } from "tsyringe";
import { IAssistanceRequestController } from '../interfaces/IAssistanceRequestController';
import { IAssistanceRequestService } from '../../services/interfaces/ServiceInterface';
import { JwtPayload } from 'jsonwebtoken';
import { HttpStatusCode } from '../../constants/httpStatus';
import { ErrorMessages } from '../../constants/errorMessages';

@injectable()
export class AssistanceRequestController implements IAssistanceRequestController {
    constructor(
        @inject("IAssistanceRequestService") private readonly assistanceRequestService: IAssistanceRequestService) {
        this.requestAssistance = this.requestAssistance.bind(this);
        this.getNearbyRequests = this.getNearbyRequests.bind(this);
        this.updateRequestStatus = this.updateRequestStatus.bind(this);
        this.getAssistanceRequests = this.getAssistanceRequests.bind(this);
        this.getProcessingRequests = this.getProcessingRequests.bind(this);
        this.getAssistanceRequestDetails = this.getAssistanceRequestDetails.bind(this);
        this.assignVolunteer = this.assignVolunteer.bind(this);
        this.getPendingRequests = this.getPendingRequests.bind(this);
        this.getMyAssistanceRequests = this.getMyAssistanceRequests.bind(this);
    }

    async requestAssistance(req: Request, res: Response): Promise<void> {
        const userId = req.user?.userId;
        const { formData } = req.body;

        formData.user = userId;
        formData.status = 'pending';
        formData.volunteer = null;

        try {
            const createAssistanceRequest = await this.assistanceRequestService.createAssistanceRequest(formData);
            if (createAssistanceRequest) {
                res.status(HttpStatusCode.CREATED).json({ success: true, message: ErrorMessages.ASSISTANCE_REQUEST_CREATE_SUCCESS });
            }
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_CREATE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.ASSISTANCE_REQUEST_CREATE_FAILED, error });
        }
    }

    async getNearbyRequests(req: Request, res: Response): Promise<void> {
        try {
            const { userId: volunteerId } = req.user as JwtPayload;
            const page = parseInt(req.query.page as string, 10) || 1;
            const search = req.query.search as string;
            const filter = req.query.filter as string;

            const { requests, metadata } = await this.assistanceRequestService.getNearbyRequests(
                volunteerId,
                page,
                search,
                filter
            );

            const total = metadata.total;
            const totalPages = Math.ceil(total / 4);

            res.status(HttpStatusCode.OK).json({
                success: true,
                nearbyRequests: requests,
                totalPages,
                documentsCount: total
            });
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_NEARBY_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorMessages.ASSISTANCE_REQUEST_FETCH_NEARBY_FAILED, error });
        }
    }

    async updateRequestStatus(req: Request, res: Response): Promise<void> {
        try {
            const { userId: volunteerId } = req.user as JwtPayload;
            const requestId = req.params.id;
            const { action } = req.body;

            const updatedRequest = await this.assistanceRequestService.updateRequestStatus(
                requestId,
                volunteerId,
                action,
            );

            let message = '';

            if (updatedRequest === 'Request approved') {
                message = ErrorMessages.ASSISTANCE_REQUEST_APPROVED;
            } else if (updatedRequest === 'reject') {
                message = ErrorMessages.ASSISTANCE_REQUEST_REJECTED;
            } else if (updatedRequest === 'complete') {
                message = ErrorMessages.ASSISTANCE_REQUEST_COMPLETED;
            }

            res.status(HttpStatusCode.OK).json({
                success: true,
                message,
                data: updatedRequest
            });
        } catch (error: any) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_UPDATE_STATUS_FAILED, error);
            res.status(HttpStatusCode.BAD_REQUEST).json({
                success: false,
                message: ErrorMessages.ASSISTANCE_REQUEST_UPDATE_STATUS_FAILED,
                error: error.message
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

            res.status(HttpStatusCode.OK).json({ success: true, assistanceRequests, totalPages, totalRequests: documentsCount });
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error });
        }
    }

    async getMyAssistanceRequests(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user as JwtPayload;
            const page = parseInt(req.query.page as string, 10) || 1;
            let limit = parseInt(req.query.limit as string, 10) || 5;
            const search = req.query.search as string;
            const filter = req.query.filter as string;
            const priority = req.query.priority as string;
            const sort = req.query.sort as string;
            let skip = !search ? (page - 1) * limit : 0;

            const assistanceRequests = await this.assistanceRequestService.fetchMyAssistanceRequests(userId, search, filter, skip, limit, sort, priority);
            const documentsCount = await this.assistanceRequestService.countMyAssistanceRequests(userId, search, filter, priority);
            const totalPages = Math.ceil(documentsCount / limit);

            res.status(HttpStatusCode.OK).json({ success: true, assistanceRequests, totalPages, totalRequests: documentsCount });
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error });
        }
    }

    async getPendingRequests(req: Request, res: Response): Promise<void> {
        try {
            const pendingRequests = await this.assistanceRequestService.fetchPendingRequests();

            res.status(HttpStatusCode.OK).json({ success: true, pendingRequests });
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_PENDING_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.ASSISTANCE_REQUEST_FETCH_PENDING_FAILED, error });
        }
    }

    async getProcessingRequests(req: Request, res: Response): Promise<void> {
        const { userId: volunteerId } = req.user as JwtPayload;

        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        const filter = req.query.filter as string;
        let skip = !search ? (page - 1) * limit : 0;

        try {
            const processingRequests = await this.assistanceRequestService.fetchProcessingRequests(search, filter, skip, limit, volunteerId);
            const documentsCount = await this.assistanceRequestService.countProcessingRequests(search, filter, volunteerId);
            const totalPages = Math.ceil(documentsCount / limit);

            res.status(HttpStatusCode.OK).json({ success: true, processingRequests, totalPages, totalRequests: documentsCount });
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_PROCESSING_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.ASSISTANCE_REQUEST_FETCH_PROCESSING_FAILED, error });
        }
    }

    async getAssistanceRequestDetails(req: Request, res: Response): Promise<void> {
        const requestId = req.params.id;
        try {
            const requestDetails = await this.assistanceRequestService.fetchAssistanceRequestDetails(requestId);
            if (requestDetails) {
                res.status(HttpStatusCode.OK).json({ success: true, requestDetails });
            } else {
                res.status(HttpStatusCode.NOT_FOUND).json({ success: false, message: ErrorMessages.ASSISTANCE_REQUEST_NOT_FOUND });
            }
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_DETAILS_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.ASSISTANCE_REQUEST_DETAILS_FETCH_FAILED, error });
        }
    }

    async assignVolunteer(req: Request, res: Response): Promise<void> {
        const requestId = req.params.id;
        const { volunteerId } = req.body;

        try {
            const isTasksLimit = await this.assistanceRequestService.checkTasksLimit(volunteerId);
            if (isTasksLimit) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_TASK_LIMIT });
                return;
            }

            const assignSuccess = await this.assistanceRequestService.assignVolunteer(requestId, volunteerId);
            if (assignSuccess) {
                res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_ASSIGNED });
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_ASSIGN_FAILED });
            }
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_ASSIGN_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_ASSIGN_FAILED, error });
        }
    }
}
