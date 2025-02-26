export interface IOtpRepository {
    storeOtp(email: string, otp: string): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
}