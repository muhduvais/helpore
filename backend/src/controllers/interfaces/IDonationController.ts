import { Request, Response } from 'express';

export interface IDonationController {
    createCheckoutSession(req: Request, res: Response): Promise<void>;
    webhook (req: Request, res: Response): Promise<void>;
    fetchDontaionHistory (req: Request, res: Response): Promise<void>;
    generateReceipt(req: Request, res: Response): Promise<void>;
    getDonations(req: Request, res: Response): Promise<void>;
    exportDonations(req: Request, res: Response): Promise<void>;
    getRecentDonations(req: Request, res: Response): Promise<void>;
}