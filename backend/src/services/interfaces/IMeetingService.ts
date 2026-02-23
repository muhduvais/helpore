import { MeetingDTO } from "../../dtos/meeting.dto";
import { IMeeting } from "../../interfaces/meeting.interface";

export interface IMeetingService {
    createMeeting(adminId: string, title: string, participants: string[], scheduledTime: Date | string): Promise<IMeeting>;
    getMeetings(page: number, limit: number, search: string, filter: string): Promise<MeetingDTO[] | null>;
    totalMeetingsCount(search: string, filter: string): Promise<number | null>;
    totalUserMeetingsCount(userId: string, search: string, filter: string): Promise<number | null>;
    getMeetingById(meetingId: string): Promise<MeetingDTO | null>;
    getUserMeetings(userId: string, page: number, limit: number, search: string, filter: string): Promise<MeetingDTO[] | null>;
    updateMeetingStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed'): Promise<IMeeting | null>;
    generateToken(userId: string, roomId: string, userName: string): Promise<string>;
    deleteMeeting(meetingId: string): Promise<IMeeting | null>;
    getUpcomingMeetings(): Promise<MeetingDTO[] | null>;
}