import { injectable } from 'tsyringe';
import crypto from 'crypto';
import { IMeetingService } from '../interfaces/ServiceInterface';

@injectable()
export class MeetingService implements IMeetingService {
    private appId: number;
    private serverSecret: string;

    constructor(appId: number, serverSecret: string) {
        this.appId = appId;
        this.serverSecret = serverSecret;
    }

    async generateToken(
        userId: string,
        roomId: string,
        userName: string
    ): Promise<string> {
        const timestamp = Math.floor(Date.now() / 1000);

        const nonce = this.generateNonce();

        const payload = JSON.stringify({
            app_id: this.appId,
            user_id: userId,
            room_id: roomId,
            user_name: userName,
            timestamp: timestamp,
            nonce: nonce,
            expire: timestamp + 3600
        });

        const signature = this.generateSignature(payload);

        return this.encodeToken(payload, signature);
    }

    private generateNonce(length: number = 16): string {
        return crypto.randomBytes(length).toString('hex');
    }

    private generateSignature(payload: string): string {
        const hmac = crypto.createHmac('sha256', this.serverSecret);
        hmac.update(payload);
        return hmac.digest('hex');
    }

    private encodeToken(payload: string, signature: string): string {
        const encodedPayload = Buffer.from(payload).toString('base64');
        const encodedSignature = Buffer.from(signature).toString('base64');

        return `${encodedPayload}.${encodedSignature}`;
    }

    async verifyToken(token: string): Promise<boolean> {
        try {
            const [encodedPayload, encodedSignature] = token.split('.');

            const payload = JSON.parse(
                Buffer.from(encodedPayload, 'base64').toString('utf-8')
            );

            const signature = Buffer.from(encodedSignature, 'base64').toString('utf-8');

            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.expire < currentTime) {
                return false;
            }

            const regeneratedSignature = this.generateSignature(
                JSON.stringify(payload)
            );

            return signature === regeneratedSignature;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }
}