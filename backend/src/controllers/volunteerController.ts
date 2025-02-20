import { Request, Response } from 'express';
import VolunteerService from '../services/volunteerService';
import dotenv from 'dotenv';
dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}

class VolunteerController {
    private volunteerService: VolunteerService;

    constructor() {
        this.volunteerService = new VolunteerService();
        this.getVolunteerDetails = this.getVolunteerDetails.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.updateProfilePicture = this.updateProfilePicture.bind(this);
        this.updateVolunteerDetails = this.updateVolunteerDetails.bind(this);
        this.createAddress = this.createAddress.bind(this);
        this.getAddresses = this.getAddresses.bind(this);
        this.getNearbyRequests = this.getNearbyRequests.bind(this);
        this.updateRequestStatus = this.updateRequestStatus.bind(this);
    }

    async getNearbyRequests(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user.userId;

            const page = parseInt(req.query.page as string, 10) || 1;
            const search = req.query.search as string;
            const filter = req.query.search as string;

            const nearbyRequests: any = await this.volunteerService.getNearbyRequests(volunteerId, page, search, filter);

            const documentsCount = nearbyRequests.metadata.total;
            const totalPages = Math.ceil(documentsCount / 4);

            res.status(200).json({ nearbyRequests, totalPages, documentsCount });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateRequestStatus(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user.userId;
            const requestId = req.params.id;
            const { action } = req.body;

            const updatedRequest = await this.volunteerService.updateRequestStatus({
                requestId,
                volunteerId,
                action,
            });

            if (updatedRequest === 'Request approved') {
                res.status(200).json({
                    success: true,
                    message: "Request approved!",
                    data: updatedRequest
                });
                return;
            }

            if (updatedRequest === 'Request rejected') {
                res.status(200).json({
                    success: true,
                    message: "Request declined!",
                    data: updatedRequest
                });
                return;
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Profile
    async getVolunteerDetails(req: Request, res: Response): Promise<void> {

        const volunteerId = req.user.userId;

        try {
            const userDetails = await this.volunteerService.fetchUserDetails(volunteerId);

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

    async updateVolunteerDetails(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user.userId;
            const { formData } = req.body;
            const registeredMail = await this.volunteerService.editUser(volunteerId, formData);

            if (registeredMail) {
                res.status(200).json({ success: true, registeredMail });
            }
        } catch (error) {
            console.error('Error registering the user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    async updateProfilePicture(req: Request, res: Response): Promise<void> {

        const volunteerId = req.user.userId;

        const { profilePicture } = req.body;

        try {
            const changeProfilePicture = await this.volunteerService.changeProfilePicture(volunteerId, profilePicture);

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

    async changePassword(req: Request, res: Response): Promise<void> {

        const volunteerId = req.user.userId;

        const data = req.body;

        const { currentPassword, newPassword } = data;

        try {
            const verifyCurrentPassword = await this.volunteerService.verifyCurrentPassword(volunteerId, currentPassword);

            if (!verifyCurrentPassword) {
                res.status(400).json({ success: false, message: 'Invalid current password!' });
                return;
            }
            const changePassword = await this.volunteerService.changePassword(volunteerId, newPassword);

            if (changePassword) {
                res.status(200).json({ success: true, message: 'Password updated successfully!' });
            }
        } catch (error) {
            console.error('Error updating the password: ', error);
            res.status(500).json({ message: 'Error updating the password: ', error });
        }
    }

    // Addresses
    async createAddress(req: Request, res: Response): Promise<void> {

        const entity = req.user.userId;
        const type = 'user';
        const { addressData } = req.body;

        addressData.entity = entity;
        addressData.type = type;

        try {
            const addressId = await this.volunteerService.createAddress(addressData);

            if (addressId) {
                res.status(200).json({ success: true, addressId });
            } else {
                res.status(400).json({ success: false, message: 'Error creating the address!' });
            }
        } catch (error) {
            console.error('Error creating the address:', error);
            res.status(500).json({ message: 'Error creating the address', error });
        }
    }

    async getAddresses(req: Request, res: Response): Promise<void> {

        const volunteerId = req.user.userId;

        try {
            const addresses = await this.volunteerService.fetchAddresses(volunteerId);

            if (addresses) {
                res.status(200).json({ success: true, addresses });
            } else {
                res.status(400).json({ success: false, message: 'Addresses not found!' });
            }
        } catch (error) {
            console.error('Error fetching the addresses:', error);
            res.status(500).json({ message: 'Error fetching the addresses', error });
        }
    }
}

export default new VolunteerController();
