import mongoose, { Document, Types } from "mongoose";
import { IAddressDocument } from "./address.interface";

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
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAsset extends Document {
  _id: Types.ObjectId;
  name?: string;
  category?: string;
  description?: string;
  stocks?: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetRequest extends Document {
  _id: Types.ObjectId;
  asset: Types.ObjectId;
  user: Types.ObjectId;
  status: string;
  requestedDate: Date;
  quantity: Number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssistanceRequest {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: "volunteer" | "ambulance";
  description?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedDate: Date;
  requestedTime: string;
  priority: "urgent" | "normal";
  address?: IAddressDocument;
  volunteerType?:
    | "medical"
    | "eldercare"
    | "maintenance"
    | "transportation"
    | "general";
  volunteer?: Types.ObjectId | string;
  rejectedBy?: [string];
}

export interface IAssistanceRequestDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | string;
  type: "volunteer" | "ambulance";
  description?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedDate: Date;
  requestedTime: string;
  priority: "urgent" | "normal";
  address?: Types.ObjectId | IAddressDocument;
  volunteerType?:
    | "medical"
    | "eldercare"
    | "maintenance"
    | "transportation"
    | "general";
  volunteer?: Types.ObjectId | string;
  rejectedBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssistanceRequestResponse {
  _id: string;
  user: Types.ObjectId;
  type: "volunteer" | "ambulance";
  description?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedDate: string;
  requestedTime: string;
  priority: "urgent" | "normal";
  address?: Types.ObjectId;
  useDefaultAddress: boolean;
  volunteerType?:
    | "medical"
    | "eldercare"
    | "maintenance"
    | "transportation"
    | "general";
  volunteer?: Types.ObjectId | IUser;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAssistanceRequestPopulated extends Omit<IAssistanceRequest, 'user' | 'volunteer' | 'address'> {
  user: {
    _id: Types.ObjectId;
    name: string;
    phone?: string;
    email: string;
    profilePicture?: string;
  };

  volunteer?: {
    _id: Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
  };

  address?: {
    id: Types.ObjectId;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface IAssetRequestResponse {
  _id: string;
  asset: IAsset;
  requestedDate: string;
  quantity: number;
  status: "pending" | "approved" | "rejected";
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetRequestDocument {
  _id: mongoose.Types.ObjectId;
  asset:
    | mongoose.Types.ObjectId
    | {
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
  status: "pending" | "approved" | "rejected";
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
  status: "pending" | "approved" | "rejected";
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  userId: string;
}
