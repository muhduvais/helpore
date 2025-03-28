import mongoose, { Schema } from "mongoose";
import { IUser, IUserDocument } from "../interfaces/user.interface";

const userSchema = new Schema<IUserDocument>({
    name: {
        type: String,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
    },
    phone: {
        type: Number,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    certificates: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['admin', 'volunteer', 'user'],
    },
    tasks: {
        type: Number,
        default: 0,
    },
    googleId: {
        type: String,
        default: null,
    },
    resetToken: { 
        type: String, 
        default: null 
    },
    resetTokenExpiry: { 
        type: Date, 
        default: null 
    },
}, {
    timestamps: true
});

const User = mongoose.model<IUserDocument>('users', userSchema);
export default User;