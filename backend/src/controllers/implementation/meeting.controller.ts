import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IMeetingService } from '../../services/interfaces/ServiceInterface';
import { IMeetingController } from '../interfaces/IMeetingController';
import { JwtPayload } from 'jsonwebtoken';

@injectable()
export class MeetingController implements IMeetingController {
    constructor(
        @inject('IMeetingService') private readonly meetingService: IMeetingService,
    ) {
        this.generateZegoToken = this.generateZegoToken.bind(this);
        this.createMeeting = this.createMeeting.bind(this);
        this.getMeetings = this.getMeetings.bind(this);
        this.getMeetingById = this.getMeetingById.bind(this);
        this.updateMeetingStatus = this.updateMeetingStatus.bind(this);
        this.getUserMeetings = this.getUserMeetings.bind(this);
        this.deleteMeeting = this.deleteMeeting.bind(this);
        this.getUpcomingMeetings = this.getUpcomingMeetings.bind(this);
    }

    async createMeeting(req: Request, res: Response): Promise<void> {
        try {
            const { adminId, title, participants, scheduledTime } = req.body;

            const meeting = await this.meetingService.createMeeting(
                adminId,
                title,
                participants,
                scheduledTime
            );

            res.status(201).json({ meeting });
        } catch (error) {
            console.error('Error creating meeting:', error);
            res.status(500).json({ error: 'Could not create meeting' });
        }
    }

    async getMeetings(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const search = req.query.search as string;
            const filter = req.query.filter as string;

            const meetings = await this.meetingService.getMeetings(
                page,
                5,
                search,
                filter
            );

            const documentsCount = await this.meetingService.totalMeetingsCount(search, filter) || 0;

            res.json({
                meetings,
                totalPages: Math.ceil(documentsCount / 5),
                totalItems: documentsCount,
            });
        } catch (error) {
            console.error('Error fetching meetings:', error);
            res.status(500).json({ error: 'Could not fetch meetings' });
        }
    }

    async getUpcomingMeetings(req: Request, res: Response): Promise<void> {
        try {
            const upcomingMeetings = await this.meetingService.getUpcomingMeetings();
            res.status(200).json({ upcomingMeetings });
        } catch (error) {
            console.error('Error fetching upcoming meetings:', error);
            res.status(500).json({ error: 'Could not fetch upcoming meetings' });
        }
    }

    async getMeetingById(req: Request, res: Response): Promise<void> {
        try {
            const { meetingId } = req.params;
            const meeting = await this.meetingService.getMeetingById(meetingId);

            if (!meeting) {
                res.status(404).json({ error: 'Meeting not found' });
                return;
            }

            res.json(meeting);
        } catch (error) {
            console.error('Error fetching meeting details:', error);
            res.status(500).json({ error: 'Could not fetch meeting details' });
        }
    }

    getUserMeetings = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.user as JwtPayload;
            const page = parseInt(req.query.page as string) || 1;
            const search = req.query.search as string;
            const filter = req.query.filter as string;

            if (!userId) {
                res.status(401).json({ message: 'User not authenticated!' });
                return;
            }

            const meetings = await this.meetingService.getUserMeetings(
                userId,
                page,
                5,
                search,
                filter
            );

            const userMeetingsCount = await this.meetingService.totalUserMeetingsCount(userId, search, filter) || 0;

            res.json({
                meetings,
                totalPages: Math.ceil(userMeetingsCount / 5),
                totalItems: userMeetingsCount,
            });
        } catch (error) {
            console.error('Error fetching user meetings:', error);
            res.status(500).json({ message: 'Failed to fetch user meetings' });
        }
    };

    async updateMeetingStatus(req: Request, res: Response): Promise<void> {
        try {
            const { meetingId } = req.params;
            const { status } = req.body;

            const updatedMeeting = await this.meetingService.updateMeetingStatus(
                meetingId,
                status
            );

            if (!updatedMeeting) {
                res.status(404).json({ error: 'Meeting not found' });
                return;
            }

            res.json(updatedMeeting);
        } catch (error) {
            console.error('Error updating meeting status:', error);
            res.status(500).json({ error: 'Could not update meeting status' });
        }
    }

    async generateZegoToken(req: Request, res: Response): Promise<void> {
        try {
            const { userId, roomId, userName } = req.body;

            const token = await this.meetingService.generateToken(
                userId,
                roomId,
                userName
            );

            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ error: 'Token generation failed' });
        }
    }

    async deleteMeeting(req: Request, res: Response): Promise<void> {
        try {
            const { meetingId } = req.params;

            await this.meetingService.deleteMeeting(meetingId);

            res.status(200).json({ message: 'Meeting deleted successfully!' });
        } catch (error) {
            res.status(500).json({ error: 'Error deletig meeting!' });
        }
    }
}