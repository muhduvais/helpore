import mongoose, { Schema } from "mongoose";
import { IAsset } from "../interfaces/userInterface";

const assetSchema = new Schema<IAsset>({
    name: {
        type: String,
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    stocks: {
        type: Number,
    },
    image: {
        type: String,
    },
}, {
    timestamps: true
});

const Asset = mongoose.model<IAsset>('assets', assetSchema);
export default Asset;