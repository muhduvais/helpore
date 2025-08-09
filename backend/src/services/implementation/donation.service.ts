import { injectable, inject } from 'tsyringe';
import { BaseService } from './base.service';
import { IDonationService } from '../interfaces/ServiceInterface';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import dotenv from 'dotenv';
import { IDonation } from '../../models/donation.model';
import { IDonationRepository } from '../../repositories/interfaces/IDonationRepository';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IAddressRepository } from '../../repositories/interfaces/IAddressRepository';
import { IAddress, IUser } from '../../interfaces/user.interface';
import { ErrorMessages } from '../../constants/errorMessages';

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
    try {
      const { amount, campaign, message, isAnonymous, userId } = donationData;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: campaign === 'general' ? 'General Donation' : `${campaign} Campaign Donation`,
                description: ErrorMessages.DONATION_THANK_YOU,
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
    } catch (error) {
      console.error(ErrorMessages.DONATION_CHECKOUT_FAILED, error);
      throw new Error(ErrorMessages.DONATION_CHECKOUT_FAILED);
    }
  }

  async verifySession(sessionId: string): Promise<any> {
    if (!sessionId) {
      throw new Error(ErrorMessages.DONATION_SESSION_ID_REQUIRED);
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return {
        verified: true,
        status: session.payment_status
      };
    } catch (error) {
      console.error(ErrorMessages.DONATION_SESSION_VERIFY_FAILED, error);
      throw new Error(ErrorMessages.DONATION_SESSION_VERIFY_FAILED);
    }
  }

  async handleWebhookEvent(event: any): Promise<any> {
    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        if (!session) {
          return { error: ErrorMessages.DONATION_SESSION_OBJECT_MISSING };
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
    } catch (error) {
      console.error(ErrorMessages.DONATION_WEBHOOK_FAILED, error);
      throw new Error(ErrorMessages.DONATION_WEBHOOK_FAILED);
    }
  }

  async getUserDonationHistory(userId: string): Promise<any> {
    if (!userId) {
      throw new Error(ErrorMessages.INVALID_USER_ID);
    }

    try {
      const donations = await this.donationRepository.findByUserId(userId);
      return { donations };
    } catch (error) {
      console.error(ErrorMessages.DONATION_HISTORY_FAILED, error);
      throw new Error(ErrorMessages.DONATION_HISTORY_FAILED);
    }
  }

  async getAllDonations(page: number, limit: number, search: string, campaign: string): Promise<IDonation[] | null> {
    try {
      let skip = (page - 1) * limit;
      let query: any = {};
      if (search) {
        query.$or = [
          { stripePaymentId: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } }
        ];
      }
      if (campaign && campaign !== 'all') {
        query.campaign = campaign;
      }
      const donations = await this.donationRepository.findAll(query, skip, limit);
      return donations;
    } catch (error) {
      console.error(ErrorMessages.DONATION_FETCH_FAILED, error);
      throw new Error(ErrorMessages.DONATION_FETCH_FAILED);
    }
  }

  async getRecentDonations(): Promise<IDonation[] | null> {
    try {
      const donations = await this.donationRepository.findRecentDonations();
      return donations;
    } catch (error) {
      console.error(ErrorMessages.DONATION_FETCH_FAILED, error);
      throw new Error(ErrorMessages.DONATION_FETCH_FAILED);
    }
  }

  async totalDonationsCount(search: string, campaign: string): Promise<number | null> {
    try {
      const query: any = {};
      if (search) {
        query.stripePaymentId = { $regex: search, $options: "i" };
      }
      if (campaign && campaign !== 'all') {
        query.campaign = campaign;
      }
      return await this.donationRepository.countDonations(query);
    } catch (error) {
      console.error(ErrorMessages.DONATION_COUNT_FAILED, error);
      throw new Error(ErrorMessages.DONATION_COUNT_FAILED);
    }
  }

  async constructEvent(payload: any, signature: any, secret: any): Promise<any> {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error(ErrorMessages.DONATION_WEBHOOK_FAILED, error);
      throw new Error(ErrorMessages.DONATION_WEBHOOK_FAILED);
    }
  }

  async generateAndSendReceipt(donationId: string, userId: string): Promise<Buffer> {
    try {
      const donation = await this.donationRepository.findById(donationId);
      const userDetails = await this.userRepository.findById(userId);
      const addressDetailsResponse = await this.addressRepository.findAddressesByEntityId(userId);
      const addressDetails = addressDetailsResponse[0];
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Donation Receipt ${donation?._id}`,
            Author: 'HelpOre',
            Subject: 'Donation Receipt',
            Keywords: 'donation, receipt, charity'
          }
        });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => {
          console.error(ErrorMessages.DONATION_RECEIPT_FAILED, err);
          reject(new Error(ErrorMessages.DONATION_RECEIPT_FAILED));
        });

        this.addReceiptContent(doc, donation, userDetails, addressDetails);

        doc.end();
      });
    } catch (error) {
      console.error(ErrorMessages.DONATION_RECEIPT_FAILED, error);
      throw new Error(ErrorMessages.DONATION_RECEIPT_FAILED);
    }
  }

  private addReceiptContent(doc: PDFKit.PDFDocument, donation: any, userDetails: any, addressDetails: IAddress) {
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 100;
    const primaryColor = '#688D48';
    const secondaryColor = '#F5F5F5';
    const accentColor = '#FF6600';

    this.addHeader(doc, primaryColor);
    this.addReceiptInfoBox(doc, donation, secondaryColor, primaryColor);
    this.addDonationDetails(doc, donation, contentWidth, primaryColor);
    this.addDonorInformation(doc, donation, userDetails, addressDetails, contentWidth, primaryColor);
    if (donation.message) {
      this.addDonorMessage(doc, donation.message, contentWidth, primaryColor);
    }
    this.addTaxInformation(doc, contentWidth, accentColor);
    this.addFooter(doc, pageWidth);
  }

  private addHeader(doc: PDFKit.PDFDocument, primaryColor: string) {
    const pageWidth = doc.page.width;

    // doc.image('path/to/your/image.jpg', 50, 50, {
    //   width: 100,
    //   height: 60
    // });

    doc.rect(50, 50, 100, 60)
      .lineWidth(1)
      .stroke(primaryColor);

    doc.fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('HelpOre', 170, 50)
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#444444')
      .text('Making a difference since 2024', 170, 70)
      .text('123 Charity Lane, Kottakkal', 170, 85)
      .text('contact@helpore.org | (974) 648-3041', 170, 100);

    // Line separating header
    doc.moveTo(50, 130)
      .lineTo(pageWidth - 50, 130)
      .lineWidth(2)
      .stroke(primaryColor);

    doc.moveDown(2);
  }

  private addReceiptInfoBox(doc: PDFKit.PDFDocument, donation: any, bgColor: string, textColor: string) {
    const pageWidth = doc.page.width;
    const boxWidth = pageWidth - 100;

    // Receipt title
    doc.fontSize(22)
      .font('Helvetica-Bold')
      .fillColor(textColor)
      .text('DONATION RECEIPT', 50, 150, { align: 'center' });

    // Receipt number and date
    doc.rect(50, 180, boxWidth, 50)
      .fillAndStroke(bgColor, textColor);

    // Receipt information inside box
    doc.fillColor(textColor)
      .fontSize(12)
      .text('Receipt ID:', 70, 190)
      .font('Helvetica')
      .fillColor('#333333')
      .text(donation._id, 140, 190);

    // Date formatting
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formattedDate = new Date(donation.date).toLocaleDateString('en-US', dateOptions);

    doc.font('Helvetica-Bold')
      .fillColor(textColor)
      .text('Date:', 300, 190)
      .font('Helvetica')
      .fillColor('#333333')
      .text(formattedDate, 340, 190);

    doc.moveDown(3);
  }

  private addDonationDetails(doc: PDFKit.PDFDocument, donation: any, contentWidth: number, primaryColor: string) {
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Donation Details', 50, 250);

    // Underline
    doc.moveTo(50, 270)
      .lineTo(200, 270)
      .lineWidth(1)
      .stroke(primaryColor);

    doc.moveDown();

    // Donation details - table layout
    const startY = 290;
    const lineHeight = 25;
    const leftColumnX = 50;
    const rightColumnX = 200 - 150;

    // Row 1 - Amount
    doc.font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#333333')
      .text('Amount:', leftColumnX, startY);

    doc.font('Helvetica')
      .fontSize(11)
      .text(`Rs: ${donation.amount.toFixed(2)}`, rightColumnX, startY, { align: 'right' });

    // Row 2 - Campaign
    doc.font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#333333')
      .text('Campaign:', leftColumnX, startY + lineHeight);

    doc.font('Helvetica')
      .fontSize(11)
      .text(this.capitalizeFirstLetter(donation.campaign), rightColumnX, startY + lineHeight, { align: 'right' });

    // Row 3 - Status
    doc.font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#333333')
      .text('Status:', leftColumnX, startY + lineHeight * 2);

    doc.font('Helvetica')
      .fontSize(11)
      .text(this.capitalizeFirstLetter(donation.status), rightColumnX, startY + lineHeight * 2, { align: 'right' });

    doc.moveDown(4);
  }

  // Donor information section with table layout
  private addDonorInformation(doc: PDFKit.PDFDocument, donation: any, userDetails: any, addressDetails: any, contentWidth: number, primaryColor: string) {
    const startY = 390;
    const pageWidth = doc.page.width;
    const leftColumnX = 50;
    const rightColumnX = pageWidth - 150;
    const lineHeight = 20;

    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Donor Information', 50, startY);

    // Underline
    doc.moveTo(50, startY + 20)
      .lineTo(200, startY + 20)
      .lineWidth(1)
      .stroke(primaryColor);

    doc.moveDown();

    if (userDetails && !donation.isAnonymous) {
      const infoStartY = startY + 40;

      // Name row
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#333333')
        .text('Name:', leftColumnX, infoStartY);

      doc.font('Helvetica')
        .text(userDetails.name, rightColumnX, infoStartY, { align: 'right' });

      // Email row
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#333333')
        .text('Email:', leftColumnX, infoStartY + lineHeight);

      doc.font('Helvetica')
        .text(userDetails.email, rightColumnX, infoStartY + lineHeight, { align: 'right' });

      // Address row
      if (addressDetails) {
        doc.font('Helvetica-Bold')
          .text('Address:', leftColumnX, infoStartY + lineHeight * 2);

        doc.font('Helvetica')
          .text(this.formatAddress(addressDetails), rightColumnX, infoStartY + lineHeight * 2, {
            align: 'right'
          });
      }
    } else {
      // Anonymous donation
      doc.font('Helvetica')
        .fontSize(11)
        .text('This donation was made anonymously.', 50, startY + 40, {
          width: contentWidth,
          align: 'left'
        });
    }

    doc.moveDown(2);
  }

  // Donor message
  private addDonorMessage(doc: PDFKit.PDFDocument, message: string, contentWidth: number, primaryColor: string) {
    const startY = doc.y;

    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Donor Message', 50, startY);

    // Underline
    doc.moveTo(50, startY + 20)
      .lineTo(200, startY + 20)
      .lineWidth(1)
      .stroke(primaryColor);

    // Message box with quote styling
    doc.rect(50, startY + 40, contentWidth, 80)
      .fillAndStroke('#F9F9F9', '#DDDDDD');

    doc.fontSize(11)
      .font('Helvetica-Oblique')
      .fillColor('#333333')
      .text(`"${message}"`, 60, startY + 50, {
        width: contentWidth - 20,
        align: 'left'
      });

    doc.moveDown(6);
  }

  // Tax information section
  private addTaxInformation(doc: PDFKit.PDFDocument, contentWidth: number, accentColor: string) {
    const startY = doc.y;

    // Tax notice box
    doc.rect(50, startY, contentWidth, 70)
      .fillAndStroke('#FFF8F0', accentColor);

    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(accentColor)
      .text('Tax Deduction Information', 70, startY + 15, { align: 'left' });

    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#333333')
      .text('This receipt is an official record of your donation. Please retain for tax purposes. No goods or services were provided in exchange for this contribution. Your donation may be tax-deductible to the extent allowed by law. Tax ID:  TX-GTD67D687D',
        70, startY + 35, {
        width: contentWidth - 40,
        align: 'left'
      });
  }

  // Footer
  private addFooter(doc: PDFKit.PDFDocument, pageWidth: number) {
    const footerY = doc.page.height - 50;

    // Footer line
    doc.moveTo(50, footerY - 20)
      .lineTo(pageWidth - 50, footerY - 20)
      .lineWidth(1)
      .stroke('#CCCCCC');

    // Footer text
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#888888')
      .text('HelpOre • www.helpore.org • Tax ID: TX-GTD67D687D', 50, footerY, {
        align: 'center',
        width: pageWidth - 100
      });
  }

  // Address object formatting
  private formatAddress(address: any): string {
    const addressParts = [
      address.street,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean);
    return addressParts.join(', ');
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}