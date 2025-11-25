import { injectable, inject } from 'tsyringe';
import { IAssetService } from '../interfaces/ServiceInterface';
import { IAsset } from '../../interfaces/asset.interface';
import { IAssetRepository } from '../../repositories/interfaces/IAssetRepository';
import { IAssetRequestRepository } from '../../repositories/interfaces/IAssetRequestRepository';
import { uploadToCloudinary } from '../../utils';
import { ErrorMessages } from '../../constants/errorMessages';
import { AssetDTO } from '../../dtos/asset.dto';
import { toAssetDTO, toAssetListDTO } from '../../mappers/asset.mapper';
import { AssetRequestDTO } from '../../dtos/asset-request.dto';
import { toAssetRequestDTO, toAssetRequestListDTO } from '../../mappers/assetRequest.mapper';
import { AddAssetRequestDTO } from '../../dtos/requests/addAsset-request.dto';

@injectable()
export class AssetService implements IAssetService {
    constructor(
        @inject('IAssetRepository') private readonly assetRepository: IAssetRepository,
        @inject('IAssetRequestRepository') private readonly assetRequestRepository: IAssetRequestRepository
    ) { }

    async addAsset(dto: AddAssetRequestDTO): Promise<AssetDTO> {
        try {
            const addedAsset = await this.assetRepository.addAsset(dto);
            return toAssetDTO(addedAsset);
        } catch (error: any) {
            console.error(ErrorMessages.ASSET_CREATE_FAILED, error);
            throw new Error(`${ErrorMessages.ASSET_CREATE_FAILED}: ${error.message}`);
        }
    }

