import { Request, Response } from 'express';
import AdminService from '../services/AdminService';
import dotenv from 'dotenv';
dotenv.config();

class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
        this.getUsers = this.getUsers.bind(this);
        this.addUser = this.addUser.bind(this);
        this.toggleIsBlocked = this.toggleIsBlocked.bind(this);
        this.getVolunteers = this.getVolunteers.bind(this);
        this.addVolunteer = this.addVolunteer.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
    }

    async getUsers(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;

        let skip =  !search ? ((page - 1) * limit) : 0;

        try {
            const users = await this.adminService.fetchUsers(search, skip, limit);
            const documentsCount = await this.adminService.countDocuments();
            const totalPages = Math.ceil(documentsCount / limit);

            console.log('Documnents count: ', documentsCount)
            console.log('Total pages: ', totalPages)
            
            if (users) {
                res.status(200).json({ success: true, users, totalPages });
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
            
            if (user) {
                res.status(200).json({ success: true, user });
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
                res.status(400).json({ success: false, message: 'This email is already registered!' });
            }
        } catch (error) {
            console.error('Error registering the user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    async toggleIsBlocked(req: Request, res: Response): Promise<void> {
        try {
            const { isBlocked } = req.body;
            const userId = req.params.id;
            const toggleResponse = await this.adminService.toggleIsBlocked(isBlocked, userId);
            
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
        let skip =  !search ? ((page - 1) * limit) : 0;

        try {
            const volunteers = await this.adminService.fetchVolunteers(search, skip, limit);
            const documentsCount = await this.adminService.countVolunteersDocuments();
            const totalPages = Math.ceil(documentsCount / limit);
            
            if (volunteers) {
                res.status(200).json({ success: true, volunteers, totalPages });
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
}

export default new AdminController();
