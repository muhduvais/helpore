import { IMeeting } from "../../interfaces/meeting.interface";

export interface IMeetingRepository {
  create(meeting: IMeeting): Promise<IMeeting>;
  findById(meetingId: string): Promise<IMeeting | null>;
  findMeetingsByParticipantId(userId: string): Promise<IMeeting[]>;
  findAll(): Promise<IMeeting[]>;
  updateStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed' | 'cancelled'): Promise<IMeeting | null>;
}