import { AssetRequestDTO } from "../../dtos/asset-request.dto";
import { AssetDTO } from "../../dtos/asset.dto";
import { AddAssetRequestDTO } from "../../dtos/requests/addAsset-request.dto";

export interface IAssetService {
    addAsset(dto: AddAssetRequestDTO): Promise<AssetDTO | null>;
    uploadAssetImage(file: Express.Multer.File): Promise<string>;
    fetchAssets(search: string, skip: number, limit: number, sortBy: string, filterByAvailability: string): Promise<AssetDTO[] | null>;
    fetchAssetDetails(assetId: string): Promise<AssetDTO | null>;
    updateAsset(assetId: string, submitData: any): Promise<AssetDTO | null>;
    countAssets(search: string): Promise<number>;
    createRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<boolean>;
    countRequests(userId: string, search: string): Promise<number>;
    fetchAssetRequests(
        search: string,
        skip: number,
        limit: number,
        userId: string,
        sort: string,
        status: string,
    ): Promise<AssetRequestDTO[] | null>;
    fetchMyAssetRequests(search: string, filter: string, skip: number, limit: number, userId: string): Promise<AssetRequestDTO[] | null>;
    countMyAssetRequests(userId: string, search: string, filter: string): Promise<number | null>;
    findRequestDetails(userId: string, assetId: string): Promise<AssetRequestDTO | null>
    updateStatus(requestId: string, status: string, comment: string): Promise<any>;
    checkIsRequestLimit(userId: string, quantity: number): Promise<boolean | null>;
}