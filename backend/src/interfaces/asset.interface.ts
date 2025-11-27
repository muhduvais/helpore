import mongoose, { Document, Types } from "mongoose";

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

export interface IAddAsset {
  name: string;
  category: string;
  description: string;
  stocks: number;
  image: string;
}

export interface IUpdateAsset {
  name: string;
  category: string;
  description: string;
  stocks: number;
  image: string;
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