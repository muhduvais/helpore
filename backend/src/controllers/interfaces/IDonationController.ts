import { Request, Response } from 'express';

export interface IDonationController {
    createCheckoutSession(req: Request, res: Response): Promise<void>;
    webhook (req: Request, res: Response): Promise<void>;
    fetchDontaionHistory (req: Request, res: Response): Promise<void>;
}