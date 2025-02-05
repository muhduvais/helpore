import OTP from '../models/otpModel';
import User from '../models/userModel';

class OtpRepository {
    async storeOtp(email: string, otp: string) {
        try {
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // valid for 5 minutes
            await OTP.create({ email, otp, expiresAt });
        } catch (error) {
            console.error('Error storing OTP:', error);
            throw new Error(error);
        }
    }

    async verifyOtp(email: string, otp: string) {
        try {
            const record = await OTP.findOne({ email, otp, expiresAt: { $gt: new Date() } });
            if (record) {
                await User.findOneAndUpdate({ email }, { isVerified: true });
            }
            return !!record; // Return true if record exists, otherwise false
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw new Error(error);
        }
    }
}

export default OtpRepository;
