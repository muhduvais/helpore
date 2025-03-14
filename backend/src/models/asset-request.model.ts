import mongoose, { Schema } from "mongoose";
import { IAssetRequest } from "../interfaces/user.interface";

const assetRequestSchema = new Schema<IAssetRequest>({
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assets',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    requestedDate: {
        type: Date,
    },
    quantity: {
        type: Number,
    },
    comment: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
    },
}, {
    timestamps: true
});

const AssetRequest = mongoose.model<IAssetRequest>('assetRequests', assetRequestSchema);
export default AssetRequest;