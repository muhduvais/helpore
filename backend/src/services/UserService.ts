import { injectable, inject } from 'tsyringe';
import { BaseService } from './BaseService';
import { IUserService } from './interfaces/ServiceInterface';
import { IUser, IAddress, IUserDocument } from '../interfaces/userInterface';
import { IAddUserForm } from '../interfaces/adminInterface';
import cloudinary from 'cloudinary';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAddressRepository } from '../repositories/interfaces/IAddressRepository';

@injectable()
export class UserService extends BaseService<IUserDocument> implements IUserService {
    constructor(
        @inject('IUserRepository') private readonly userRepository: IUserRepository,
        @inject('IAddressRepository') private readonly addressRepository: IAddressRepository
    ) {
        super(userRepository);
    }

    async fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'user' } : { role: 'user' };
            return await this.userRepository.findUsers(query, skip, limit);
        } catch (error) {
            console.error('Error finding users:', error);
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
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'user' } : { role: 'user' };
            return await this.userRepository.countUsers(query);
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
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

    async toggleIsBlocked(action: boolean, userId: string): Promise<boolean> {
        try {
            await this.userRepository.findByIdAndUpdate(userId, { isBlocked: action });
            return true;
        } catch (error) {
            console.error('Error updating block status:', error);
            throw error;
        }
    }

    async changeProfilePicture(userId: string, profilePicture: string): Promise<boolean> {
        try {
            await this.userRepository.updateProfilePicture(userId, profilePicture);
            return true;
        } catch (error) {
            console.error('Error updating the profile picture: ', error);
            return false;
        }
    }

    async verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean | null> {
        try {
            const password = await this.userRepository.findPassword(userId);
            return bcrypt.compare(currentPassword, password);
        } catch (error) {
            console.error('Error updating the password: ', error);
            return null;
        }
    }

    async changePassword(userId: string, newPassword: string): Promise<boolean> {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.updatePassword(userId, hashedPassword);
            return true;
        } catch (error) {
            console.error('Error updating the password: ', error);
            return false;
        }
    }

    async addAddress(addressData: IAddress): Promise<string> {
        try {
            const newAddress = await this.addressRepository.addAddress(addressData);
            return String(newAddress._id);
        } catch (error) {
            console.error('Error creating the address: ', error);
            return null;
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

    async fetchAddress(userId: string): Promise<IAddress> {
        try {
            return await this.addressRepository.findAddressByEntityId(userId);
        } catch (error) {
            console.error('Error fetching the addresses: ', error);
            return null;
        }
    }

    async uploadCertificateImage(userId: string, file: Express.Multer.File): Promise<string> {
        try {
            if (!file.path) {
                throw new Error('No file path provided');
            }

            const randomDigits = Math.floor(100000 + Math.random() * 900000);

            console.log('Attempting to upload to Cloudinary:', {
                path: file.path,
                publicId: `user-certificate-images/${randomDigits}`
            });

            const uploadResponse = await cloudinary.v2.uploader.upload(file.path, {
                public_id: `user-certificate-images/${randomDigits}`,
                folder: 'user_certificates',
                resource_type: 'auto',
                secure: true,
            });

            console.log('Cloudinary upload successful:', uploadResponse.secure_url);

            await this.userRepository.updateUserCertificates(userId, uploadResponse.secure_url)

            return uploadResponse.secure_url;
        } catch (error) {
            console.error('Error in uploading certificate service:', error);
            throw error;
        }
    }

    async deleteCertificate(userId: string, certificateUrl: string): Promise<IUser> {
        try {
            const publicId = this.extractPublicIdFromUrl(certificateUrl);

            if (!publicId) {
                throw new Error('Invalid certificate URL');
            }

            await this.userRepository.deleteFile(publicId);

            const updatedUser = await this.userRepository.removeCertificateUrl(userId, certificateUrl);

            return updatedUser;
        } catch (error) {
            console.error('Service - Error deleting certificate:', error);
            throw error;
        }
    };

    extractPublicIdFromUrl(url: string) {
        try {
            if (!url.includes('cloudinary.com')) {
                throw new Error('Not a Cloudinary URL');
            }

            const uploadIndex = url.indexOf('/upload/');
            if (uploadIndex === -1) {
                throw new Error('Invalid Cloudinary URL format');
            }

            let fullPath = url.substring(uploadIndex + 8);

            fullPath = fullPath.replace(/^v\d+\//, '');

            const extensionIndex = fullPath.lastIndexOf('.');
            if (extensionIndex !== -1) {
                fullPath = fullPath.substring(0, extensionIndex);
            }

            return fullPath;
        } catch (error) {
            console.error('Error extracting public ID from URL:', error);
            return null;
        }
    }
}