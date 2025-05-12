import { injectable } from 'tsyringe';
import Meeting from '../../models/meeting.model';
import { IMeeting } from '../../interfaces/meeting.interface';
import { IMeetingRepository } from '../interfaces/IMeetingRepository';
import { Types } from 'mongoose';

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

    async findAll(query: any, skip: number, limit: number): Promise<IMeeting[]> {
        try {
            return await Meeting.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ scheduledTime: -1 })
        } catch (error) {
            console.error('Error finding meetings:', error);
            throw error;
        }
    }

    async countMeetings(query: object): Promise<number | null> {
        try {
            return await Meeting.countDocuments(query);
        } catch (error) {
            console.log('Error counting meetings: ', error)
            return null;
        }
    }

    async findUpcomingMeetings(): Promise<IMeeting[] | null> {
        try {
            return await Meeting.find({ status: 'scheduled' })
                .sort({ scheduledTime: 1 });
        } catch (error) {
            console.error('Error finding all meetings:', error);
            throw error;
        }
    }

    async updateStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed' | 'cancelled'): Promise<IMeeting | null> {
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

    async deleteById(meetingId: string): Promise<IMeeting | null> {
        try {
            return await Meeting.findByIdAndDelete(meetingId);
        } catch (error) {
            console.error('Error deleting the meeting:', error);
            throw error;
        }
    }
}