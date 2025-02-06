import { Request, Response } from 'express';
import AdminService from '../services/adminService';
import dotenv from 'dotenv';

dotenv.config();

class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
        this.getUsers = this.getUsers.bind(this);
        this.addUser = this.addUser.bind(this);
        this.toggleIsBlocked = this.toggleIsBlocked.bind(this);
        this.volunteerToggleIsBlocked = this.volunteerToggleIsBlocked.bind(this);
        this.getVolunteers = this.getVolunteers.bind(this);
        this.addVolunteer = this.addVolunteer.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
        this.addAsset = this.addAsset.bind(this);
        this.getAssets = this.getAssets.bind(this);
        this.uploadAssetImage = this.uploadAssetImage.bind(this);
        this.getVolunteerDetails = this.getVolunteerDetails.bind(this);
        this.getAssetDetails = this.getAssetDetails.bind(this);
        this.updateAsset = this.updateAsset.bind(this);
        this.fetchAssetRequests = this.fetchAssetRequests.bind(this);
        this.updateAssetRequestStatus = this.updateAssetRequestStatus.bind(this);
    }

    async getUsers(req: Request, res: Response): Promise<void> {

        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;

        let skip = !search ? ((page - 1) * limit) : 0;

        try {
            const users = await this.adminService.fetchUsers(search, skip, limit);
            const documentsCount = await this.adminService.countUsers(search);
            const totalPages = Math.ceil(documentsCount / limit);

            if (users) {
                res.status(200).json({ success: true, users, totalPages, totalUsers: documentsCount });
            } else {
                res.status(400).json({ success: false, message: 'Users not found!' });
            }
        } catch (error) {
            console.error('Error fetching the users:', error);
            res.status(500).json({ message: 'Error fetching the users', error });
        }
    }

    async getUserDetails(req: Request, res: Response): Promise<void> {

        const userId = req.params.id;

        try {
            const user = await this.adminService.fetchUserDetails(userId);
            const address = await this.adminService.fetchAddress(userId);

            if (user) {
                res.status(200).json({ success: true, user, address });
            } else {
                res.status(400).json({ success: false, message: 'User not found!' });
            }
        } catch (error) {
            console.error('Error fetching the user details:', error);
            res.status(500).json({ message: 'Error fetching the user details', error });
        }
    }

    async addUser(req: Request, res: Response): Promise<void> {
        try {
            const { formData } = req.body;
            const registeredMail = await this.adminService.addUser(formData);

            if (registeredMail) {
                res.status(201).json({ success: true, registeredMail });
            } else {
                res.status(400).json({ success: false, existingMail: true, message: 'This email is already registered!' });
            }
        } catch (error) {
            console.error('Error registering the user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    async toggleIsBlocked(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const action = req.params.action === 'block' ? true : false;
            const toggleResponse = await this.adminService.toggleIsBlocked(action, userId);

            if (toggleResponse) {
                res.status(200).json({ success: true, message: 'Updated the block status successfully!' });
            }
        } catch (error) {
            console.error('Error updating the block status: ', error);
            res.status(500).json({ message: 'Error updating the block status: ', error });
        }
    }

    async volunteerToggleIsBlocked(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.params.id;
            const action = req.params.action === 'block' ? true : false;
            const toggleResponse = await this.adminService.volunteerToggleIsBlocked(action, volunteerId);

            if (toggleResponse) {
                res.status(200).json({ success: true, message: 'Updated the block status successfully!' });
            }
        } catch (error) {
            console.error('Error updating the block status: ', error);
            res.status(500).json({ message: 'Error updating the block status: ', error });
        }
    }

    // Volunteers
    async getVolunteers(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        let skip = !search ? ((page - 1) * limit) : 0;

        try {
            const volunteers = await this.adminService.fetchVolunteers(search, skip, limit);
            const documentsCount = await this.adminService.countVolunteers(search);
            const totalPages = Math.ceil(documentsCount / limit);

            if (volunteers) {
                res.status(200).json({ success: true, volunteers, totalPages, totalVolunteers: documentsCount });
            } else {
                res.status(400).json({ success: false, message: 'volunteers not found!' });
            }
        } catch (error) {
            console.error('Error fetching the volunteers:', error);
            res.status(500).json({ message: 'Error fetching the volunteers', error });
        }
    }

    async addVolunteer(req: Request, res: Response): Promise<void> {
        try {
            const { formData } = req.body;
            const registeredMail = await this.adminService.addVolunteer(formData);

            if (registeredMail) {
                res.status(201).json({ success: true, registeredMail });
            } else {
                res.status(400).json({ success: false, message: 'This email is already registered!' });
            }
        } catch (error) {
            console.error('Error registering the user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    async getVolunteerDetails(req: Request, res: Response): Promise<void> {

        const volunteerId = req.params.id;

        try {
            const volunteer = await this.adminService.fetchVolunteerDetails(volunteerId);

            if (volunteer) {
                res.status(200).json({ success: true, volunteer });
            } else {
                res.status(400).json({ success: false, message: 'Volunteer not found!' });
            }
        } catch (error) {
            console.error('Error fetching the volunteer details:', error);
            res.status(500).json({ message: 'Error fetching the volunteer details', error });
        }
    }

    // Assets
    async addAsset(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body.formData;

            await this.adminService.addAsset(data);

            res.status(201).json({
                success: true,
                message: 'Asset added successfully',
            });
        } catch (error) {
            console.error('Error creating the asset:', error);
            res.status(500).json({ message: 'Error creating the asset', error });
        }
    }

    async uploadAssetImage(req: Request, res: Response): Promise<void> {
        try {
            const file = req.file;
            console.log('in controller!')
            console.log('File: ', file)
            if (!file) {
                res.status(400).json({ message: 'No image uploaded' });
                return;
            }

            console.log('Received file:', {
                path: file.path,
                mimetype: file.mimetype,
                filename: file.filename
            });

            const uploadResponse = await this.adminService.uploadAssetImage(file);

            if (!uploadResponse) {
                res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
                return;
            }

            res.status(200).json({ imageUrl: uploadResponse });
        } catch (error) {
            console.error('Error uploading the asset image: ', error);
            res.status(500).json({
                message: 'Error uploading the asset image',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAssets(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;

        let skip = !search ? ((page - 1) * limit) : 0;

        try {
            const assets = await this.adminService.fetchAssets(search, skip, limit);
            const documentsCount = await this.adminService.countAssets(search);
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
            const asset = await this.adminService.fetchAssetDetails(assetId);

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

    async updateAsset(req: Request, res: Response): Promise<void> {

        const assetId = req.params.id;
        const submitData = req.body.submitData;

        try {
            const asset = await this.adminService.updateAsset(assetId, submitData);

            if (asset) {
                res.status(200).json({ success: true, asset });
            } else {
                res.status(400).json({ success: false, message: 'Asset not found!' });
            }
        } catch (error) {
            console.error('Error updating the asset details:', error);
            res.status(500).json({ message: 'Error updating the asset details', error });
        }
    }

    async fetchAssetRequests(req: Request, res: Response): Promise<void> {
        try {
            const { search, page = 1, limit = 10, sort = "desc", user, status = 'all' } = req.query;
            console.log('req: ', req.query)

            const skip = (Number(page) - 1) * Number(limit);

            const documentsCount = await this.adminService.countAssetRequests(search);
            const totalPages = Math.ceil(documentsCount / Number(limit));

            const assetRequests = await this.adminService.fetchAssetRequests(
                search as string,
                skip,
                Number(limit),
                user as string,
                sort as string,
                status as string,
            );

            if (!assetRequests) {
                res.status(404).json({ message: "No asset requests found" });
                return;
            }

            res.status(200).json({ assetRequests, totalPages, totalRequests: documentsCount });
        } catch (error) {
            console.error("Error getting asset requests:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async updateAssetRequestStatus(req: Request, res: Response): Promise<void> {
        const requestId = req.params.id;
        const { status, comment } = req.body;

        try {
            const updatedRequest = await this.adminService.updateStatus(requestId, status, comment);

            if (!updatedRequest) {
                res.status(404).json({ message: 'Asset request not found' });
                return;
            }

            res.status(200).json(updatedRequest);
        } catch (error) {
            console.error('Error updating asset request status:', error);
            res.status(500).json({ message: 'An error occurred while updating the asset request' });
        }
    }

}

export default new AdminController();
