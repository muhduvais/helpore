import { IAddress, IUser } from '../interfaces/userInterface';
import Address from '../models/addressModel';
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
            return await User.countDocuments({ role: 'user' });
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

    async findUser(email: string) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async createUser(newUser: Partial<IUser>) {
        const { name, email, password, googleId, profilePicture } = newUser;
        const isVerified = true;
        const role = 'user';
        try {
            const user = new User({ name, email, password, googleId, profilePicture, isVerified, role });
            await user.save();
            return user;
        } catch (error) {
            console.error('Error creating the user:', error);
            return null;
        }
    }

    async addAddress(newAddress: IAddress, userId: string) {
        const { fname, lname, street, city, state, country, pincode } = newAddress;
        const entity = userId;
        const type = 'user';
        const latitude = '';
        const longtitude = '';
        try {
            const address = new Address({ fname, lname, street, city, state, country, pincode, entity, type, latitude, longtitude });
            await address.save();
            console.log('Created new address!');
            return address;
        } catch (error) {
            console.error('Error adding the address:', error);
            return null;
        }
    }

    async toggleIsBlocked(isBlocked: boolean, userId: string): Promise<boolean> {
        try {
            await User.findByIdAndUpdate(userId, { isBlocked });
            return true;
        } catch (error) {
            console.error('Error updating the block status: ', error);
            return false;
        }
    }

    // Volunteers
    async findVolunteers(query: object, skip: number, limit: number): Promise<IUser[]> | null {
        try {
            return await User.find(query).skip(skip).limit(limit);
        } catch (error) {
            console.error('Error finding the volunteers:', error);
            return null;
        }
    }

    async findVolunteer(email: string) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error finding the volunteer:', error);
            return null;
        }
    }

    async createVolunteer(newUser: Partial<IUser>) {
        const { name, email, password, googleId, profilePicture } = newUser;
        const isVerified = true;
        const role = 'volunteer';
        try {
            const user = new User({ name, email, password, googleId, profilePicture, isVerified, role });
            await user.save();
            return user;
        } catch (error) {
            console.error('Error creating the volunteer:', error);
            return null;
        }
    }
}

export default AdminRepository;
