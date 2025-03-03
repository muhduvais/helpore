import { IDonation } from "../../models/donationModel";
import { DonationCreateData } from "../donationRepository";
import { IBaseRepository } from "./IBaseRepository";

export interface IDonationRepository extends IBaseRepository<IDonation> {
  createData(donationData: DonationCreateData): Promise<IDonation>;
  findByUserId(userId: string): Promise<any>;
  findBySessionId(sessionId: string): Promise<any>;
}