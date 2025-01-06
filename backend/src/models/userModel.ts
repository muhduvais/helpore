import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    age: number;
    gender: string;
    phone: number;
    email: string;
    password: string;
    profilePicture: string;
    isBlocked: boolean;
    isVerified: boolean;
    isAdmin: boolean;
    googleId: string;
    resetToken: string;
    resetTokenExpiry: Date;
}

export interface IUserInput {
    name: string;
    age: number;
    gender: string;
    phone: number;
    email: string;
    password: string;
    profilePicture: string;
    isBlocked: boolean;
    isVerified: boolean;
    isAdmin: boolean;
    googleId: string;
    resetToken: string;
    resetTokenExpiry: Date;
}

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
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
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