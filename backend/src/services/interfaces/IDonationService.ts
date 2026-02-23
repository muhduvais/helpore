import { DonationDTO } from "../../dtos/donation.dto";

export interface IDonationService {
    createCheckoutSession(donationData: any): Promise<any>;
    verifySession(sessionId: string): Promise<any>;
    handleWebhookEvent(event: any): Promise<any>;
    getUserDonationHistory(userId: string): Promise<DonationDTO[]>;
    getRecentDonations(): Promise<DonationDTO[] | null>;
    constructEvent(payload: any, signature: any, secret: any): Promise<any>;
    generateAndSendReceipt(donationId: string, userId?: string): Promise<Buffer>;
    getAllDonations(page: number, limit: number, search: string, campaign: string): Promise<DonationDTO[] | null>;
    totalDonationsCount(search: string, campaign: string): Promise<number | null>;
}