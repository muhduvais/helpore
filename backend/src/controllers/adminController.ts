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
    }

    async getUsers(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        console.log('reqHeaders: ', req.headers);

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
}

export default new AdminController();
