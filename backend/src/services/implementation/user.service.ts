import { injectable, inject } from "tsyringe";
import { IUserService } from "../interfaces/ServiceInterface";
import { IUser } from "../../interfaces/user.interface";
import bcrypt from "bcryptjs";
import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { IAddressRepository } from "../../repositories/interfaces/IAddressRepository";
import { uploadToCloudinary } from "../../utils";
import { ErrorMessages } from "../../constants/errorMessages";
import { toUserDTO, toUserListDTO } from "../../mappers/user.mapper";
import { UserDTO } from "../../dtos/user.dto";
import { IAddress } from "../../interfaces/address.interface";
import { UpdateUserRequestDTO } from "../../dtos/requests/updateUser-request.dto";
import { UserMapper } from "../../mappers/user-request.mapper";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository,
    @inject("IAddressRepository")
    private readonly _addressRepository: IAddressRepository
  ) {}

  async fetchUsers(
    search: string,
    skip: number,
    limit: number
  ): Promise<UserDTO[] | null> {
    try {
      const query = search
        ? { name: { $regex: search, $options: "i" }, role: "user" }
        : { role: "user" };
      const users = await this._userRepository.findUsers(query, skip, limit);
      if (!users) {
        throw new Error(ErrorMessages.USER_NOT_FOUND);
      }
      return toUserListDTO(users);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      throw new Error(ErrorMessages.USER_FETCH_FAILED);
    }
  }

  async fetchUserDetails(userId: string): Promise<UserDTO | null> {
    try {
      const user = await this._userRepository.findUserDetails(userId);
      if (!user) {
        throw new Error(ErrorMessages.USER_NOT_FOUND);
      }
      return toUserDTO(user);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      throw new Error(ErrorMessages.USER_FETCH_FAILED);
    }
  }

  async countUsers(search: string): Promise<number> {
    try {
      const query = search
        ? { name: { $regex: search, $options: "i" }, role: "user" }
        : { role: "user" };
      return await this._userRepository.countUsers(query);
    } catch (error) {
      console.error(ErrorMessages.USER_FETCH_FAILED, error);
      throw new Error(ErrorMessages.USER_FETCH_FAILED);
    }
  }

  async editUser(
    userId: string,
    dto: UpdateUserRequestDTO
  ): Promise<string | null> {
    try {
      const userData = UserMapper.toUpdateUserEntity(dto);
      const addressData = UserMapper.toUpdateAddressEntity(dto);

      const user = await this._userRepository.updateUser(userId, userData);
      if (!user) return null;

      await this._addressRepository.updateAddress(
        user._id as string,
        addressData
      );

      return user.email;
    } catch (error) {
      console.error(ErrorMessages.USER_UPDATE_FAILED, error);
      return null;
    }
  }

  async toggleIsBlocked(action: boolean, userId: string): Promise<boolean> {
    try {
      await this._userRepository.findByIdAndUpdate(userId, {
        isBlocked: action,
      });
      return true;
    } catch (error) {
      console.error(ErrorMessages.BLOCK_STATUS_UPDATE_FAILED, error);
      throw new Error(ErrorMessages.BLOCK_STATUS_UPDATE_FAILED);
    }
  }

  async changeProfilePicture(
    userId: string,
    profilePicture: string
  ): Promise<boolean> {
    try {
      await this._userRepository.updateProfilePicture(userId, profilePicture);
      return true;
    } catch (error) {
      console.error(ErrorMessages.PROFILE_UPDATE_FAILED, error);
      return false;
    }
  }

  async verifyCurrentPassword(
    userId: string,
    currentPassword: string
  ): Promise<boolean | null | undefined> {
    try {
      const password = await this._userRepository.findPassword(userId);
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
      await this._userRepository.updatePassword(userId, hashedPassword);
      return true;
    } catch (error) {
      console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
      return false;
    }
  }

  async uploadCertificateImage(
    userId: string,
    file: Express.Multer.File
  ): Promise<string> {
    try {
      if (!file) {
        throw new Error(ErrorMessages.NO_IMAGE_UPLOADED);
      }

      const uniqueId =
        Date.now().toString() +
        "-" +
        Math.random().toString(36).substring(2, 10);

      const results = await uploadToCloudinary(
        file,
        "medical-certificates",
        uniqueId
      );

      const result = results[0];

      await this._userRepository.updateUserCertificates(
        userId,
        result.secure_url
      );

      return result.secure_url;
    } catch (error) {
      console.error(ErrorMessages.CERTIFICATE_UPLOAD_FAILED, error);
      throw new Error(ErrorMessages.CERTIFICATE_UPLOAD_FAILED);
    }
  }

  async deleteCertificate(
    userId: string,
    certificateUrl: string
  ): Promise<IUser> {
    try {
      const publicId = this.extractPublicIdFromUrl(certificateUrl);
      console.log("publicId: ", publicId);

      if (!publicId) {
        throw new Error(ErrorMessages.CERTIFICATE_URL_REQUIRED);
      }

      await this._userRepository.deleteFile(publicId);

      const updatedUser = await this._userRepository.removeCertificateUrl(
        userId,
        certificateUrl
      );

      return updatedUser;
    } catch (error) {
      console.error(ErrorMessages.CERTIFICATE_DELETE_FAILED, error);
      throw new Error(ErrorMessages.CERTIFICATE_DELETE_FAILED);
    }
  }

  extractPublicIdFromUrl(url: string) {
    try {
      if (!url.includes("cloudinary.com")) {
        throw new Error(ErrorMessages.NOT_CLOUDINARY_URL);
      }

      const uploadIndex = url.indexOf("/upload/");
      if (uploadIndex === -1) {
        throw new Error(ErrorMessages.INVALID_CLOUDINARY_URL_FORMAT);
      }

      let fullPath = url.substring(uploadIndex + 8);

      fullPath = fullPath.replace(/^v\d+\//, "");

      const extensionIndex = fullPath.lastIndexOf(".");
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
      return await this._userRepository.checkCertificate(userId);
    } catch (error) {
      console.error(ErrorMessages.CERTIFICATE_CHECK_FAILED, error);
      throw new Error(ErrorMessages.CERTIFICATE_CHECK_FAILED);
    }
  }
}
