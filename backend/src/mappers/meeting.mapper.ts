import { plainToInstance } from 'class-transformer';
import { MeetingDTO } from '../dtos/meeting.dto';
import { IMeetingDocument } from '../interfaces/meeting.interface';

export const toMeetingDTO = (meeting: IMeetingDocument): MeetingDTO => {
  return plainToInstance(MeetingDTO, {
    id: meeting._id,
    adminId: meeting.adminId,
    title: meeting.title,
    participants: meeting.participants.map((p) => p.toString()),
    scheduledTime: meeting.scheduledTime,
    status: meeting.status,
    createdAt: meeting.createdAt.toISOString(),
  });
};

export const toMeetingListDTO = (meetings: IMeetingDocument[]): MeetingDTO[] => {
  return meetings.map(toMeetingDTO);
};
