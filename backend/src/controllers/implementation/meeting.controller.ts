import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IMeetingService } from '../../services/interfaces/ServiceInterface';
import { IMeetingController } from '../interfaces/IMeetingController';
import { JwtPayload } from 'jsonwebtoken';
import { HttpStatusCode } from '../../constants/httpStatus';
import { ErrorMessages } from '../../constants/errorMessages';

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

            res.status(HttpStatusCode.CREATED).json({ meeting });
        } catch (error) {
            console.error(ErrorMessages.MEETING_CREATE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.MEETING_CREATE_FAILED });
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

            res.status(HttpStatusCode.OK).json({
                meetings,
                totalPages: Math.ceil(documentsCount / 5),
                totalItems: documentsCount,
            });
        } catch (error) {
            console.error(ErrorMessages.MEETING_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.MEETING_FETCH_FAILED });
        }
    }

    async getUpcomingMeetings(req: Request, res: Response): Promise<void> {
        try {
            const upcomingMeetings = await this.meetingService.getUpcomingMeetings();
            res.status(HttpStatusCode.OK).json({ upcomingMeetings });
        } catch (error) {
            console.error(ErrorMessages.MEETING_FETCH_UPCOMING_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.MEETING_FETCH_UPCOMING_FAILED });
        }
    }

    async getMeetingById(req: Request, res: Response): Promise<void> {
        try {
            const { meetingId } = req.params;
            const meeting = await this.meetingService.getMeetingById(meetingId);

            if (!meeting) {
                res.status(HttpStatusCode.NOT_FOUND).json({ error: ErrorMessages.MEETING_NOT_FOUND });
                return;
            }

            res.status(HttpStatusCode.OK).json(meeting);
        } catch (error) {
            console.error(ErrorMessages.MEETING_DETAILS_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.MEETING_DETAILS_FETCH_FAILED });
        }
    }

    getUserMeetings = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.user as JwtPayload;
            const page = parseInt(req.query.page as string) || 1;
            const search = req.query.search as string;
            const filter = req.query.filter as string;

            if (!userId) {
                res.status(HttpStatusCode.UNAUTHORIZED).json({ message: ErrorMessages.UNAUTHORIZED_MEETING_ACCESS });
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

            res.status(HttpStatusCode.OK).json({
                meetings,
                totalPages: Math.ceil(userMeetingsCount / 5),
                totalItems: userMeetingsCount,
            });
        } catch (error) {
            console.error(ErrorMessages.MEETING_USER_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.MEETING_USER_FETCH_FAILED });
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
                res.status(HttpStatusCode.NOT_FOUND).json({ error: ErrorMessages.MEETING_NOT_FOUND });
                return;
            }

            res.status(HttpStatusCode.OK).json(updatedMeeting);
        } catch (error) {
            console.error(ErrorMessages.MEETING_UPDATE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.MEETING_UPDATE_FAILED });
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

            res.status(HttpStatusCode.OK).json({ token });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.MEETING_TOKEN_FAILED });
        }
    }

    async deleteMeeting(req: Request, res: Response): Promise<void> {
        try {
            const { meetingId } = req.params;

            await this.meetingService.deleteMeeting(meetingId);

            res.status(HttpStatusCode.OK).json({ message: ErrorMessages.MEETING_DELETE_SUCCESS });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.MEETING_DELETE_FAILED });
        }
    }
}