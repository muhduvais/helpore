import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IDonationController } from './interfaces/IDonationController';
import { IDonationService } from '../services/interfaces/ServiceInterface';
import { IDonationRepository } from '../repositories/interfaces/IDonationRepository';

@injectable()
export class DonationController implements IDonationController {
  constructor(
    @inject('IDonationService') private readonly donationService: IDonationService,
    @inject('IDonationRepository') private readonly donationRepository: IDonationRepository,
  ) {
    this.createCheckoutSession = this.createCheckoutSession.bind(this);
    this.webhook = this.webhook.bind(this);
    this.fetchDontaionHistory = this.fetchDontaionHistory.bind(this);
    this.generateReceipt = this.generateReceipt.bind(this);
  }

  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { amount, campaign, message, isAnonymous } = req.body;
      const userId = req.user?.userId;

      const result = await this.donationService.createCheckoutSession({
        amount,
        campaign,
        message,
        isAnonymous,
        userId
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Checkout session error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async webhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'];

    try {
      const event = await this.donationService.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      const result = await this.donationService.handleWebhookEvent(event);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  };

  async fetchDontaionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await this.donationService.getUserDonationHistory(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async generateReceipt(req: Request, res: Response) {
    const { donationId } = req.params;

    try {
      const pdfBuffer = await this.donationService.generateAndSendReceipt(donationId);

      // Set response headers for PDF
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=donation_receipt_${donationId}.pdf`);

      // Send the PDF buffer
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Receipt generation error:', error);
      res.status(500).json({
        message: 'Error generating receipt',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}