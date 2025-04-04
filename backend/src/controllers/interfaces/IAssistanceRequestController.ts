import { Request, Response } from 'express';

export interface IAssistanceRequestController {
    requestAssistance(req: Request, res: Response): Promise<void>;
    getAssistanceRequests(req: Request, res: Response): Promise<void>;
    getMyAssistanceRequests(req: Request, res: Response): Promise<void>;
    getPendingRequests(req: Request, res: Response): Promise<void>;
    getProcessingRequests(req: Request, res: Response): Promise<void>;
    getAssistanceRequestDetails(req: Request, res: Response): Promise<void>;
    assignVolunteer(req: Request, res: Response): Promise<void>;
    getNearbyRequests(req: Request, res: Response): Promise<void>;
    updateRequestStatus(req: Request, res: Response): Promise<void>;
}