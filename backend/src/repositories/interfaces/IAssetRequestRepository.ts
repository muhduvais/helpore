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
  ): Promise<IAssetRequest[] | null>
  findMyRequests(search: string, filter: string, userId: string, skip: number, limit: number): Promise<IAssetRequest[] | null>
  findRequestDetails(userId: string, assetId: string): Promise<IAssetRequest | null>;
  countMyRequests(query: object): Promise<number>;
  countRequests(query: object): Promise<number>;
  updateStatus(requestId: string, status: string, comment: string): Promise<IAssetRequest | null>;
  findMyAllRequests(userId: string): Promise<IAssetRequest[] | null>;
}