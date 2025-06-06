import { IAssetRequest, IAssetRequestResponse } from "../../interfaces/user.interface";
import { IBaseRepository } from "./IBaseRepository";

export interface IAssetRequestRepository extends IBaseRepository<IAssetRequest> {
  createAssetRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<boolean>;
  findRequests(
    search: string,
    skip: number,
    userId: string,
    limit: number,
    sort: string,
    status: string,
  ): Promise<IAssetRequestResponse[] | null>
  findMyRequests(search: string, filter: string, userId: string, skip: number, limit: number): Promise<IAssetRequestResponse[] | null>
  findRequestDetails(userId: string, assetId: string): Promise<IAssetRequest[]>;
  countMyRequests(query: object): Promise<number>;
  countRequests(query: object): Promise<number>;
  updateStatus(requestId: string, status: string, comment: string): Promise<IAssetRequest | null>;
  findMyAllRequests(userId: string): Promise<IAssetRequest[] | null>;
}