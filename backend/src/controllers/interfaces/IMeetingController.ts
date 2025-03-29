import { Request, Response } from 'express';

export interface IMeetingController {
    generateZegoToken(req: Request, res: Response): Promise<void>;
    createMeeting(req: Request, res: Response): Promise<void>;
    getMeetings(req: Request, res: Response): Promise<void>;
    getMeetingById(req: Request, res: Response): Promise<void>;
    getUserMeetings(req: Request, res: Response): Promise<void>;
    updateMeetingStatus(req: Request, res: Response): Promise<void>;
    updateMeetingStatus(req: Request, res: Response): Promise<void>;
}