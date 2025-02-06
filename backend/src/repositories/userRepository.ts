import Address from '../models/addressModel';
import User from '../models/userModel';
import AssetRequest from '../models/assetRequestModel';
import { BaseAssetRequest, IAsset, IAssetRequestResponse } from '../interfaces/userInterface';
import Asset from '../models/assetModel';
import mongoose, { FlattenMaps } from 'mongoose';

class AdminRepository {

    async findUserDetails(id: string) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async updateUser(id: string, submitData: any) {
        try {
            return await User.findByIdAndUpdate(id, submitData);
        } catch (error) {
            console.error('Error updating the user:', error);
            return null;
        }
    }

    async updateAddress(id: string, submitData: any) {
        try {
            return await Address.findOneAndUpdate({ entity: id }, { $set: submitData} );
        } catch (error) {
            console.error('Error updating the address:', error);
            return null;
        }
    }

    async findAddressDetails(id: string) {
        try {
            return await Address.findOne({ entity: id });
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
    async createAssetRequest(assetId: string, userId: string, requestedDate: Date, quantity: number) {
        try {
            console.log('qty: ', quantity)
            const assetRequest = new AssetRequest({ asset: assetId, user: userId, requestedDate, quantity, status: 'pending' });
            await assetRequest.save();
            await Asset.findByIdAndUpdate(assetId, { $inc: { stocks: -quantity } })
            return true;
        } catch (error) {
            console.error('Error creating the request:', error);
            return false;
        }
    }

    async findAssetRequests(search: string, filter: string, userId: string, skip: number, limit: number): Promise<IAssetRequestResponse[] | null> {
        try {
            const matchStage: any = filter ? { user: new mongoose.Types.ObjectId(userId), status: filter } : { user: new mongoose.Types.ObjectId(userId) };

            if (search) {
                matchStage['asset.name'] = { $regex: search, $options: 'i' };
            }

            const requests = await AssetRequest.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'assets',
                        localField: 'asset',
                        foreignField: '_id',
                        as: 'asset'
                    }
                },
                { $unwind: '$asset' },
                { $match: matchStage },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        asset: 1,
                        requestedDate: 1,
                        quantity: 1,
                        status: 1,
                        comment: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);

            return requests as IAssetRequestResponse[];
        } catch (error) {
            console.error('Error finding the asset requests:', error);
            return null;
        }
    }


    async countAssetRequests(userId: string): Promise<number> {
        try {
            return await AssetRequest.countDocuments({ user: userId });
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

    async updateProfilePicture(userId: string, profilePicture: string) {
        try {
            await User.findByIdAndUpdate(userId, { profilePicture });
            return true;
        } catch (error) {
            console.error('Error updating the profile picture:', error);
            return false;
        }
    }

}

export default AdminRepository;
