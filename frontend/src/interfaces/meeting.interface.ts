import { Document } from 'mongoose';

export interface ZegoCloudConfiguration {
  appID: number;
  appSign: string;
}

export interface IMeeting extends Document {
  _id: string;
  adminId: string;
  title: string;
  participants: string[];
  scheduledTime: Date | string;
  status: 'scheduled' | 'active' | 'completed';
  createdAt: Date;
}

export interface VideoConferenceConfig {
  roomID: string;
  userID: string;
  userName: string;
}

export interface MeetingRoomProps {
  meetingId?: string;
  isHost?: boolean;
}