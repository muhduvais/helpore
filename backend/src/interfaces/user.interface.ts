import mongoose, { Document, Types } from "mongoose";

export interface IUser {
    userId?: string;
    name: string;
    age: number;
    gender: string;
    phone: number;
    email: string;
    password: string;
    profilePicture: string;
    certificates: string[];
    isActive: boolean;
    isBlocked: boolean;
    isVerified: boolean;
    role: string;
    tasks: number;
    googleId: string | null;
    resetToken: string;
    resetTokenExpiry: Date;
    uid?: string;
}

export interface IUserDocument extends Document {
    userId: string;
    name: string;
    age: number;
    gender: string;
    phone: number;
    email: string;
    password: string;
    profilePicture: string;
    certificates: string[];
    isActive: boolean;
    isBlocked: boolean;
    isVerified: boolean;
    role: string;
    tasks: number;
    googleId: string | null;
    resetToken: string;
    resetTokenExpiry: Date;
    uid?: string;
}

export interface IAddress {
    _id?: Types.ObjectId;
    fname: string;
    lname: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
    entity?: Types.ObjectId;
    type?: string;
    latitude?: number;
    longitude?: number;
}

export interface IAddressDocument extends Document {
    _id: Types.ObjectId;
    fname: string;
    lname: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
    entity?: Types.ObjectId;
    type?: string;
    latitude?: number;
    longitude?: number;
}

export interface IAsset extends Document {
    name: string;
    category: string;
    description: string;
    stocks: number;
    image: string;
}

export interface IAssetRequest extends Document {
    asset: Types.ObjectId;
    user: Types.ObjectId;
    status: string;
    requestedDate: Date;
    quantity: Number;
    comment: string;
}

export interface IAssistanceRequest {
    user: Types.ObjectId;
    type: 'volunteer' | 'ambulance';
    description?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedDate: Date;
    requestedTime: string;
    priority: 'urgent' | 'normal';
    address?: IAddress;
    volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
    volunteer?: Types.ObjectId | string;
    rejectedBy?: [string];
}

export interface IAssistanceRequestDocument extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    type: 'volunteer' | 'ambulance';
    description?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedDate: Date;
    requestedTime: string;
    priority: 'urgent' | 'normal';
    address?: IAddress;
    volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
    volunteer?: Types.ObjectId | string;
    rejectedBy?: [string];
}

export interface IAssistanceRequestResponse {
    _id: string;
    user: Types.ObjectId;
    type: 'volunteer' | 'ambulance';
    description?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedDate: string;
    requestedTime: string;
    priority: 'urgent' | 'normal';
    address?: Types.ObjectId;
    useDefaultAddress: boolean;
    volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
    volunteer?: Types.ObjectId | IUser;
    comment?: string;
    createdAt: string;
    updatedAt: string;
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