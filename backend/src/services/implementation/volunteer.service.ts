import { injectable, inject } from 'tsyringe';
import { BaseService } from './base.service';
import { IVolunteerService } from '../interfaces/ServiceInterface';
import { IUser, IAddress, IUserDocument } from '../../interfaces/user.interface';
import { IAddUserForm } from '../../interfaces/admin.interface';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IAddressRepository } from '../../repositories/interfaces/IAddressRepository';
import { Types } from 'mongoose';
import { IAssistanceRequestRepository } from '../../repositories/interfaces/IAssistanceRequestRepository';
import { ErrorMessages } from '../../constants/errorMessages';

@injectable()
export class VolunteerService extends BaseService<IUserDocument> implements IVolunteerService {
    constructor(
        @inject('IUserRepository') private readonly userRepository: IUserRepository,
        @inject('IAddressRepository') private readonly addressRepository: IAddressRepository,
        @inject('IAssistanceRequestRepository') private readonly assistanceRepository: IAssistanceRequestRepository,
    ) {
        super(userRepository);
    }

    async addVolunteer(formData: IAddUserForm): Promise<string | boolean | null> {
        try {
            const { name, age, gender, phone, email, password, fname, lname, street, city, state, country, pincode } = formData;
            const existingUser = await this.userRepository.findUserByEmail(email);
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

            const user = await this.userRepository.createUser(newUser);
            newAddress.entity = user._id as Types.ObjectId;
            await this.addressRepository.addAddress(newAddress);
            const registeredMail = user.email;

            return registeredMail;
        } catch (error) {
            console.error(ErrorMessages.VOLUNTEER_REGISTER_FAILED, error);
            return null;
        }
    }

    async editVolunteer(volunteerId: string, formData: any): Promise<string | null | undefined> {
        try {
            const { name, age, gender, phone, fname, lname, street, city, state, country, pincode } = formData;

            const newVolunteer: Partial<IUser> = {
                name,
                age,
                gender,
                phone,
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

            const volunteer = await this.userRepository.updateUser(volunteerId, newVolunteer);
            if (!volunteer) return;
            await this.addressRepository.updateAddress(volunteer._id as string, newAddress);
            const registeredMail = volunteer.email;

            return registeredMail;
        } catch (error) {
            console.error(ErrorMessages.VOLUNTEER_UPDATE_FAILED, error);
            return null;
        }
    }

    async fetchVolunteers(search: string, skip: number, limit: number, isActive: string): Promise<IUser[] | null> {
        try {
            let query: any = { role: 'volunteer' };
            if (search) query.name = { $regex: search, $options: 'i' };
            if (isActive === 'true') {
                query.isActive = isActive;
                query.tasks = { $lt: 5 };
            }
            return await this.userRepository.findUsers(query, skip, limit);
        } catch (error) {
            console.error(ErrorMessages.VOLUNTEER_FETCH_FAILED, error);
            throw error;
        }
    }

    async fetchVolunteerDetails(volunteerId: string): Promise<IUser | null> {
        try {
            return await this.userRepository.findUserDetails(volunteerId);
        } catch (error) {
            console.error(ErrorMessages.VOLUNTEER_DETAILS_FETCH_FAILED, error);
            throw error;
        }
    }

    async fetchAddress(volunteerId: string): Promise<IAddress | null> {
        try {
            return await this.addressRepository.findAddressByEntityId(volunteerId);
        } catch (error) {
            console.error(ErrorMessages.ADDRESS_FETCH_FAILED, error);
            return null;
        }
    }

    async countVolunteers(search: string): Promise<number> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'volunteer' } : { role: 'volunteer' };
            return await this.userRepository.countUsers(query);
        } catch (error) {
            console.error(ErrorMessages.VOLUNTEER_COUNT_FAILED, error);
            throw error;
        }
    }

    async changeProfilePicture(volunteerId: string, profilePicture: string): Promise<boolean> {
        try {
            await this.userRepository.updateProfilePicture(volunteerId, profilePicture);
            return true;
        } catch (error) {
            console.error(ErrorMessages.PROFILE_UPDATE_FAILED, error);
            return false;
        }
    }

    async verifyCurrentPassword(volunteerId: string, currentPassword: string): Promise<boolean | null | undefined> {
        try {
            const password = await this.userRepository.findPassword(volunteerId);
            if (!password) return;
            return bcrypt.compare(currentPassword, password);
        } catch (error) {
            console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
            return null;
        }
    }

    async changePassword(volunteerId: string, newPassword: string): Promise<boolean> {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.updatePassword(volunteerId, hashedPassword);
            return true;
        } catch (error) {
            console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
            return false;
        }
    }

    async toggleIsBlocked(action: boolean, userId: string): Promise<boolean> {
        try {
            await this.userRepository.findByIdAndUpdate(userId, { isBlocked: action });
            return true;
        } catch (error) {
            console.error(ErrorMessages.BLOCK_STATUS_UPDATE_FAILED, error);
            throw error;
        }
    }

    async checkTasksLimit(volunteerId: string): Promise<any> {
        try {
            const checkTasksLimit = await this.assistanceRepository.checkTasksLimit(volunteerId);
            return checkTasksLimit;
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_TASK_LIMIT, error);
            return null;
        }
    }
}