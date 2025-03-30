import { inject, injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import { IMeetingService } from '../interfaces/ServiceInterface';
import { IMeetingRepository } from '../../repositories/interfaces/IMeetingRepository';
import { IMeeting } from '../../interfaces/meeting.interface';
import { Types } from 'mongoose';
import { io } from '../../utils';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository';

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

    async getMeetings(): Promise<IMeeting[]> {
        return await this.meetingRepository.findAll();
    }

    async getUpcomingMeetings(): Promise<IMeeting[] | null> {
        return await this.meetingRepository.findUpcomingMeetings();
    }

    async getMeetingById(meetingId: string): Promise<IMeeting | null> {
        return await this.meetingRepository.findById(meetingId);
    }

    async getUserMeetings(userId: string): Promise<IMeeting[]> {
        return await this.meetingRepository.findMeetingsByParticipantId(userId);
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