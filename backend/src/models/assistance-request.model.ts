import mongoose, { Schema } from "mongoose";
import { IAssistanceRequest } from "../interfaces/user.interface";

const assistanceRequestSchema = new Schema<IAssistanceRequest>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    type: {
        type: String,
        enum: ['volunteer', 'ambulance'],
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    requestedDate: {
        type: Date,
        required: true
    },
    requestedTime: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['urgent', 'normal'],
        required: true
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'addresses'
    },
    volunteerType: {
        type: String,
        enum: ['medical', 'eldercare', 'maintenance', 'transportation', 'general'],
        required: function() { return this.type === 'volunteer'; }
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    rejectedBy: {
        type: [String],
        ref: 'users',
    },
}, {
    timestamps: true
});

const AssistanceRequest = mongoose.model<IAssistanceRequest>('assistanceRequests', assistanceRequestSchema);
export default AssistanceRequest;