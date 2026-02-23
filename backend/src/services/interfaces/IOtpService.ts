
export interface IOtpService {
    sendOtpEmail(email: string, otp: string): Promise<boolean>
}