import { Types } from "mongoose";

export interface IMeeting {
    adminId: string;
    title: string;
    participants: Types.ObjectId[];
    scheduledTime: Date | string;
    status: 'scheduled' | 'active' | 'completed';
    createdAt: Date;
};

export interface IMeetingDocument extends IMeeting, Document {
    _id: string,
};