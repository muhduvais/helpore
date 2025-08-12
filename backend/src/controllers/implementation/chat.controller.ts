import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IChatController } from '../interfaces/IChatController';
import { IChatService } from '../../services/interfaces/ServiceInterface';
import { JwtPayload } from 'jsonwebtoken';
import { HttpStatusCode } from '../../constants/httpStatus';
import { ErrorMessages } from '../../constants/errorMessages';

@injectable()
export class ChatController implements IChatController {
    constructor(
        @inject('IChatService') private readonly chatService: IChatService,
    ) {
        this.sendMessage = this.sendMessage.bind(this);
        this.getConversationMessages = this.getConversationMessages.bind(this);
        this.getUserConversations = this.getUserConversations.bind(this);
        this.markConversationAsRead = this.markConversationAsRead.bind(this);
        this.uploadMedia = this.uploadMedia.bind(this);
    }

    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { receiverId, content, requestId, senderType, receiverType, uploadedMediaUrls } = req.body;
            const { userId: senderId } = req.user as JwtPayload;

            const message = await this.chatService.sendMessage(senderId, receiverId, content, requestId, senderType, receiverType, uploadedMediaUrls);
            res.status(HttpStatusCode.CREATED).json({ success: true, data: message });
        } catch (error) {
            console.error(ErrorMessages.CHAT_SEND_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ErrorMessages.CHAT_SEND_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async uploadMedia(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const mediaFiles = req.files as Express.Multer.File[];

            const mediaUrls = await this.chatService.uploadMedia(mediaFiles, requestId) as string[];
            res.status(HttpStatusCode.OK).json({ success: true, mediaUrls });
        } catch (error) {
            console.error(ErrorMessages.CHAT_UPLOAD_MEDIA_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ErrorMessages.CHAT_UPLOAD_MEDIA_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getConversationMessages(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const messages = await this.chatService.getConversationMessages(requestId);
            res.status(HttpStatusCode.OK).json({ success: true, messages });
        } catch (error) {
            console.error(ErrorMessages.CHAT_FETCH_MESSAGES_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ErrorMessages.CHAT_FETCH_MESSAGES_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getUserConversations(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user as JwtPayload;
            const conversations = await this.chatService.getUserConversations(userId);
            res.status(HttpStatusCode.OK).json({ success: true, messages: conversations });
        } catch (error) {
            console.error(ErrorMessages.CHAT_FETCH_CONVERSATIONS_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ErrorMessages.CHAT_FETCH_CONVERSATIONS_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async markConversationAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { conversationId } = req.params;
            const { userId } = req.user as JwtPayload;

            await this.chatService.markConversationAsRead(conversationId, userId);
            res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.CHAT_MARK_READ_SUCCESS });
        } catch (error) {
            console.error(ErrorMessages.CHAT_MARK_READ_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ErrorMessages.CHAT_MARK_READ_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}