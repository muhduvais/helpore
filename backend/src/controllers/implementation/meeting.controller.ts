import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IMeetingService } from '../../services/interfaces/ServiceInterface';
import { IMeetingController } from '../interfaces/IMeetingController';

@injectable()
export class MeetingController implements IMeetingController {
    constructor(
        @inject('IMeetingService') private readonly meetingService: IMeetingService,
    ) {
        this.generateZegoToken = this.generateZegoToken.bind(this);
    }

    async generateZegoToken(req: Request, res: Response): Promise<void> {
        try {
            const { userId, roomId, userName } = req.body;

            const token = this.meetingService.generateToken(
                userId,
                roomId,
                userName
            );

            res.json({ token });
        } catch (error) {
            res.status(500).json({ error: 'Token generation failed' });
        }
    }
}