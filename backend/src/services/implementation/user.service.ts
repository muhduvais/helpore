import { injectable, inject } from 'tsyringe';
import { BaseService } from './base.service';
import { IUserService } from '../interfaces/ServiceInterface';
import { IUser, IAddress, IUserDocument } from '../../interfaces/user.interface';
import { IAddUserForm } from '../../interfaces/admin.interface';
import cloudinary from 'cloudinary';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IAddressRepository } from '../../repositories/interfaces/IAddressRepository';
import { uploadToCloudinary } from '../../utils';
import { ErrorMessages } from '../../constants/errorMessages';

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
            console.error(ErrorMessages.USER_FETCH_FAILED, error);
            throw new Error(ErrorMessages.USER_FETCH_FAILED);
        }
    }

    async fetchUserDetails(userId: string): Promise<IUser | null> {
        try {
            return await this.userRepository.findUserDetails(userId);
        } catch (error) {
            console.error(ErrorMessages.USER_FETCH_FAILED, error);
            throw new Error(ErrorMessages.USER_FETCH_FAILED);
        }
    }

    async countUsers(search: string): Promise<number> {
        try {
            const query = search ? { name: { $regex: search, $options: 'i' }, role: 'user' } : { role: 'user' };
            return await this.userRepository.countUsers(query);
        } catch (error) {
            console.error(ErrorMessages.USER_FETCH_FAILED, error);
            throw new Error(ErrorMessages.USER_FETCH_FAILED);
        }
    }

    async editUser(userId: string, formData: any): Promise<string | null | undefined> {
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
            if (!user) return;
            await this.addressRepository.updateAddress(user._id as string, newAddress);
            const registeredMail = user.email;

            return registeredMail;
        } catch (error) {
            console.error(ErrorMessages.USER_UPDATE_FAILED, error);
            return null;
        }
    }

    async toggleIsBlocked(action: boolean, userId: string): Promise<boolean> {
        try {
            await this.userRepository.findByIdAndUpdate(userId, { isBlocked: action });
            return true;
        } catch (error) {
            console.error(ErrorMessages.BLOCK_STATUS_UPDATE_FAILED, error);
            throw new Error(ErrorMessages.BLOCK_STATUS_UPDATE_FAILED);
        }
    }

    async changeProfilePicture(userId: string, profilePicture: string): Promise<boolean> {
        try {
            await this.userRepository.updateProfilePicture(userId, profilePicture);
            return true;
        } catch (error) {
            console.error(ErrorMessages.PROFILE_UPDATE_FAILED, error);
            return false;
        }
    }

    async verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean | null | undefined> {
        try {
            const password = await this.userRepository.findPassword(userId);
            if (!password) return;
            return bcrypt.compare(currentPassword, password);
        } catch (error) {
            console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
            return null;
        }
    }

    async changePassword(userId: string, newPassword: string): Promise<boolean> {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.updatePassword(userId, hashedPassword);
            return true;
        } catch (error) {
            console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
            return false;
        }
    }

    async addAddress(addressData: IAddress): Promise<string | null> {
        try {
            const newAddress = await this.addressRepository.addAddress(addressData);
            return String(newAddress._id);
        } catch (error) {
            console.error(ErrorMessages.ADDRESS_CREATE_FAILED, error);
            return null;
        }
    }

    async fetchAddresses(userId: string): Promise<IAddress[] | null> {
        try {
            return await this.addressRepository.findAddressesByEntityId(userId);
        } catch (error) {
            console.error(ErrorMessages.ADDRESS_FETCH_FAILED, error);
            return null;
        }
    }

    async fetchAddress(userId: string): Promise<IAddress | null> {
        try {
            return await this.addressRepository.findAddressByEntityId(userId);
        } catch (error) {
            console.error(ErrorMessages.ADDRESS_FETCH_FAILED, error);
            return null;
        }
    }

    async uploadCertificateImage(userId: string, file: Express.Multer.File): Promise<string> {
        try {
            if (!file) {
                throw new Error(ErrorMessages.NO_IMAGE_UPLOADED);
            }

            const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);

            const result = await uploadToCloudinary(file, 'medical-certificates', uniqueId);

            await this.userRepository.updateUserCertificates(userId, result.secure_url)

            return result.secure_url;
        } catch (error) {
            console.error(ErrorMessages.CERTIFICATE_UPLOAD_FAILED, error);
            throw new Error(ErrorMessages.CERTIFICATE_UPLOAD_FAILED);
        }
    }

    async deleteCertificate(userId: string, certificateUrl: string): Promise<IUser> {
        try {
            const publicId = this.extractPublicIdFromUrl(certificateUrl);
            console.log('publicId: ', publicId)

            if (!publicId) {
                throw new Error(ErrorMessages.CERTIFICATE_URL_REQUIRED);
            }

            await this.userRepository.deleteFile(publicId);

            const updatedUser = await this.userRepository.removeCertificateUrl(userId, certificateUrl);

            return updatedUser;
        } catch (error) {
            console.error(ErrorMessages.CERTIFICATE_DELETE_FAILED, error);
            throw new Error(ErrorMessages.CERTIFICATE_DELETE_FAILED);
        }
    };

    extractPublicIdFromUrl(url: string) {
        try {
            if (!url.includes('cloudinary.com')) {
                throw new Error(ErrorMessages.NOT_CLOUDINARY_URL);
            }

            const uploadIndex = url.indexOf('/upload/');
            if (uploadIndex === -1) {
                throw new Error(ErrorMessages.INVALID_CLOUDINARY_URL_FORMAT);
            }

            let fullPath = url.substring(uploadIndex + 8);

            fullPath = fullPath.replace(/^v\d+\//, '');

            const extensionIndex = fullPath.lastIndexOf('.');
            if (extensionIndex !== -1) {
                fullPath = fullPath.substring(0, extensionIndex);
            }

            fullPath = decodeURIComponent(fullPath);

            return fullPath;
        } catch (error) {
            console.error(ErrorMessages.EXTRACT_PUBLIC_ID_FAILED, error);
            return null;
        }
    }

    async checkCertificate(userId: string): Promise<boolean | undefined> {
        try {
            return await this.userRepository.checkCertificate(userId);
        } catch (error) {
            console.error(ErrorMessages.CERTIFICATE_CHECK_FAILED, error);
            throw new Error(ErrorMessages.CERTIFICATE_CHECK_FAILED);
        }
    };
}