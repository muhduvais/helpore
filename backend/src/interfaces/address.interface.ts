import { Document, Types } from "mongoose";

export interface IAddress {
    _id?: Types.ObjectId;
    fname: string;
    lname: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: number;
    entity?: Types.ObjectId;
    type?: string;
    latitude?: number;
    longitude?: number;
}

export interface IAddressDocument extends Document {
    _id: Types.ObjectId;
    fname: string;
    lname: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: number;
    entity?: Types.ObjectId;
    type?: string;
    latitude?: number;
    longitude?: number;
}