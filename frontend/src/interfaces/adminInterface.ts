import { Types } from "mongoose";
import { IUser } from "./userInterface";

type statusType = 'approved' | 'rejected' | 'completed';
type requestType = 'volunteer' | 'ambulance';

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
    _id: string;
    type: requestType;
    description: string;
    status: statusType;
    requestedDate: string;
    requestedTime: string;
    priority: 'urgent' | 'normal';
    volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
    user?: {
        _id: string;
        name: string;
        phone: string;
        email: string;
        profilePicture: string;
    };
    volunteer?: {
        _id: string;
        name: string;
        phone: string;
        email: string;
        profilePicture: string;
    };
    address: {
        _id: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    createdAt: string;
    updatedAt?: string;
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