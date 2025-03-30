import { injectable } from "tsyringe";
import { BaseRepository } from "./base.repository";
import { IDonationRepository } from "../interfaces/IDonationRepository";
import Donation, { IDonation } from "../../models/donation.model";
import mongoose, { Document, Types } from "mongoose";

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

export interface IDonationResponse {
  _id: string;
  stripeSessionId: string;
  stripePaymentId: string;
  amount: number;
  campaign: string;
  message?: string;
  isAnonymous: boolean;
  userId?: Types.ObjectId | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class DonationRepository extends BaseRepository<IDonation> implements IDonationRepository {
  constructor() {
    super(Donation);
  }

  async createData(donationData: DonationCreateData): Promise<IDonation> {
    console.log('donation data: ', donationData)
    let userId = donationData.userId ?
      new mongoose.Types.ObjectId(donationData.userId) :
      null;

    return await Donation.create({
      ...donationData,
      userId: !donationData.isAnonymous ? userId : null,
    });
  }

  async findAll(query: any, skip: number, limit: number): Promise<IDonation[] | null> {
    return await Donation.find(query).skip(skip).limit(limit).sort({ date: -1 }).populate('userId');
  }

  async findByUserId(userId: string): Promise<IDonation[]> {
    return await Donation.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ date: -1 })
      .select('amount date status campaign');
  }

  async findRecentDonations(): Promise<IDonation[] | null> {
    return await Donation.find()
      .populate('userId')
      .sort({ createdAt: -1 })
      .limit(10);
  }

  async findByDonationId(donationId: string): Promise<IDonationResponse | null> {
    return await Donation.findOne({ _id: donationId })
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
      {
        $group: {
          _id: '$campaign',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async countDonations(query: object): Promise<number | null> {
    try {
      return this.count(query);
    } catch (error) {
      console.log('Error counting donations: ', error)
      return null;
    }
  }
}