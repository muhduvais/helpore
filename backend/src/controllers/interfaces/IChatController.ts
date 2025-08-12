import { Request, Response } from 'express';

export interface IChatController {
    sendMessage(req: Request, res: Response): Promise<void>;
    uploadMedia(req: Request, res: Response): Promise<void>;
    getConversationMessages(req: Request, res: Response): Promise<void>;
    getUserConversations(req: Request, res: Response): Promise<void>;
    markConversationAsRead(req: Request, res: Response): Promise<void>;
}