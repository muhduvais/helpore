import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminService, IVolunteerService } from '../services/interfaces/ServiceInterface';
import { IVolunteerController } from './interfaces/IVolunteerController';

@injectable()
export class VolunteerController implements IVolunteerController {
    constructor(
        @inject('IVolunteerService') private volunteerService: IVolunteerService,
        @inject('IAdminService') private adminService: IAdminService,
    ) {
        this.addVolunteer = this.addVolunteer.bind(this);
        this.getVolunteers = this.getVolunteers.bind(this);
        this.getVolunteerDetails = this.getVolunteerDetails.bind(this);
        this.updateProfilePicture = this.updateProfilePicture.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.toggleIsBlocked = this.toggleIsBlocked.bind(this);
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
            console.error('Error registering the Volunteer:', error);
            res.status(500).json({ message: 'Error registering Volunteer', error });
        }
    }

    async getVolunteers(req: Request, res: Response): Promise<void> {

        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        let skip = !search ? ((page - 1) * limit) : 0;
        const isActive = req.query.isActive || 'all';

        if (isActive !== 'all') limit = Infinity;

        try {
            const volunteers = await this.adminService.fetchVolunteers(search, skip, limit, isActive);
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

    async getVolunteerDetails(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user?.userId;
            const VolunteerDetails = await this.volunteerService.fetchVolunteerDetails(volunteerId);

            if (!VolunteerDetails) {
                res.status(404).json({ success: false, message: 'Volunteer not found!' });
                return;
            }

            res.status(200).json({ success: true, VolunteerDetails });
        } catch (error) {
            console.error('Error fetching Volunteer details:', error);
            res.status(500).json({ success: false, message: 'Error fetching Volunteer details' });
        }
    }

    async updateProfilePicture(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user?.userId;
            const { profilePicture } = req.body;

            const updated = await this.volunteerService.changeProfilePicture(volunteerId, profilePicture);

            if (!updated) {
                res.status(400).json({ success: false, message: 'Error updating profile picture!' });
                return;
            }

            res.status(200).json({ success: true, message: 'Profile picture updated successfully!' });
        } catch (error) {
            console.error('Error updating profile picture:', error);
            res.status(500).json({ success: false, message: 'Error updating profile picture' });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = req.user?.userId;
            const { currentPassword, newPassword } = req.body;

            const isValid = await this.volunteerService.verifyCurrentPassword(volunteerId, currentPassword);
            if (!isValid) {
                res.status(400).json({ success: false, message: 'Invalid current password!' });
                return;
            }

            const updated = await this.volunteerService.changePassword(volunteerId, newPassword);
            if (!updated) {
                res.status(400).json({ success: false, message: 'Error updating password!' });
                return;
            }

            res.status(200).json({ success: true, message: 'Password updated successfully!' });
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ success: false, message: 'Error updating password' });
        }
    }

    async toggleIsBlocked(req: Request, res: Response): Promise<void> {
        try {
            const VolunteerId = req.params.id;
            const action = req.params.action === 'block';
            const toggleResponse = await this.volunteerService.toggleIsBlocked(action, VolunteerId);

            if (toggleResponse) {
                res.status(200).json({
                    success: true,
                    message: 'Updated the block status successfully!'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating the block status',
                error
            });
        }
    }
}