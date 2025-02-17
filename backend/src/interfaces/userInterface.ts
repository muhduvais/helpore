import mongoose, { Document, Types } from "mongoose";

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
    quantity: Number;
    comment: string;
}

export interface IAssetRequestResponse {
    _id: string;
    asset: IAsset;
    requestedDate: string;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AssetRequestDocument {
    _id: mongoose.Types.ObjectId;
    asset: mongoose.Types.ObjectId | {
        _id: mongoose.Types.ObjectId;
        name: string;
        category: string;
        description: string;
        stocks: number;
        image: string;
    };
    user: mongoose.Types.ObjectId;
    requestedDate: Date;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BaseAssetRequest {
    _id: mongoose.Types.ObjectId;
    asset: mongoose.Types.ObjectId | Record<string, any>;
    user: mongoose.Types.ObjectId;
    requestedDate: Date;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    userId: string;
}