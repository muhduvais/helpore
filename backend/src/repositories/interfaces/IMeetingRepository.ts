import { IMeeting, IMeetingDocument } from "../../interfaces/meeting.interface";

export interface IMeetingRepository {
  create(meeting: IMeeting): Promise<IMeeting>;
  findById(meetingId: string): Promise<IMeeting | null>;
  findAll(query: any, skip: number, limit: number): Promise<IMeeting[]>;
  countMeetings(query: object): Promise<number | null>;
  updateStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed' | 'cancelled'): Promise<IMeeting | null>;
  deleteById(meetingId: string): Promise<IMeeting | null>;
  findUpcomingMeetings(): Promise<IMeeting[] | null>;
}