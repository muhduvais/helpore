import mongoose, { Schema } from "mongoose";
import { IAddress } from "../interfaces/userInterface";

const addressSchema = new Schema<IAddress>({
    fname: {
        type: String,
    },
    lname: {
        type: String,
    },
    street: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    pincode: {
        type: Number,
    },
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    type: {
        type: String,
        enum: ['user', 'volunteer'],
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Address = mongoose.model<IAddress>('addresses', addressSchema);
export default Address;