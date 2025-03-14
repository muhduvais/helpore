import { injectable } from 'tsyringe';
import OTP from '../../models/otp.model';
import User from '../../models/user.model';
import { IOtpRepository } from '../interfaces/IOtpRepository';

@injectable()
export class OtpRepository implements IOtpRepository {
    async storeOtp(email: string, otp: string) {
        try {
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
            await OTP.create({ email, otp, expiresAt });
        } catch (error) {
            console.error('Error storing OTP:', error);
            throw new Error('Failed to store OTP');
        }
    }

    async verifyOtp(email: string, otp: string) {
        try {
            const record = await OTP.findOne({ email, otp, expiresAt: { $gt: new Date() } });
            if (record) {
                await User.findOneAndUpdate({ email }, { isVerified: true });
            }
            return !!record; // OTP record exists or not
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw new Error('Failed to verify OTP');
        }
    }
}
