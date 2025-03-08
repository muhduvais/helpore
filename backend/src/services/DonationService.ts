import { injectable, inject } from 'tsyringe';
import { BaseService } from './BaseService';
import { IDonationService } from './interfaces/ServiceInterface';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import dotenv from 'dotenv';
import { IDonation } from '../models/donationModel';
import { IDonationRepository } from '../repositories/interfaces/IDonationRepository';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAddressRepository } from '../repositories/interfaces/IAddressRepository';

dotenv.config();

@injectable()
export class DonationService extends BaseService<IDonation> implements IDonationService {
    constructor(
        @inject('IDonationRepository') private readonly donationRepository: IDonationRepository,
        @inject('IUserRepository') private readonly userRepository: IUserRepository,
        @inject('IAddressRepository') private readonly addressRepository: IAddressRepository,
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
            success_url: `${process.env.CLIENT_URL}/user/donations?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/user/donations?success=false`,
            metadata: {
                campaign,
                message: message || '',
                isAnonymous: isAnonymous.toString(),
                userId: userId,
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

    async handleWebhookEvent(event: any): Promise<any> {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            if (!session) {
                return { error: 'Session object is missing' };
            }

            await this.donationRepository.createData({
                stripeSessionId: session.id,
                stripePaymentId: session.payment_intent,
                amount: session.amount_total / 100,
                campaign: session.metadata?.campaign,
                message: session.metadata?.message,
                isAnonymous: session.metadata?.isAnonymous === 'true',
                userId: session.metadata?.userId,
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

    async generateAndSendReceipt(donationId: string): Promise<Buffer> {
        try {
          // Find the donation
          const donation = await this.donationRepository.findById(donationId);
          if (!donation) {
            throw new Error('Donation not found');
          }
    
          // Find user details if not anonymous
          let userDetails = null;
          if (donation.userId && !donation.isAnonymous) {
            const userId = String(donation.userId);
            userDetails = await this.userRepository.findById(userId);
    
            // Fetch address if available
            const address = await this.addressRepository.findAddressByEntityId(userId);
            if (userDetails && address) {
              userDetails = {
                ...userDetails.toObject(),
                address: address.toObject(),
              };
            }
          }
    
          // Create PDF document in memory
          const pdfBuffer = await this.createReceiptPDF(donation, userDetails);
          return pdfBuffer;
        } catch (error) {
          console.error('Receipt generation error:', error);
          throw new Error('Error generating receipt');
        }
      }
    
      /**
       * Create receipt PDF and return it as a buffer
       */
      private async createReceiptPDF(donation: any, userDetails: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
          const doc = new PDFDocument({ size: 'A4', margin: 50 });
          const buffers: Buffer[] = [];
    
          // Capture PDF data in memory
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.on('error', (err) => reject(err));
    
          // Add content to PDF
          this.addReceiptContent(doc, donation, userDetails);
    
          // Finalize PDF
          doc.end();
        });
      }
    
      /**
       * Add content to PDF document
       */
      private addReceiptContent(doc: PDFKit.PDFDocument, donation: any, userDetails: any) {
        const pageWidth = doc.page.width;
    
        // Title
        doc.fontSize(20)
          .font('Helvetica-Bold')
          .text('Donation Receipt', { align: 'center' })
          .moveDown();
    
        // Organization Details
        doc.fontSize(12)
          .text('Your Organization Name', { align: 'center' })
          .fontSize(10)
          .text('Organization Address', { align: 'center' })
          .text('Tax ID: XX-XXXXXXX', { align: 'center' })
          .moveDown();
    
        // Donation Details
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text('Donation Details', { align: 'center' });
    
        doc.fontSize(12)
          .font('Helvetica')
          .text(`Donation ID: ${donation._id}`, { align: 'center' })
          .text(`Date: ${donation.date.toLocaleDateString()}`, { align: 'center' })
          .text(`Amount: ₹${donation.amount.toFixed(2)}`, { align: 'center' })
          .text(`Campaign: ${donation.campaign}`, { align: 'center' })
          .text(`Status: ${donation.status}`, { align: 'center' })
          .moveDown();
    
        // Donor Information (if not anonymous)
        if (userDetails && !donation.isAnonymous) {
          doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('Donor Information', { align: 'center' });
    
          doc.fontSize(12)
            .font('Helvetica')
            .text(`Name: ${userDetails.name}`, { align: 'center' })
            .text(`Email: ${userDetails.email}`, { align: 'center' });
    
          if (userDetails.address) {
            doc.text(`Address: ${this.formatAddress(userDetails.address)}`, { align: 'center' });
          }
        } else {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Anonymous Donation', { align: 'center' });
        }
    
        // Optional Message
        if (donation.message) {
          doc.moveDown();
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Donor Message', { align: 'center' });
          doc.font('Helvetica')
            .text(donation.message, { align: 'center' });
        }
    
        // Tax Notice
        doc.moveDown(2);
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .text('Tax Deduction Notice', { align: 'center' })
          .font('Helvetica')
          .text('This receipt is for your records. Please consult your tax advisor.', 
              { align: 'center', width: pageWidth - 100 });
      }
    
      /**
       * Format address object into a single string
       */
      private formatAddress(address: any): string {
        const addressParts = [
          address.street,
          address.city,
          address.state,
          address.zipCode
        ].filter(Boolean);
        return addressParts.join(', ');
      }
}