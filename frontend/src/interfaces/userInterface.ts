import { IAsset } from "./adminInterface";
import { Types } from "mongoose";

export interface IUser {
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
    _id?: string;
    uid?: string;
    createdAt?: Date;
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

export interface UserProfileOptionsProps {
    triggerOption: (value: string) => void;
}

export interface ChangePasswordData {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
}

export interface IAssetRequest {
    _id: string;
    asset: IAsset;
    requestedDate: string;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    createdAt: string;
    updatedAt: string;
}