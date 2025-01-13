import { Document, Types } from "mongoose";


export interface IUser extends Document {
    name: string;
    age: number;
    gender: string;
    phone: number;
    email: string;
    password: string;
    profilePicture: string;
    isActive: boolean;
    isBlocked: boolean;
    isVerified: boolean;
    role: string;
    googleId: string;
    resetToken: string;
    resetTokenExpiry: Date;
    uid?: string;
}

export interface IAddress {
    fname: string;
    lname: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
    entity?: Types.ObjectId;
    type?: string;
    latitude?: string;
    longtitude?: string;
}