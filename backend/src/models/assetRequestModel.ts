import mongoose, { Schema } from "mongoose";
import { IAssetRequest } from "../interfaces/userInterface";

const assetRequestSchema = new Schema<IAssetRequest>({
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    requestedDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
    },
}, {
    timestamps: true
});

const AssetRequest = mongoose.model<IAssetRequest>('AssetRequests', assetRequestSchema);
export default AssetRequest;