import { Request, Response } from 'express';

export interface IAssetRequestController {
    requestAsset(req: Request, res: Response): Promise<void>;
    getAssetRequests(req: Request, res: Response): Promise<void>;
    getMyAssetRequests(req: Request, res: Response): Promise<void>;
    getAssetRequestDetails(req: Request, res: Response): Promise<void>;
    updateAssetRequestStatus(req: Request, res: Response): Promise<void>;
}