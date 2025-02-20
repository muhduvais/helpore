import { IAddress, IAsset, IAssetRequest, IAssetRequestResponse, IAssistanceRequest, IAssistanceRequestResponse, IUser } from '../interfaces/userInterface';
import UserRepository from '../repositories/userRepository';
import bcrypt from 'bcryptjs';

class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    // Profle
    async fetchUserDetails(userId: string): Promise<any> {
        try {
            const user = await this.userRepository.findUserDetails(userId);
            const address = await this.userRepository.findAddressDetails(userId);
            return { user, address };
        } catch (error) {
            console.error('Error fetching the user details: ', error);
            return null;
        }
    }

    async editUser(userId: string, formData: any) {
        try {
            const { name, age, gender, phone, fname, lname, street, city, state, country, pincode } = formData;

            const newUser: Partial<IUser> = {
                name,
                age,
                gender,
                phone,
            };

            const newAddress: IAddress = {
                fname,
                lname,
                street,
                city,
                state,
                country,
                pincode,
            };

            const user = await this.userRepository.updateUser(userId, newUser);
            await this.userRepository.updateAddress(user._id as string, newAddress);
            const registeredMail = user.email;

            return registeredMail;
        } catch (error) {
            console.error('Error registering the user', error);
            return null;
        }
    }

    async changeProfilePicture(userId: string, profilePicture: string): Promise<any> {
        try {
            await this.userRepository.updateProfilePicture(userId, profilePicture);
            return true;
        } catch (error) {
            console.error('Error updating the profile picture: ', error);
            return false;
        }
    }

    async verifyCurrentPassword(userId: string, currentPassword: string): Promise<any> {
        try {
            const password = await this.userRepository.findPassword(userId);
            return bcrypt.compare(currentPassword, password);
        } catch (error) {
            console.error('Error updating the password: ', error);
            return null;
        }
    }

    async changePassword(userId: string, newPassword: string): Promise<any> {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.updatePassword(userId, hashedPassword);
            return true;
        } catch (error) {
            console.error('Error updating the password: ', error);
            return false;
        }
    }

    // Addresses
    async createAddress(addressData: IAddress): Promise<string> {
        try {
            const newAddress = await this.userRepository.createAddress(addressData);
            return newAddress._id;
        } catch (error) {
            console.error('Error creating the address: ', error);
            return null;
        }
    }

    async fetchAddresses(userId: string): Promise<IAddress[]> {
        try {
            return await this.userRepository.findAddresses(userId);
        } catch (error) {
            console.error('Error fetching the addresses: ', error);
            return null;
        }
    }

    // Assets
    async fetchAssets(search: string, skip: number, limit: number, sortBy: string, filterByAvailability: string): Promise<IAsset[] | null> {
        try {

            const query = search ? { name: { $regex: search, $options: 'i' } } : {};

            if (filterByAvailability && filterByAvailability !== 'all') {
                let availabilityQuery;
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

            return await this.userRepository.findAssets(query, skip, limit, sortQuery);
        } catch (error) {
            console.error('Error finding the assets:', error);
            return null;
        }
    }

    async fetchAssetDetails(assetId: string): Promise<IAsset> {
        try {
            return await this.userRepository.findAssetDetails(assetId);
        } catch (error) {
            console.error('Error fetching the asset details: ', error);
            return null;
        }
    }

    async countAssets(search: string): Promise<number> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' } } : {};
            return await this.userRepository.countAssets(query);
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }

    // Asset requests
    async createAssetRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<any> {
        try {
            await this.userRepository.createAssetRequest(assetId, userId, requestedDate, quantity);
            return true;
        } catch (error) {
            console.error('Error creating the request: ', error);
            return false;
        }
    }

    async fetchAssetRequests(search: string, filter: string, skip: number, limit: number, userId: string): Promise<IAssetRequestResponse[] | null> {
        try {
            const result = await this.userRepository.findAssetRequests(search, filter, userId, skip, limit);
            return result;
        } catch (error) {
            console.error('Error finding the asset requests:', error);
            return null;
        }
    }

    async countAssetRequests(userId: string, search: string, filter: string): Promise<number> {
        try {
            let query: any = {};

            if (search) {
                query["asset.name"] = { $regex: search, $options: "i" };
            }

            if (filter && filter !== 'all') {
                query.status = filter;
            }

            query.user = userId;

            return await this.userRepository.countAssetRequests(query);
        } catch (error) {
            console.error('Error counting the asset requests:', error);
            return null;
        }
    }

    async fetchAssetRequestDetails(userId: string, assetId: string): Promise<any> {
        try {
            const assetRequest = await this.userRepository.findAssetRequestDetails(userId, assetId);
            return assetRequest;
        } catch (error) {
            console.error('Error fetching the asset request details: ', error);
            return null;
        }
    }

    // Assistance requests
    async createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean> {
        try {
            await this.userRepository.createAssistanceRequest(formData);
            return true;
        } catch (error) {
            console.error('Error creating the request: ', error);
            return false;
        }
    }

    async fetchAssistanceRequests(search: string, filter: string, skip: number, limit: number, userId: string): Promise<IAssistanceRequestResponse[] | null> {
        try {
            const result = await this.userRepository.findAssistanceRequests(search, filter, userId, skip, limit);
            return result;
        } catch (error) {
            console.error('Error finding assistance requests:', error);
            return null;
        }
    }

    async countAssistanceRequests(userId: string, search: string, filter: string): Promise<number> {
        try {
            let query: any = { user: userId };

            if (search) {
                query["user.name"] = { $regex: search, $options: "i" };
            }

            if (filter && filter !== 'all') {
                query.status = filter;
            }

            return await this.userRepository.countAssistanceRequests(query);
        } catch (error) {
            console.error('Error counting assistance requests:', error);
            return null;
        }
    }

    async fetchAssistanceRequestDetails(requestId: string): Promise<any> {
        try {
            const assistanceRequest = await this.userRepository.findAssistanceRequestDetails(requestId);
            return assistanceRequest;
        } catch (error) {
            console.error('Error fetching assistance request details: ', error);
            return null;
        }
    }
}

export default UserService;
