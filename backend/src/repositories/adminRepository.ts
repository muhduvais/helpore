import { IAddress, IUser, IAsset, IAssetRequestResponse, BaseAssetRequest } from '../interfaces/userInterface';
import Address from '../models/addressModel';
import User from '../models/userModel';
import Asset from '../models/assetModel';
import AssetRequest from '../models/assetRequestModel';
import mongoose, { FlattenMaps, SortOrder } from 'mongoose';

class AdminRepository {

    async findUsers(query: object, skip: number, limit: number): Promise<IUser[]> | null {
        try {
            return await User.find(query).skip(skip).limit(limit);
        } catch (error) {
            console.error('Error finding the users:', error);
            return null;
        }
    }

    async countUsers(query: object): Promise<number> {
        try {
            return await User.countDocuments(query);
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }

    async findUserDetails(id: string) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async findAddress(id: string) {
        try {
            return await Address.findOne({ entity: id });
        } catch (error) {
            console.error('Error finding the address:', error);
            return null;
        }
    }

    async findUser(email: string) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async createUser(newUser: Partial<IUser>) {
        const { name, age, gender, phone, email, password, googleId, profilePicture } = newUser;
        const isVerified = true;
        const role = 'user';
        try {
            const user = new User({ name, age, gender, phone, email, password, googleId, profilePicture, isVerified, role });
            await user.save();
            return user;
        } catch (error) {
            console.error('Error creating the user:', error);
            return null;
        }
    }

    async addAddress(newAddress: IAddress, userId: string) {
        const { fname, lname, street, city, state, country, pincode } = newAddress;
        const entity = userId;
        const type = 'user';
        const latitude = '';
        const longtitude = '';
        try {
            const address = new Address({ fname, lname, street, city, state, country, pincode, entity, type, latitude, longtitude });
            await address.save();
            console.log('Created new address!');
            return address;
        } catch (error) {
            console.error('Error adding the address:', error);
            return null;
        }
    }

    // User block toggle
    async toggleIsBlocked(action: boolean, userId: string): Promise<boolean> {
        try {
            await User.findByIdAndUpdate(userId, { isBlocked: action });
            return true;
        } catch (error) {
            console.error('Error updating the block status: ', error);
            return false;
        }
    }

    // Volunteer block toggle
    async volunteerToggleIsBlocked(action: boolean, volunteerId: string): Promise<boolean> {
        try {
            await User.findByIdAndUpdate(volunteerId, { isBlocked: action, isActive: !action });
            return true;
        } catch (error) {
            console.error('Error updating the block status: ', error);
            return false;
        }
    }

    // Volunteers
    async findVolunteers(query: object, skip: number, limit: number): Promise<IUser[]> | null {
        try {
            return await User.find(query).skip(skip).limit(limit);
        } catch (error) {
            console.error('Error finding the volunteers:', error);
            return null;
        }
    }

    async findVolunteer(email: string) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error finding the volunteer:', error);
            return null;
        }
    }

    async createVolunteer(newUser: Partial<IUser>) {
        const { name, age, gender, phone, email, password, googleId, profilePicture } = newUser;
        const isVerified = true;
        const role = 'volunteer';
        try {
            const user = new User({ name, age, gender, phone, email, password, googleId, profilePicture, isVerified, role });
            await user.save();
            return user;
        } catch (error) {
            console.error('Error creating the volunteer:', error);
            return null;
        }
    }

    async countVolunteers(query: object): Promise<number> {
        try {
            return await User.countDocuments(query);
        } catch (error) {
            console.error('Error counting the volunteers:', error);
            return 0;
        }
    }

    async findVolunteerDetails(id: string) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.error('Error finding the volunteer:', error);
            return null;
        }
    }

    // Assets
    async addAsset(assetData: IAsset): Promise<any> {
        try {
            console.log('Asset data: ', assetData);
            const newAsset = new Asset(assetData);
            await newAsset.save();
            return true;
        } catch (error) {
            console.error("Mongoose save error:", error);
            throw new Error(`Error saving asset: ${error.message}`);
        }
    }

    async findAssets(query: object, skip: number, limit: number): Promise<IAsset[]> | null {
        try {
            return await Asset.find(query).skip(skip).limit(limit);
        } catch (error) {
            console.error('Error finding the assets:', error);
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

    async findAssetDetails(id: string) {
        try {
            return await Asset.findById(id);
        } catch (error) {
            console.error('Error finding the asset:', error);
            return null;
        }
    }

    async updateAsset(id: string, submitData: any) {
        try {
            console.log('submitdata: ', submitData)
            return await Asset.findByIdAndUpdate(id, submitData);
        } catch (error) {
            console.error('Error updating the asset:', error);
            return null;
        }
    }

    async countAssetRequests(query: object): Promise<number> {
        try {
            return await AssetRequest.countDocuments(query);
        } catch (error) {
            console.error('Error counting the asset requests:', error);
            return 0;
        }
    }

    async findAssetRequests(
        search: string,
        skip: number,
        userId: string,
        limit: number,
        sort: string,
        status: string,
    ): Promise<IAssetRequestResponse[] | null> {
        try {
            let query: any = {};

            if (userId !== "all") {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    throw new Error("Invalid user ID format");
                }
                query.user = new mongoose.Types.ObjectId(userId);
            }

            if (search) {
                query.$or = [
                    { "asset.name": { $regex: search, $options: "i" } },
                    { "user.name": { $regex: search, $options: "i" } }
                ];
            }

            if (status !== 'all') {
                query.status = status;
            }

            const sortOption = sort === "newest" ? -1 : 1;

            const requests = await AssetRequest.aggregate([
                {
                    $lookup: {
                        from: 'assets',
                        localField: 'asset',
                        foreignField: '_id',
                        as: 'asset'
                    }
                },
                { $unwind: '$asset' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $match: query },
                { $sort: { createdAt: sortOption } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        asset: 1,
                        user: 1,
                        requestedDate: 1,
                        quantity: 1,
                        status: 1,
                        comment: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);

            return requests.map(request => ({
                _id: request._id.toString(),
                asset: request.asset,
                user: request.user,
                requestedDate: request.requestedDate.toISOString(),
                quantity: request.quantity,
                status: request.status,
                comment: request.comment,
                createdAt: request.createdAt.toISOString(),
                updatedAt: request.updatedAt.toISOString(),
            }));
        } catch (error) {
            console.error("Error finding asset requests:", error);
            return null;
        }
    }

    async updateStatus(requestId: string, status: string, comment: string) {
        try {
            const updatedRequest = await AssetRequest.findByIdAndUpdate(
                requestId,
                { status, comment }
            );

            return updatedRequest;
        } catch (error) {
            console.error('Error updating asset request status in repository:', error);
            throw error;
        }
    }

}

export default AdminRepository;
