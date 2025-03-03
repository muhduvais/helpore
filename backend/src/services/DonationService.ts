import { injectable, inject } from 'tsyringe';
import { BaseService } from './BaseService';
import { IDonationService } from './interfaces/ServiceInterface';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import dotenv from 'dotenv';
import { IDonation } from '../models/donationModel';
import { IDonationRepository } from '../repositories/interfaces/IDonationRepository';

dotenv.config();

@injectable()
export class DonationService extends BaseService<IDonation> implements IDonationService {
    constructor(
        @inject('IDonationRepository') private readonly donationRepository: IDonationRepository,
    ) {
        super(donationRepository);
    }

    async createCheckoutSession(donationData: any): Promise<any> {
        const { amount, campaign, message, isAnonymous, userId } = donationData;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: campaign === 'general' ? 'General Donation' : `${campaign} Campaign Donation`,
                            description: 'Thank you for your generosity',
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}`,
            cancel_url: `${process.env.FRONTEND_URL}`,
            metadata: {
                campaign,
                message: message || '',
                isAnonymous: isAnonymous.toString(),
                userId: userId || 'anonymous'
            },
        });

        return {
            sessionId: session.id,
            checkoutUrl: session.url
        };
    }

    async verifySession(sessionId: string): Promise<any> {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return {
            verified: true,
            status: session.payment_status
        };
    }

    async handleWebhookEvent(event): Promise<any> {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            await this.donationRepository.createData({
                stripeSessionId: session.id,
                stripePaymentId: session.payment_intent,
                amount: session.amount_total / 100,
                campaign: session.metadata.campaign,
                message: session.metadata.message,
                isAnonymous: session.metadata.isAnonymous === 'true',
                userId: session.metadata.userId !== 'anonymous' ? session.metadata.userId : null,
                status: 'completed',
                date: new Date()
            });
        }

        return { received: true };
    }

    async getUserDonationHistory(userId: string): Promise<any> {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const donations = await this.donationRepository.findByUserId(userId);
        return { donations };
    }

    async constructEvent(payload: any, signature: any, secret: any): Promise<any> {
        return stripe.webhooks.constructEvent(payload, signature, secret);
    }

}