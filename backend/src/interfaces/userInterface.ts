import { Document, Types } from "mongoose";

export interface IUser extends Document {
    userId?: string;
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

export interface IAsset {
    name: string;
    category: string;
    description: string;
    stocks: number;
    image: string;
}

export interface IAssetRequest {
    asset: Types.ObjectId;
    user: Types.ObjectId;
    status: string;
    requestedDate: Date;
}
                  
export interface User {
    userId: string;
}