import { injectable } from 'tsyringe';
import Meeting from '../../models/meeting.model';
import { IMeeting } from '../../interfaces/meeting.interface';
import { IMeetingRepository } from '../interfaces/IMeetingRepository';
import mongoose from 'mongoose';

@injectable()
export class MeetingRepository implements IMeetingRepository {
    async create(meeting: IMeeting): Promise<IMeeting> {
        try {
            const newMeeting = new Meeting(meeting);
            return await newMeeting.save();
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    }

    async findById(meetingId: string): Promise<IMeeting | null> {
        try {
            return await Meeting.findById(meetingId);
        } catch (error) {
            console.error('Error finding meeting by ID:', error);
            throw error;
        }
    }

    async findByUserId(userId: string): Promise<IMeeting[]> {
        try {
            return await Meeting.find();
        } catch (error) {
            console.error('Error finding meetings by user ID:', error);
            throw error;
        }
    }

    async findAll(): Promise<IMeeting[]> {
        try {
            return await Meeting.find();
        } catch (error) {
            console.error('Error finding all meetings:', error);
            throw error;
        }
    }

    async updateStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed'): Promise<IMeeting | null> {
        try {
            return await Meeting.findByIdAndUpdate(
                meetingId,
                { status },
                { new: true }
            );
        } catch (error) {
            console.error('Error updating meeting status:', error);
            throw error;
        }
    }
}