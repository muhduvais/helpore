import { IDonation } from "../../models/donationModel";
import { DonationCreateData, IDonationResponse } from "../donationRepository";
import { IBaseRepository } from "./IBaseRepository";

export interface IDonationRepository extends IBaseRepository<IDonation> {
  createData(donationData: DonationCreateData): Promise<IDonation>;
  findAll(query: any, skip: number, limit: number): Promise<IDonation[] | null>;
  findByUserId(userId: string): Promise<any>;
  findBySessionId(sessionId: string): Promise<any>;
  findByDonationId(donationId: string): Promise<IDonationResponse>;
  countDonations(query: object): Promise<number | null>;
}