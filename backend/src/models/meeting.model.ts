import mongoose, { Schema } from "mongoose";
import { IMeeting } from "../interfaces/meeting.interface";

const MeetingSchema = new Schema<IMeeting>({
    adminId: { type: String, required: true },
    title: { type: String, required: true },
    participants: { type: [String], required: true },
    scheduledTime: { type: Date || String, default: Date.now },
    status: { type: String, default: 'scheduled', enum: ['scheduled', 'active', 'completed'] },
    createdAt: { type: Date, default: Date.now },
});

const Meeting = mongoose.model("meetings", MeetingSchema);

export default Meeting;