    async uploadAssetImage(file: Express.Multer.File): Promise<string> {
        try {
            if (!file) {
                throw new Error(ErrorMessages.NO_IMAGE_UPLOADED);
            }

            const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);

            const results = await uploadToCloudinary(file, 'asset-images', uniqueId);

            const result = results[0];

            console.log('Cloudinary upload successful:', result.secure_url);

            return result.secure_url;
        } catch (error) {
            console.error(ErrorMessages.ASSET_UPLOAD_IMAGE_FAILED, error);
            throw new Error(`${ErrorMessages.ASSET_UPLOAD_IMAGE_FAILED}: ${error instanceof Error ? error.message : error}`);
        }
    }

    async fetchAssets(search: string, skip: number, limit: number, sortBy: string, filterByAvailability: string): Promise<AssetDTO[] | null> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' } } : {};

            if (filterByAvailability && filterByAvailability !== 'all') {
                let availabilityQuery: {};
                switch (filterByAvailability) {
                    case 'available':
                        availabilityQuery = { 'stocks': { $gt: 0 } };
                        break;
                    case 'limited':
                        availabilityQuery = { 'stocks': { $gt: 0, $lte: 3 } };
                        break;
                    case 'unavailable':
                        availabilityQuery = { 'stocks': 0 };
                        break;
                    default:
                        availabilityQuery = {};
                        break;
                }
                Object.assign(query, availabilityQuery);
            }

            let sortQuery: Record<string, 1 | -1> = {};
            if (sortBy) {
                if (sortBy === 'name') {
                    sortQuery = { name: 1 };
                } else if (sortBy === '-name') {
                    sortQuery = { name: -1 };
                } else if (sortBy === 'stocks') {
                    sortQuery = { 'stocks': 1 };
                } else if (sortBy === '-stocks') {
                    sortQuery = { 'stocks': -1 };
                } else if (sortBy === 'createdAt') {
                    sortQuery = { createdAt: 1 };
                } else if (sortBy === '-createdAt') {
                    sortQuery = { createdAt: -1 };
                }
            }

            const assets = await this.assetRepository.findAssets(query, skip, limit, sortQuery);
            if (!assets) {
                return null;
            }
            return toAssetListDTO(assets);
        } catch (error) {
            console.error('Error finding the assets:', error);
            return null;
        }
    }

    async fetchAssetDetails(assetId: string): Promise<AssetDTO | null> {
        try {
            const asset = await this.assetRepository.findAssetDetails(assetId);
            if (!asset) {
                return null;
            }
            return toAssetDTO(asset);
        } catch (error) {
            console.error('Error fetching the asset details: ', error);
            return null;
        }
    }

    async updateAsset(assetId: string, submitData: any): Promise<IAsset | null> {
        try {
            return await this.assetRepository.updateById(assetId, submitData);
        } catch (error) {
            console.error('Error updating the asset: ', error);
            return null;
        }
    }

    async countAssets(search: string): Promise<number> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' } } : {};
            return await this.assetRepository.countAssets(query);
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }

    async createRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<any> {
        try {
            await this.assetRequestRepository.createAssetRequest(assetId, userId, requestedDate, quantity);
            return true;
        } catch (error) {
            console.error('Error creating the request: ', error);
            return false;
        }
    }

    async countRequests(
        search: string,
        status: string,
    ): Promise<number> {
        try {
            let query: any = {};

            if (search) {
                query["asset.name"] = { $regex: search, $options: "i" };
            }

            if (status && status !== 'all') {
                query.status = status;
            }

            return await this.assetRequestRepository.countRequests(query);
        } catch (error) {
            console.error('Error counting the asset requests:', error);
            return 0;
        }
    }

    async fetchAssetRequests(
        search: string,
        skip: number,
        limit: number,
        userId: string,
        sort: string,
        status: string,
    ): Promise<AssetRequestDTO[] | null> {
        try {
            const assetRequests = await this.assetRequestRepository.findRequests(search, skip, userId, limit, sort, status);
            if (!assetRequests) {
                return null;
            }
            return toAssetRequestListDTO(assetRequests);
        } catch (error) {
            console.error("Error fetching asset requests:", error);
            return null;
        }
    }

    async fetchMyAssetRequests(search: string, filter: string, skip: number, limit: number, userId: string): Promise<AssetRequestDTO[] | null> {
        try {
            const assetRequests = await this.assetRequestRepository.findMyRequests(search, filter, userId, skip, limit);
            if (!assetRequests) {
                return null;
            }
            return toAssetRequestListDTO(assetRequests);
        } catch (error) {
            console.error('Error finding the asset requests:', error);
            return null;
        }
    }

    async checkIsRequestLimit(userId: string, quantity: number): Promise<boolean | null> {
        try {
            const assetRequests = await this.assetRequestRepository.findMyAllRequests(userId);
            if (!assetRequests) return null;
            const count = assetRequests.reduce((accu, request) => {
                const quantity = Number(request.quantity) || 0;
                return accu + quantity;
            }, 0);
            return (count + quantity) > 3;
        } catch (error) {
            console.error('Error finding the asset requests:', error);
            return null;
        }
    }

    async countMyAssetRequests(userId: string, search: string, filter: string): Promise<number | null> {
        try {
            let query: any = {};

            if (search) {
                query["asset.name"] = { $regex: search, $options: "i" };
            }

            if (filter && filter !== 'all') {
                query.status = filter;
            }

            query.user = userId;

            return await this.assetRequestRepository.countMyRequests(query);
        } catch (error) {
            console.error('Error counting the asset requests:', error);
            return null;
        }
    }

    async findRequestDetails(userId: string, assetId: string): Promise<AssetRequestDTO | null> {
        try {
            const assetRequest = await this.assetRequestRepository.findRequestDetails(userId, assetId);
            if (!assetRequest) {
                return null;
            }
            return toAssetRequestDTO(assetRequest);
        } catch (error) {
            console.error('Error fetching the asset request details: ', error);
            return null;
        }
    }

    async updateStatus(requestId: string, status: string, comment: string) {
        try {
            const updatedRequest = await this.assetRequestRepository.updateStatus(requestId, status, comment);

            return updatedRequest;
        } catch (error) {
            console.error('Error updating asset request status in service:', error);
            throw error;
        }
    }
}