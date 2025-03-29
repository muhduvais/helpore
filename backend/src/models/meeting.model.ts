import mongoose, { Schema, Types } from "mongoose";
import { IMeeting } from "../interfaces/meeting.interface";

const MeetingSchema = new Schema<IMeeting>({
    adminId: { type: String, required: true },
    title: { type: String, required: true },
    participants: [{ type: Types.ObjectId, ref: 'users' }],
    scheduledTime: { type: Date || String, default: Date.now },
    status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled', },
    createdAt: { type: Date, default: Date.now },
});

const Meeting = mongoose.model("meetings", MeetingSchema);

export default Meeting;