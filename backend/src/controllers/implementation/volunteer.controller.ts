import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminService, IVolunteerService } from '../../services/interfaces/ServiceInterface';
import { IVolunteerController } from '../interfaces/IVolunteerController';
import { JwtPayload } from 'jsonwebtoken';

@injectable()
export class VolunteerController implements IVolunteerController {
    constructor(
        @inject('IVolunteerService') private readonly volunteerService: IVolunteerService,
        @inject('IAdminService') private readonly adminService: IAdminService,
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

        const page = req.query.page !== undefined ? parseInt(req.query.page as string, 10) : 1;
        let limit = req.query.limit !== undefined ? parseInt(req.query.limit as string, 10) : 5;

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
            const volunteerId = req.params.id ? req.params.id : (req.user as JwtPayload).userId;

            const [volunteer, address] = await Promise.all([
                this.volunteerService.fetchVolunteerDetails(volunteerId),
                this.volunteerService.fetchAddress(volunteerId)
            ]);

            if (volunteer) {
                res.status(200).json({ success: true, volunteer, address });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Volunteer not found!'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching the volunteer details',
                error
            });
        }
    }

    async updateProfilePicture(req: Request, res: Response): Promise<void> {

        const { userId: volunteerId } = req.user as JwtPayload;

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

        const { userId: volunteerId } = req.user as JwtPayload;
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

    async updateVolunteerDetails(req: Request, res: Response): Promise<void> {
        try {
            const volunteerId = (req.user as JwtPayload)?.userId;
            const { formData } = req.body;
            const registeredMail = await this.volunteerService.editVolunteer(volunteerId, formData);

            if (registeredMail) {
                res.status(200).json({ success: true, registeredMail });
            }
        } catch (error) {
            console.error('Error updating the volunteer:', error);
            res.status(500).json({ message: 'Error updating volunteer', error });
        }
    }
}