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
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['user', 'volunteer'],
    },
    latitude: {
        type: String,
    },
    longtitude: {
        type: String,
    },
}, {
    timestamps: true
});

const Address = mongoose.model<IAddress>('addresses', addressSchema);
export default Address;