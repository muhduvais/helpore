import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IDonationController } from '../interfaces/IDonationController';
import { IDonationService } from '../../services/interfaces/ServiceInterface';
import { createObjectCsvStringifier } from 'csv-writer';

@injectable()
export class DonationController implements IDonationController {
  constructor(
    @inject('IDonationService') private readonly donationService: IDonationService,
  ) {
    this.createCheckoutSession = this.createCheckoutSession.bind(this);
    this.webhook = this.webhook.bind(this);
    this.fetchDontaionHistory = this.fetchDontaionHistory.bind(this);
    this.generateReceipt = this.generateReceipt.bind(this);
    this.getDonations = this.getDonations.bind(this);
    this.exportDonations = this.exportDonations.bind(this);
    this.getRecentDonations = this.getRecentDonations.bind(this);
    // this.fechAllDonations = this.fechAllDonations.bind(this);
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
    } catch (error: any) {
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
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  };

  async fetchDontaionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await this.donationService.getUserDonationHistory(userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  async generateReceipt(req: Request, res: Response): Promise<void> {
    const { donationId } = req.params;
    const userId = !req.query.userId && req.user?.role !== 'admin' ? req.user?.userId : req.query.userId as string;
    try {
      if (!userId) {
        res.status(400).json({ message: 'Invalid userId!' });
        return;
      }
      const pdfBuffer = await this.donationService.generateAndSendReceipt(donationId, userId);

      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=donation_receipt_${donationId}.pdf`);
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Receipt generation error:', error);
      res.status(500).json({
        message: 'Error generating receipt',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDonations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = req.query.search as string;
      const filter = req.query.filter as string;
      
      const donations = await this.donationService.getAllDonations(
        page,
        10,
        search,
        filter
      );

      const documentsCount = await this.donationService.totalDonationsCount(search, filter) || 0;

      res.status(200).json({
        donations: donations,
        totalPages: Math.ceil(documentsCount / 10),
        totalItems: documentsCount,
      });
    } catch (error) {
      console.error('Error in getDonations controller:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  async getRecentDonations(req: Request, res: Response): Promise<void> {
    try {
      const donations = await this.donationService.getRecentDonations();

      res.status(200).json({
        donations: donations,
      });
    } catch (error) {
      console.error('Error in getRecentDonations controller:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  async exportDonations(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string;
      const filter = req.query.filter as string;
  
      const donations = await this.donationService.getAllDonations(
        1,
        1000,
        search,
        filter,
      ) || [];
  
      // CSV stringifier
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: 'date', title: 'Date' },
          { id: 'stripePaymentId', title: 'Payment ID' },
          { id: 'amount', title: 'Amount' },
          { id: 'campaign', title: 'Campaign' },
          { id: 'donor', title: 'Donor' },
          { id: 'message', title: 'Message' },
          { id: 'status', title: 'Status' }
        ]
      });
  
      const donationsForCsv = donations.map(donation => ({
        date: new Date(donation.date).toLocaleDateString(),
        stripePaymentId: donation.stripePaymentId,
        amount: `$${donation.amount.toFixed(2)}`,
        campaign: donation.campaign,
        donor: donation.isAnonymous || !donation.userId ? 'Anonymous' : donation.userId,
        message: donation.message || '',
        status: donation.status
      }));
  
      const csvHeader = csvStringifier.getHeaderString();
      const csvBody = csvStringifier.stringifyRecords(donationsForCsv);
      const csvContent = csvHeader + csvBody;
  
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=donations_${new Date().toISOString().split('T')[0]}.csv`);
      
      res.status(200).send(csvContent);
    } catch (error) {
      console.error('Error in exportDonations controller:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}