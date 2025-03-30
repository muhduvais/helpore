import { Types } from "mongoose";

export interface IMeeting {
    _id?: string;
    adminId: string;
    title: string;
    participants: Types.ObjectId[];
    scheduledTime: Date | string;
    status: 'scheduled' | 'active' | 'completed';
    createdAt: Date;
};

export interface IMeetingDocument extends Document {
    _id: string;
    adminId: string;
    title: string;
    participants: Types.ObjectId[];
    scheduledTime: Date | string;
    status: 'scheduled' | 'active' | 'completed';
    createdAt: Date;
};