import { Request, Response } from 'express';

export interface IAssetController {
    addAsset(req: Request, res: Response): Promise<void>;
    uploadAssetImage(req: Request, res: Response): Promise<void>;
    getAssets(req: Request, res: Response): Promise<void>;
    getAssetDetails(req: Request, res: Response): Promise<void>;
    updateAsset(req: Request, res: Response): Promise<void>;
}