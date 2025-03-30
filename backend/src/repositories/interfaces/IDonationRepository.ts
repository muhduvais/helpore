import { IDonation } from "../../models/donation.model";
import { DonationCreateData, IDonationResponse } from "../implementation/donation.repository";
import { IBaseRepository } from "./IBaseRepository";

export interface IDonationRepository extends IBaseRepository<IDonation> {
  createData(donationData: DonationCreateData): Promise<IDonation>;
  findAll(query: any, skip: number, limit: number): Promise<IDonation[] | null>;
  findByUserId(userId: string): Promise<any>;
  findBySessionId(sessionId: string): Promise<any>;
  findByDonationId(donationId: string): Promise<IDonationResponse | null>;
  countDonations(query: object): Promise<number | null>;
  findRecentDonations(): Promise<IDonation[] | null>;
}