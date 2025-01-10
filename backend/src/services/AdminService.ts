import AdminRepository from '../repositories/adminRepository';
import { IUser } from '../interfaces/userInterface';

class AdminService {
    private adminRepository: AdminRepository;

    constructor() {
        this.adminRepository = new AdminRepository();
    }

    async fetchUsers(search: string, skip: number, limit: number): Promise<IUser[]| null> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'user' } : { role: 'user' };
            return await this.adminRepository.findUsers(query, skip, limit);
        } catch (error) {
            console.error('Error finding the users:', error);
            return null;
        }
    }

    async countDocuments(): Promise<number> {
        try {
            return await this.adminRepository.countUsers();
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }
}

export default AdminService;
