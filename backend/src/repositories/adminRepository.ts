import { IUser } from '../interfaces/userInterface';
import User from '../models/userModel';

class AdminRepository {

    async findUsers(query: object, skip: number, limit: number): Promise<IUser[]> | null {
        try {
            return await User.find(query).skip(skip).limit(limit);
        } catch (error) {
            console.error('Error finding the users:', error);
            return null;
        }
    }

    async countUsers(): Promise<number> {
        try {
            return await User.countDocuments();
        } catch (error) {
            console.error('Error counting the users:', error);
            return 0;
        }
    }

    async findUserDetails(id: string) {
        try {
            return await User.findOne({ _id: id });
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }
}

export default AdminRepository;
