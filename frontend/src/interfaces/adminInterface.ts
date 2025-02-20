import { Types } from "mongoose";
import { IUser } from "./userInterface";

export interface AddAssetData {
    name: string,
    category: string,
    description: string,
    stocks: Number | null,
    image: string | null,
}

export interface IAsset {
    _id: string;
    name: string;
    category: string;
    description: string;
    stocks: number;
    image: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IAssistanceRequest {
    _id?: string;
    user: Types.ObjectId;
    type: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedDate: Date;
    requestedTime: string;
    priority: 'normal' | 'urgent';
    address?: Types.ObjectId;
    volunteerType?: string;
    volunteer?: Types.ObjectId;
    createdAt?: Date;
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
    volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
    volunteer?: IUser;
    comment?: string;
    createdAt: string;
    updatedAt?: string;
}