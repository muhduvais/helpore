export interface IMeeting {
    adminId: string,
    title: string,
    participants: [string],
    scheduledTime: Date | string,
    status: string,
    createdAt: Date,
};

export interface IMeetingDocument extends Document {
    _id: string,
    adminId: string,
    title: string,
    participants: [string],
    scheduledTime: Date | string,
    status: string,
    createdAt: Date,
};