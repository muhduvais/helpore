import { inject, injectable } from 'tsyringe';
import { IAdminService } from '../interfaces/ServiceInterface';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IUser } from '../../interfaces/user.interface';
import { IAddress, IAddressDocument } from '../../interfaces/address.interface';
import { IAddUserForm } from '../../interfaces/admin.interface';
import bcrypt from 'bcryptjs';
import { IAddressRepository } from '../../repositories/interfaces/IAddressRepository';
import { Types } from 'mongoose';
import { IAssistanceRequestRepository } from '../../repositories/interfaces/IAssistanceRequestRepository';
import { ErrorMessages } from '../../constants/errorMessages';

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IAddressRepository') private readonly addressRepository: IAddressRepository,
    @inject('IAssistanceRequestRepository') private readonly assistanceRepository: IAssistanceRequestRepository,
  ) { }

  async addUser(formData: IAddUserForm): Promise<string | boolean | null> {
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
        role: 'user'
      };

      const newAddress: IAddress = {
        fname,
        lname,
        street,
        city,
        state,
        country,
        pincode,
        type: 'user',
      };

      const user = await this.userRepository.createUser(newUser);
      newAddress.entity = user._id as Types.ObjectId;
      await this.addressRepository.addAddress(newAddress);
      const registeredMail = user.email;

      return registeredMail;
    } catch (error) {
      console.error(ErrorMessages.REGISTER_USER_FAILED, error);
      return null;
    }
  }

  async editUser(userId: string, formData: any): Promise<string | null> {
    try {
      const { name, age, gender, phone, fname, lname, street, city, state, country, pincode } = formData;

      const newUser: Partial<IUser> = {
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

      const user = await this.userRepository.updateUser(userId, newUser);
      if (!user) return null;
      await this.addressRepository.updateAddress(user._id as string, newAddress);
      const registeredMail = user.email;

      return registeredMail;
    } catch (error) {
      console.error(ErrorMessages.USER_UPDATE_FAILED, error);
      return null;
    }
  }

  async fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null> {
    try {
      const query = search
        ? { name: { $regex: search, $options: 'i' }, role: 'user' }
        : { role: 'user' };
      return await this.userRepository.findUsers(query, skip, limit);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      throw error;
    }
  }

  async fetchUserDetails(userId: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findUserDetails(userId);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      throw error;
    }
  }

  async countUsers(search: string): Promise<number> {
    try {
      const query = search
        ? { name: { $regex: search, $options: 'i' }, role: 'user' }
        : { role: 'user' };
      return await this.userRepository.countUsers(query);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      throw error;
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

  async addVolunteer(formData: IAddUserForm) {
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
        role: 'volunteer',
      };

      const newAddress: IAddress = {
        fname,
        lname,
        street,
        city,
        state,
        country,
        pincode,
        type: 'volunteer',
      };

      const user = await this.userRepository.createUser(newUser);
      newAddress.entity = user._id as Types.ObjectId;
      await this.addressRepository.addAddress(newAddress);
      const registeredMail = user.email;

      return registeredMail;
    } catch (error) {
      console.error(ErrorMessages.REGISTER_USER_FAILED, error);
      return null;
    }
  }

  async fetchVolunteers(search: string, skip: number, limit: number, isActive: any): Promise<IUser[] | null> {
    try {
      let query: any = { role: 'volunteer' };
      if (search) query.name = { $regex: search, $options: 'i' };
      if (isActive === 'true') {
        query.isActive = isActive;
        query.tasks = { $lt: 5 };
      }

      return await this.userRepository.findUsers(query, skip, limit);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      return null;
    }
  }

  async fetchVolunteerDetails(volunteerId: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findUserDetails(volunteerId);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      return null;
    }
  }

  async countVolunteers(search: string): Promise<number> {
    try {
      const query = search
        ? { name: { $regex: search, $options: 'i' }, role: 'volunteer' }
        : { role: 'volunteer' };
      return await this.userRepository.countUsers(query);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      throw error;
    }
  }

  async fetchAddresses(userId: string): Promise<IAddressDocument[] | null> {
    try {
      return await this.addressRepository.findAddressesByEntityId(userId);
    } catch (error) {
      console.error(ErrorMessages.ADDRESS_NOT_FOUND, error);
      return null;
    }
  }

  async checkTasksLimit(volunteerId: string): Promise<any> {
    try {
      const checkTasksLimit = await this.assistanceRepository.checkTasksLimit(volunteerId);
      return checkTasksLimit;
    } catch (error) {
      console.error(ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_ASSIGN_FAILED, error);
      return null;
    }
  }
}