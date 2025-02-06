import AdminRepository from '../repositories/adminRepository';
import { IAsset, IAssetRequestResponse, IUser } from '../interfaces/userInterface';
import bcrypt from 'bcryptjs';
import { IAddUserForm } from '../interfaces/adminInterface';
import { IAddress } from '../interfaces/userInterface';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class AdminService {
    private adminRepository: AdminRepository;

    constructor() {
        this.adminRepository = new AdminRepository();
    }

    async fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'user' } : { role: 'user' };
            return await this.adminRepository.findUsers(query, skip, limit);
        } catch (error) {
            console.error('Error finding the users:', error);
            return null;
        }
    }

    async countUsers(search: string): Promise<number> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'user' } : { role: 'user' };
            return await this.adminRepository.countUsers(query);
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }

    async countVolunteers(search: string): Promise<number> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'volunteer' } : { role: 'volunteer' };
            return await this.adminRepository.countVolunteers(query);
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }

    async countAssets(search: string): Promise<number> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' } } : {};
            return await this.adminRepository.countAssets(query);
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }

    async addUser(formData: IAddUserForm) {
        try {
            const { name, age, gender, phone, email, password, fname, lname, street, city, state, country, pincode } = formData;
            const existingUser = await this.adminRepository.findUser(email);
            console.log('Existing user: ', existingUser)
            if (existingUser) {
                return false;
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser: Partial<IUser> = {
                name,
                age,
                gender,
                phone,
                email,
                googleId: null,
                password: hashedPassword,
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

            const user = await this.adminRepository.createUser(newUser);
            await this.adminRepository.addAddress(newAddress, user._id as string);
            const registeredMail = user.email;

            return registeredMail;
        } catch (error) {
            console.error('Error registering the user', error);
            return null;
        }
    }

    async toggleIsBlocked(action: boolean, userId: string): Promise<boolean> {
        try {
            await this.adminRepository.toggleIsBlocked(action, userId);
            return true;
        } catch (error) {
            console.error('Error updating the block status: ', error);
            return false;
        }
    }

    async volunteerToggleIsBlocked(action: boolean, volunteerId: string): Promise<boolean> {
        try {
            await this.adminRepository.volunteerToggleIsBlocked(action, volunteerId);
            return true;
        } catch (error) {
            console.error('Error updating the block status: ', error);
            return false;
        }
    }

    async fetchUserDetails(userId: string): Promise<IUser> {
        try {
            return await this.adminRepository.findUserDetails(userId);
        } catch (error) {
            console.error('Error fetching the user details: ', error);
            return null;
        }
    }

    async fetchAddress(userId: string): Promise<IAddress> {
        try {
            return await this.adminRepository.findAddress(userId);
        } catch (error) {
            console.error('Error fetching the address details: ', error);
            return null;
        }
    }

    // Volunteers
    async fetchVolunteers(search: string, skip: number, limit: number): Promise<IUser[] | null> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'volunteer' } : { role: 'volunteer' };
            return await this.adminRepository.findVolunteers(query, skip, limit);
        } catch (error) {
            console.error('Error finding the users:', error);
            return null;
        }
    }

    async addVolunteer(formData: IAddUserForm) {
        try {
            const { name, age, gender, phone, email, password, fname, lname, street, city, state, country, pincode } = formData;
            const existingUser = await this.adminRepository.findVolunteer(email);
            if (existingUser) {
                return false;
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser: Partial<IUser> = {
                name,
                age,
                gender,
                phone,
                email,
                googleId: null,
                password: hashedPassword,
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

            const user = await this.adminRepository.createVolunteer(newUser);
            await this.adminRepository.addAddress(newAddress, user._id as string);
            const registeredMail = user.email;

            return registeredMail;
        } catch (error) {
            console.error('Error registering the volunteer', error);
            return null;
        }
    }

    async fetchVolunteerDetails(volunteerId: string): Promise<IUser> {
        try {
            return await this.adminRepository.findVolunteerDetails(volunteerId);
        } catch (error) {
            console.error('Error fetching the volunteer details: ', error);
            return null;
        }
    }

    // Assets
    async addAsset(data: IAsset): Promise<any> {
        try {
            return await this.adminRepository.addAsset(data);
        } catch (error) {
            console.error("Database error while adding asset:", error);
            throw new Error(`Error adding asset: ${error.message}`);
        }
    }

    async uploadAssetImage(file: Express.Multer.File): Promise<string> {
        try {
            if (!file.path) {
                throw new Error('No file path provided');
            }

            const randomDigits = Math.floor(100000 + Math.random() * 900000);

            console.log('Attempting to upload to Cloudinary:', {
                path: file.path,
                publicId: `asset-images/${randomDigits}`
            });

            const uploadResponse = await cloudinary.v2.uploader.upload(file.path, {
                public_id: `asset-images/${randomDigits}`,
                folder: 'assets',
                resource_type: 'auto',
                secure: true,
            });

            console.log('Cloudinary upload successful:', uploadResponse.secure_url);

            return uploadResponse.secure_url;
        } catch (error) {
            console.error('Error in uploadAssetImage service:', error);
            throw error;
        }
    }

    async fetchAssets(search: string, skip: number, limit: number): Promise<IAsset[] | null> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' } } : {};
            return await this.adminRepository.findAssets(query, skip, limit);
        } catch (error) {
            console.error('Error finding the assets:', error);
            return null;
        }
    }

    async fetchAssetDetails(assetId: string): Promise<IAsset> {
        try {
            return await this.adminRepository.findAssetDetails(assetId);
        } catch (error) {
            console.error('Error fetching the asset details: ', error);
            return null;
        }
    }

    async updateAsset(assetId: string, submitData: any): Promise<IAsset> {
        try {
            return await this.adminRepository.updateAsset(assetId, submitData);
        } catch (error) {
            console.error('Error updating the asset: ', error);
            return null;
        }
    }

    async countAssetRequests(search: any): Promise<number> {
        try {
            let query: any = {};

            if (search) {
                query["asset.name"] = { $regex: search, $options: "i" };
            }
            return await this.adminRepository.countAssetRequests(query);
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
            const result = await this.adminRepository.findAssetRequests(search, skip, userId, limit, sort, status);
            return result;
        } catch (error) {
            console.error("Error fetching asset requests:", error);
            return null;
        }
    }

    async updateStatus(requestId: string, status: string, comment: string) {
        try {
            const updatedRequest = await this.adminRepository.updateStatus(requestId, status, comment);

            return updatedRequest;
        } catch (error) {
            console.error('Error updating asset request status in service:', error);
            throw error;
        }
    }

}

export default AdminService;
