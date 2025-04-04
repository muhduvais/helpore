import { inject, injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import { IMeetingService } from '../interfaces/ServiceInterface';
import { IMeetingRepository } from '../../repositories/interfaces/IMeetingRepository';
import { IMeeting } from '../../interfaces/meeting.interface';
import { Types } from 'mongoose';
import { io } from '../../utils';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository';
import { error } from 'console';

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
            content: `New meeting scheduled: "${title}" on ${new Date(scheduledTime).toLocaleString()}`,
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
            content: `New meeting scheduled: "${title}" on ${new Date(scheduledTime).toLocaleString()}`,
            read: false,
            requestId: newMeeting._id?.toString() || '',
            sender: adminId,
        });

        return newMeeting;
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
        } catch (err) {
            console.log('Error fetching meetings: ', error);
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
            console.error('Error counting meetings:', error);
            throw new Error('Error counting meetings');
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
            console.error('Error counting meetings:', error);
            throw new Error('Error counting meetings');
        }
    }

    async getUpcomingMeetings(): Promise<IMeeting[] | null> {
        return await this.meetingRepository.findUpcomingMeetings();
    }

    async getMeetingById(meetingId: string): Promise<IMeeting | null> {
        return await this.meetingRepository.findById(meetingId);
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
            console.log('Error fetching user meetings: ', error);
            return null;
        }
    }

    async updateMeetingStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed'): Promise<IMeeting | null> {
        return await this.meetingRepository.updateStatus(meetingId, status);
    }

    async generateToken(userId: string, roomId: string, userName: string): Promise<string> {
        const currentTime = Math.floor(Date.now() / 1000);
        const expireTime = currentTime + 3600;

        const payload = {
            app_id: this.appId,
            user_id: userId,
            room_id: roomId,
            user_name: userName,
            timestamp: currentTime,
            nonce: Math.floor(Math.random() * 100000),
            expire: expireTime
        };

        const token = jwt.sign(payload, this.serverSecret, {
            algorithm: 'HS256'
        });

        return token;
    }

    async deleteMeeting(meetingId: string): Promise<IMeeting | null> {
        return await this.meetingRepository.deleteById(meetingId);
    }
}