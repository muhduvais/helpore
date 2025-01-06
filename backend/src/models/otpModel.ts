import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
}

const OTPSchema: Schema = new Schema({
    email: { 
        type: String, 
        required: true 
    },
    otp: { 
        type: String, 
        required: true
    },
    expiresAt: { 
        type: Date, 
        required: true 
    },
});

export default mongoose.model<IOTP>('OTP', OTPSchema);