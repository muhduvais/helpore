import { inject, injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import { IMeetingService } from '../interfaces/ServiceInterface';
import { IMeetingRepository } from '../../repositories/interfaces/IMeetingRepository';
import { IMeeting } from '../../interfaces/meeting.interface';
import { Types } from 'mongoose';
import { io } from '../../utils';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository';
import { generateToken04 } from '../../utils/zegoToken.util';
import { ErrorMessages } from '../../constants/errorMessages';

@injectable()
export class MeetingService implements IMeetingService {
    private appId: number;
    private serverSecret: string;

    constructor(appId: number, serverSecret: string,
        @inject('IMeetingRepository') private meetingRepository: IMeetingRepository,
        @inject('INotificationRepository') private notificationRepository: INotificationRepository,
    ) {
        this.appId = appId;
        this.serverSecret = serverSecret;
    }

    async createMeeting(adminId: string, title: string, participants: string[], scheduledTime: Date | string): Promise<IMeeting> {
        try {
            const meetingData: IMeeting = {
                adminId,
                title,
                participants: participants.map(id => new Types.ObjectId(id)),
                scheduledTime: new Date(scheduledTime),
                status: 'scheduled',
                createdAt: new Date()
            };

            const newMeeting = await this.meetingRepository.create(meetingData);

            const notification = {
                type: 'system',
                content: `${ErrorMessages.MEETING_SCHEDULED}: "${title}" on ${new Date(scheduledTime).toLocaleString()}`,
                read: false,
                requestId: newMeeting._id?.toString() || '',
                senderId: adminId,
            };

            if (io) {
                participants.forEach(participantId => {
                    io.to(`notification-${participantId}`).emit('new-notification', { ...notification, _id: new Types.ObjectId() });
                });
            }

            // Create a notification for the receiver
            await this.notificationRepository.createNotification({
                type: 'system',
                content: `${ErrorMessages.MEETING_SCHEDULED}: "${title}" on ${new Date(scheduledTime).toLocaleString()}`,
                read: false,
                requestId: newMeeting._id?.toString() || '',
                sender: adminId,
            });

            return newMeeting;
        } catch (error) {
            console.error(ErrorMessages.MEETING_CREATE_FAILED, error);
            throw new Error(ErrorMessages.MEETING_CREATE_FAILED);
        }
    }

    async getMeetings(page: number, limit: number, search: string, filter: string): Promise<IMeeting[] | null> {
        try {
            let skip = (page - 1) * limit;
            let query: any = {};

            if (search) {
                query = search ? { title: { $regex: search, $options: 'i' } } : {};
            }

            if (filter && filter !== 'all') {
                query.status = filter;
            }

            return await this.meetingRepository.findAll(query, skip, limit);
        } catch (error) {
            console.error(ErrorMessages.MEETING_FETCH_FAILED, error);
            return null;
        }
    }

    async totalMeetingsCount(search: string, filter: string): Promise<number | null> {
        try {
            let query: any = {};
            if (search) {
                query = search ? { title: { $regex: search, $options: 'i' } } : {};
            }
            if (filter && filter !== 'all') {
                query.status = filter;
            }
            return await this.meetingRepository.countMeetings(query);
        } catch (error) {
            console.error(ErrorMessages.MEETING_COUNT_FAILED, error);
            throw new Error(ErrorMessages.MEETING_COUNT_FAILED);
        }
    }

    async totalUserMeetingsCount(userId: string, search: string, filter: string): Promise<number | null> {
        try {
            const userObjectId = new Types.ObjectId(userId);
            let query: any = { participants: userObjectId };
            if (search) {
                query = search ? { title: { $regex: search, $options: 'i' } } : {};
            }
            if (filter && filter !== 'all') {
                query.status = filter;
            }
            return await this.meetingRepository.countMeetings(query);
        } catch (error) {
            console.error(ErrorMessages.MEETING_COUNT_FAILED, error);
            throw new Error(ErrorMessages.MEETING_COUNT_FAILED);
        }
    }

    async getUpcomingMeetings(): Promise<IMeeting[] | null> {
        try {
            return await this.meetingRepository.findUpcomingMeetings();
        } catch (error) {
            console.error(ErrorMessages.MEETING_FETCH_UPCOMING_FAILED, error);
            return null;
        }
    }

    async getMeetingById(meetingId: string): Promise<IMeeting | null> {
        try {
            return await this.meetingRepository.findById(meetingId);
        } catch (error) {
            console.error(ErrorMessages.MEETING_DETAILS_FETCH_FAILED, error);
            return null;
        }
    }

    async getUserMeetings(userId: string, page: number, limit: number, search: string, filter: string): Promise<IMeeting[] | null> {
        try {
            let skip = (page - 1) * limit;
            let query: any = {};

            if (search) {
                query = search ? { title: { $regex: search, $options: 'i' } } : {};
            }

            if (filter && filter !== 'all') {
                query.status = filter;
            }

            const userObjectId = new Types.ObjectId(userId);
            query.participants = userObjectId

            return await this.meetingRepository.findAll(query, skip, limit);
        } catch (error) {
            console.error(ErrorMessages.MEETING_USER_FETCH_FAILED, error);
            return null;
        }
    }

    async updateMeetingStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed'): Promise<IMeeting | null> {
        try {
            return await this.meetingRepository.updateStatus(meetingId, status);
        } catch (error) {
            console.error(ErrorMessages.MEETING_UPDATE_FAILED, error);
            throw new Error(ErrorMessages.MEETING_UPDATE_FAILED);
        }
    }

    async generateToken(userId: string, roomId: string, userName: string): Promise<string> {
        try {
            const effectiveTimeInSeconds = 3600;

            const token = generateToken04(
                this.appId,
                userId,
                this.serverSecret,
                effectiveTimeInSeconds,
                roomId,
            );

            const kitToken = `04${this.appId}${token}`;
            return kitToken;
        } catch (error) {
            console.error(ErrorMessages.MEETING_TOKEN_FAILED, error);
            throw new Error(ErrorMessages.MEETING_TOKEN_FAILED);
        }
    }

    async deleteMeeting(meetingId: string): Promise<IMeeting | null> {
        try {
            return await this.meetingRepository.deleteById(meetingId);
        } catch (error) {
            console.error(ErrorMessages.MEETING_DELETE_FAILED, error);
            throw new Error(ErrorMessages.MEETING_DELETE_FAILED);
        }
    }
}