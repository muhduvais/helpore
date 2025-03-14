import { injectable, inject } from 'tsyringe';
import { BaseService } from './base.service';
import { IAssetService } from '../interfaces/ServiceInterface';
import { IAsset, IAssetRequestResponse } from '../../interfaces/user.interface';
import cloudinary from 'cloudinary';
import { IAssetRepository } from '../../repositories/interfaces/IAssetRepository';
import { IAssetRequestRepository } from '../../repositories/interfaces/IAssetRequestRepository';
import { uploadToCloudinary } from '../../utils';

@injectable()
export class AssetService extends BaseService<IAsset> implements IAssetService {
    constructor(
        @inject('IAssetRepository') private readonly assetRepository: IAssetRepository,
        @inject('IAssetRequestRepository') private readonly assetRequestRepository: IAssetRequestRepository
    ) {
        super(assetRepository);
    }

    async addAsset(data: IAsset): Promise<any> {
        try {
            return await this.assetRepository.addAsset(data);
        } catch (error) {
            console.error("Database error while adding asset:", error);
            throw new Error(`Error adding asset: ${error.message}`);
        }
    }

    async uploadAssetImage(file: Express.Multer.File): Promise<string> {
        try {
            if (!file) {
                throw new Error('No file provided');
            }

            const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);

            const result = await uploadToCloudinary(file, 'asset-images', uniqueId);

            console.log('Cloudinary upload successful:', result.secure_url);

            return result.secure_url;
        } catch (error) {
            console.error('Error in uploadAssetImage service:', error);
            throw error;
        }
    }

    async fetchAssets(search: string, skip: number, limit: number, sortBy: string, filterByAvailability: string): Promise<IAsset[] | null> {
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

            return await this.assetRepository.findAssets(query, skip, limit, sortQuery);
        } catch (error) {
            console.error('Error finding the assets:', error);
            return null;
        }
    }

    async fetchAssetDetails(assetId: string): Promise<IAsset> {
        try {
            return await this.assetRepository.findAssetDetails(assetId);
        } catch (error) {
            console.error('Error fetching the asset details: ', error);
            return null;
        }
    }

    async updateAsset(assetId: string, submitData: any): Promise<IAsset> {
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
    ): Promise<IAssetRequestResponse[] | null> {
        try {
            const result = await this.assetRequestRepository.findRequests(search, skip, userId, limit, sort, status);
            return result;
        } catch (error) {
            console.error("Error fetching asset requests:", error);
            return null;
        }
    }

    async fetchMyAssetRequests(search: string, filter: string, skip: number, limit: number, userId: string): Promise<IAssetRequestResponse[] | null> {
        try {
            const result = await this.assetRequestRepository.findMyRequests(search, filter, userId, skip, limit);
            return result;
        } catch (error) {
            console.error('Error finding the asset requests:', error);
            return null;
        }
    }

    async checkIsRequestLimit(userId: string, quantity: number): Promise<boolean | null> {
        try {
            const assetRequests = await this.assetRequestRepository.findMyAllRequests(userId);
            const count = assetRequests.reduce((accu, request) => {
                const quantity = Number(request.quantity) || 0;
                return accu + quantity;
            }, 0);
            console.log('count: ', count)
            return (count + quantity) > 3;
        } catch (error) {
            console.error('Error finding the asset requests:', error);
            return null;
        }
    }

    async countMyAssetRequests(userId: string, search: string, filter: string): Promise<number> {
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

    async findRequestDetails(userId: string, assetId: string): Promise<any> {
        try {
            const assetRequest = await this.assetRequestRepository.findRequestDetails(userId, assetId);
            return assetRequest;
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