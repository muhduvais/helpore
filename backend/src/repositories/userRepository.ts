import Address from '../models/addressModel';
import User from '../models/userModel';
import AssetRequest from '../models/assetRequestModel';
import { IAsset, IAssetRequest } from '../interfaces/userInterface';
import Asset from '../models/assetModel';

class AdminRepository {

    async findUserDetails(id: string) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async findAddressDetails(id: string) {
        try {
            return await Address.findById(id);
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async findPassword(userId: String) {
        try {
            const user = await User.findById(userId);
            return user.password;
        } catch (error) {
            console.error('Error updating the password:', error);
            return null;
        }
    }

    async updatePassword(userId: string, newPassword: string) {
        try {
            await User.findByIdAndUpdate(userId, { password: newPassword });
            return true;
        } catch (error) {
            console.error('Error updating the password:', error);
            return false;
        }
    }

    async findAssets(query: object, skip: number, limit: number, sortQuery: { [key: string]: 1 | -1 }): Promise<IAsset[]> | null {
        try {
            return await Asset.find(query).skip(skip).limit(limit).sort(sortQuery);
        } catch (error) {
            console.error('Error finding the assets:', error);
            return null;
        }
    }

    async findAssetDetails(id: string) {
        try {
            return await Asset.findById(id);
        } catch (error) {
            console.error('Error finding the asset:', error);
            return null;
        }
    }

    async countAssets(query: object): Promise<number> {
        try {
            return await Asset.countDocuments(query);
        } catch (error) {
            console.error('Error counting the assets:', error);
            return 0;
        }
    }

    // Request asset
    async createAssetRequest(assetId: string, userId: string, requestedDate: Date) {
        try {
            console.log('Requested date: ', requestedDate)
            const assetRequest = new AssetRequest({ asset: assetId, user: userId, requestedDate, status: 'pending' });
            await assetRequest.save();
            return true;
        } catch (error) {
            console.error('Error creating the request:', error);
            return false;
        }
    }

    async findAssetRequests(query: object, skip: number, limit: number): Promise<IAssetRequest[]> | null {
        try {
            return await AssetRequest.find(query).skip(skip).limit(limit);
        } catch (error) {
            console.error('Error finding the asset requests:', error);
            return null;
        }
    }

    async countAssetRequests(userId: string): Promise<number> {
        try {
            return await User.countDocuments({ user: userId });
        } catch (error) {
            console.error('Error counting the assetRequests:', error);
            return 0;
        }
    }

    async findAssetRequestDetails(userId: string, assetId: string) {
        try {
            return await AssetRequest.find({ asset: assetId, user: userId });
        } catch (error) {
            console.error('Error finding the asset request:', error);
            return null;
        }
    }

}

export default AdminRepository;
