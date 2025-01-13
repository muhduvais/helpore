import AdminRepository from '../repositories/adminRepository';
import { IUser } from '../interfaces/userInterface';
import bcrypt from 'bcrypt';
import { IAddUserForm } from '../interfaces/adminInterface';
import { IAddress } from '../interfaces/userInterface';

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

    async addUser(formData: IAddUserForm) {
            try {
                const { name, age, gender, phone, email, password, fname, lname, street, city, state, country, pincode } = formData;
                const existingUser = await this.adminRepository.findUser(email);
                if (existingUser) {
                    return false;
                }
                const hashedPassword = await bcrypt.hash(password, 10);
    
                const newUser: Partial<IUser> = {
                    name,
                    age,
                    gender,
                    phone,
                    email,
                    googleId: null,
                    password: hashedPassword,
                  };

                  const newAddress: IAddress = {
                    fname,
                    lname,
                    street,
                    city,
                    state,
                    country,
                    pincode,
                  };
    
                const user = await this.adminRepository.createUser(newUser);
                await this.adminRepository.addAddress(newAddress, user._id as string);
                const registeredMail = user.email;
    
                return registeredMail;
            } catch (error) {
                console.error('Error registering the user', error);
                return null;
            }
        }

        async toggleIsBlocked(isBlocked: boolean, userId: string): Promise<boolean> {
            try {
                await this.adminRepository.toggleIsBlocked(isBlocked, userId);
                return true;
            } catch (error) {
                console.error('Error updating the block status: ', error);
                return false;
            }
        }

        // Volunteers
        async fetchVolunteers(search: string, skip: number, limit: number): Promise<IUser[]| null> {
            try {
                const query = search ? { name: { $regex: search, $options: 'i' }, role: 'volunteer' } : { role: 'volunteer' };
                return await this.adminRepository.findVolunteers(query, skip, limit);
            } catch (error) {
                console.error('Error finding the users:', error);
                return null;
            }
        }

        async addVolunteer(formData: IAddUserForm) {
            try {
                const { name, age, gender, phone, email, password, fname, lname, street, city, state, country, pincode } = formData;
                const existingUser = await this.adminRepository.findVolunteer(email);
                if (existingUser) {
                    return false;
                }
                const hashedPassword = await bcrypt.hash(password, 10);
    
                const newUser: Partial<IUser> = {
                    name,
                    age,
                    gender,
                    phone,
                    email,
                    googleId: null,
                    password: hashedPassword,
                  };

                  const newAddress: IAddress = {
                    fname,
                    lname,
                    street,
                    city,
                    state,
                    country,
                    pincode,
                  };
    
                const user = await this.adminRepository.createVolunteer(newUser);
                await this.adminRepository.addAddress(newAddress, user._id as string);
                const registeredMail = user.email;
    
                return registeredMail;
            } catch (error) {
                console.error('Error registering the volunteer', error);
                return null;
            }
        }
}

export default AdminService;
