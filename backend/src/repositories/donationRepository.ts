import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { IDonationRepository } from "./interfaces/IDonationRepository";
import Donation, { IDonation } from "../models/donationModel";
import mongoose from "mongoose";

export interface DonationCreateData {
  stripeSessionId: string;
  stripePaymentId: string;
  amount: number;
  campaign: string;
  message?: string;
  isAnonymous: boolean;
  userId?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
}

@injectable()
export class DonationRepository extends BaseRepository<IDonation> implements IDonationRepository {
  constructor() {
    super(Donation);
  }

  async createData(donationData: DonationCreateData): Promise<IDonation> {
    let userId = donationData.userId ? 
      new mongoose.Types.ObjectId(donationData.userId) : 
      null;
    
    return await Donation.create({
      ...donationData,
      userId
    });
  }

  async findByUserId(userId: string): Promise<IDonation[]> {
    return await Donation.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ date: -1 })
      .select('amount date status campaign');
  }

  async findBySessionId(sessionId: string): Promise<IDonation | null> {
    return await Donation.findOne({ stripeSessionId: sessionId });
  }

  async findByCampaign(campaign: string, status?: string): Promise<IDonation[]> {
    const query: any = { campaign };
    if (status) {
      query.status = status;
    }
    
    return await Donation.find(query).sort({ date: -1 });
  }

  async getDonationStats(timeRange?: { start: Date, end: Date }): Promise<any> {
    const matchStage: any = {};
    
    if (timeRange) {
      matchStage.date = {
        $gte: timeRange.start,
        $lte: timeRange.end
      };
    }

    return await Donation.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      { $group: {
          _id: '$campaign',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
  }
}