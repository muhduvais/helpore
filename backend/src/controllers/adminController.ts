import { Request, Response } from 'express';
import AdminService from '../services/AdminService';
import dotenv from 'dotenv';
dotenv.config();

class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
        this.getUsers = this.getUsers.bind(this);
    }

    async getUsers(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;

        const skip = ((page - 1) * limit);

        try {
            const users = await this.adminService.fetchUsers(search, skip, limit);
            const documentsCount = await this.adminService.countDocuments();
            const totalPages = documentsCount / limit;
            
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
}

export default new AdminController();
