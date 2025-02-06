import { Request, Response } from 'express';
import UserService from '../services/userService';
import dotenv from 'dotenv';
dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}

class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
        this.getUserDetails = this.getUserDetails.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.requestAsset = this.requestAsset.bind(this);
        this.getAssetRequests = this.getAssetRequests.bind(this);
        this.getAssetRequestDetails = this.getAssetRequestDetails.bind(this);
        this.getAssets = this.getAssets.bind(this);
        this.getAssetDetails = this.getAssetDetails.bind(this);
        this.updateProfilePicture = this.updateProfilePicture.bind(this);
        this.updateUserDetails = this.updateUserDetails.bind(this);
    }

    async getUserDetails(req: Request, res: Response): Promise<void> {

        const userId = req.user.userId;

        try {
            const userDetails = await this.userService.fetchUserDetails(userId);

            if (userDetails) {
                res.status(200).json({ success: true, userDetails });
            } else {
                res.status(400).json({ success: false, message: 'User not found!' });
            }
        } catch (error) {
            console.error('Error fetching the user details:', error);
            res.status(500).json({ message: 'Error fetching the user details', error });
        }
    }

    async updateUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;
            const { formData } = req.body;
            const registeredMail = await this.userService.editUser(userId, formData);

            if (registeredMail) {
                res.status(200).json({ success: true, registeredMail });
            }
        } catch (error) {
            console.error('Error registering the user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {

        const userId = req.user.userId;

        const data = req.body;

        const { currentPassword, newPassword } = data;

        try {
            const verifyCurrentPassword = await this.userService.verifyCurrentPassword(userId, currentPassword);

            if (!verifyCurrentPassword) {
                res.status(400).json({ success: false, message: 'Invalid current password!' });
                return;
            }
            const changePassword = await this.userService.changePassword(userId, newPassword);

            if (changePassword) {
                res.status(200).json({ success: true, message: 'Password updated successfully!' });
            }
        } catch (error) {
            console.error('Error updating the password: ', error);
            res.status(500).json({ message: 'Error updating the password: ', error });
        }
    }

    async getAssets(req: Request, res: Response): Promise<void> {
        
        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const filterByAvailability = req.query.filterByAvailability as string;

        let skip = !search ? ((page - 1) * limit) : 0;

        try {
            const assets = await this.userService.fetchAssets(search, skip, limit, sortBy, filterByAvailability);
            const documentsCount = await this.userService.countAssets(search);
            const totalPages = Math.ceil(documentsCount / limit);

            if (assets) {
                res.status(200).json({ success: true, assets, totalPages });
            } else {
                res.status(400).json({ success: false, message: 'Assets not found!' });
            }
        } catch (error) {
            console.error('Error fetching the assets:', error);
            res.status(500).json({ message: 'Error fetching the assets', error });
        }
    }

    async getAssetDetails(req: Request, res: Response): Promise<void> {

        const assetId = req.params.id;

        try {
            const asset = await this.userService.fetchAssetDetails(assetId);

            if (asset) {
                res.status(200).json({ success: true, asset });
            } else {
                res.status(400).json({ success: false, message: 'Asset not found!' });
            }
        } catch (error) {
            console.error('Error fetching the asset details:', error);
            res.status(500).json({ message: 'Error fetching the asset details', error });
        }
    }

    // Request Asset
    async requestAsset(req: Request, res: Response): Promise<void> {

        const assetId = req.params.id;
        const userId = req.user.userId;
        const { requestedDate, quantity } = req.body;

        try {
            const createAssetRequest = await this.userService.createAssetRequest(assetId, userId, requestedDate, quantity);

            if (createAssetRequest) {
                res.status(200).json({ success: true, message: 'Request created successfully!' });
            }
        } catch (error) {
            console.error('Error creating the request: ', error);
            res.status(500).json({ message: 'Error creating the request: ', error });
        }
    }

    async getAssetRequests(req: Request, res: Response): Promise<void> {

        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        const filter = req.query.filter as string;

        let skip = !search ? ((page - 1) * limit) : 0;

        const userId = req.user.userId;

        try {
            const assetRequests = await this.userService.fetchAssetRequests(search, filter, skip, limit, userId);
            const documentsCount = await this.userService.countAssetRequests(userId);
            const totalPages = Math.ceil(documentsCount / limit);

            if (assetRequests) {
                res.status(200).json({ success: true, assetRequests, totalPages, totalRequests: documentsCount });
            } else {
                res.status(400).json({ success: false, message: 'Asset requests not found!' });
            }
        } catch (error) {
            console.error('Error fetching the asset requests:', error);
            res.status(500).json({ message: 'Error fetching the asset requests', error });
        }
    }

    async getAssetRequestDetails(req: Request, res: Response): Promise<void> {

        const userId = req.user.userId;
        const assetId = req.params.id;

        try {
            const userDetails = await this.userService.fetchAssetRequestDetails(userId, assetId);

            if (userDetails) {
                res.status(200).json({ success: true, userDetails });
            } else {
                res.status(400).json({ success: false, message: 'User not found!' });
            }
        } catch (error) {
            console.error('Error fetching the asset request details:', error);
            res.status(500).json({ message: 'Error fetching the asset request details', error });
        }
    }

    async updateProfilePicture(req: Request, res: Response): Promise<void> {

        const userId = req.user.userId;

        const { profilePicture } = req.body;

        try {
            const changeProfilePicture = await this.userService.changeProfilePicture(userId, profilePicture);

            if (!changeProfilePicture) {
                res.status(400).json({ success: false, message: 'Error changing the profile!' });
                return;
            }

            res.status(200).json({ success: true, message: 'profile updated successfully!' });
        } catch (error) {
            console.error('Error updating the profile picture: ', error);
            res.status(500).json({ message: 'Error updating the profile picture: ', error });
        }
    }
}

export default new UserController();
