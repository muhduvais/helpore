import { inject, injectable } from 'tsyringe';
import { IAdminService } from './interfaces/ServiceInterface';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAddress, IUser } from '../interfaces/userInterface';
import { IAssetRepository } from '../repositories/interfaces/IAssetRepository';
import { IAddUserForm } from '../interfaces/adminInterface';
import bcrypt from 'bcryptjs';
import { IAddressRepository } from '../repositories/interfaces/IAddressRepository';
import { Types } from 'mongoose';
import { IAssistanceRequestRepository } from '../repositories/interfaces/IAssistanceRequestRepository';

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
      console.log('Existing user: ', existingUser)
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
        type: 'user',
      };

      const user = await this.userRepository.createUser(newUser);
      newAddress.entity = user._id as Types.ObjectId;
      await this.addressRepository.addAddress(newAddress);
      const registeredMail = user.email;

      return registeredMail;
    } catch (error) {
      console.error('Error registering the user', error);
      return null;
    }
  }

  async editUser(userId: string, formData: any) {
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
      await this.addressRepository.updateAddress(user._id as string, newAddress);
      const registeredMail = user.email;

      return registeredMail;
    } catch (error) {
      console.error('Error registering the user', error);
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
      throw error;
    }
  }

  async fetchUserDetails(userId: string): Promise<IUser> {
    try {
      return await this.userRepository.findUserDetails(userId);
    } catch (error) {
      console.error('Error fetching user details:', error);
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
      throw error;
    }
  }

  async toggleIsBlocked(action: boolean, userId: string): Promise<boolean> {
    try {
      await this.userRepository.findByIdAndUpdate(userId, { isBlocked: action });
      return true;
    } catch (error) {
      console.error('Error updating block status:', error);
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
      console.error('Error registering the volunteer', error);
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
      console.error('Error finding the users:', error);
      return null;
    }
  }

  async fetchVolunteerDetails(volunteerId: string): Promise<IUser> {
    try {
      return await this.userRepository.findUserDetails(volunteerId);
    } catch (error) {
      console.error('Error fetching the volunteer details: ', error);
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
      throw error;
    }
  }

  async fetchAddresses(userId: string): Promise<IAddress[]> {
    try {
      return await this.addressRepository.findAddressesByEntityId(userId);
    } catch (error) {
      console.error('Error fetching the addresses: ', error);
      return null;
    }
  }

  async checkTasksLimit(volunteerId: string): Promise<any> {
    try {
      const checkTasksLimit = await this.assistanceRepository.checkTasksLimit(volunteerId);
      return checkTasksLimit;
    } catch (error) {
      console.error('Error assigning volunteer: ', error);
      return null;
    }
  }
}