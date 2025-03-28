import { Request, Response } from 'express';

export interface IMeetingController {
    generateZegoToken(req: Request, res: Response): Promise<void>;
}