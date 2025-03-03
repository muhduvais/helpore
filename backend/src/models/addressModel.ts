import mongoose, { Schema } from "mongoose";
import { IAddress, IAddressDocument } from "../interfaces/userInterface";

const addressSchema = new Schema<IAddressDocument>({
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
    },
    longitude: {
        type: Number,
    }
}, {
    timestamps: true
});

const Address = mongoose.model<IAddressDocument>('addresses', addressSchema);
export default Address;