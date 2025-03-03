import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IDonationController } from './interfaces/IDonationController';
import { IDonationService } from '../services/interfaces/ServiceInterface';

@injectable()
export class DonationController implements IDonationController {
    constructor(
        @inject('IDonationService') private readonly donationService: IDonationService,
    ) {
        this.createCheckoutSession = this.createCheckoutSession.bind(this);
        this.webhook = this.webhook.bind(this);
        this.fetchDontaionHistory = this.fetchDontaionHistory.bind(this);
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
      
      async webhook (req: Request, res: Response): Promise<void> {
        const sig = req.headers['stripe-signature'];
        
        try {
          const event = this.donationService.constructEvent(
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
      
      async fetchDontaionHistory (req: Request, res: Response): Promise<void> {
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
}