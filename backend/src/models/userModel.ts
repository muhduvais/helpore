import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/userInterface";

const userSchema = new Schema<IUser>({
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

const User = mongoose.model<IUser>('users', userSchema);
export default User;