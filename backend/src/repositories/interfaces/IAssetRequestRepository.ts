import { IAssetRequest, IAssetRequestResponse } from "../../interfaces/userInterface";
import { IBaseRepository } from "./IBaseRepository";

export interface IAssetRequestRepository extends IBaseRepository<IAssetRequest> {
  createAssetRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<boolean>;
  findRequests(search: string,
    skip: number,
    userId: string,
    limit: number,
    sort: string,
    status: string): Promise<IAssetRequestResponse[]>;
  findRequestDetails(userId: string, assetId: string): Promise<IAssetRequest[]>;
  countRequests(query: object): Promise<number>;
  updateStatus(requestId: string, status: string, comment: string): Promise<IAssetRequest>;
}