import { UpdateUserRequestDTO } from "../../dtos/requests/updateUser-request.dto";
import { UserDTO } from "../../dtos/user.dto";
import { IUser } from "../../interfaces/user.interface";

export interface IUserService {
    fetchUsers(search: string, skip: number, limit: number): Promise<UserDTO[] | null>;
    fetchUserDetails(userId: string): Promise<UserDTO | null>;
    countUsers(search: string): Promise<number>;
    toggleIsBlocked(action: boolean, userId: string): Promise<boolean>;
    editUser(userId: string, formData: UpdateUserRequestDTO): Promise<string | null | undefined>;
    changeProfilePicture(userId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean | null | undefined>;
    changePassword(userId: string, newPassword: string): Promise<boolean>;
    uploadCertificateImage(userId: string, file: Express.Multer.File): Promise<string>;
    deleteCertificate(userId: string, certificateUrl: string): Promise<IUser>;
    checkCertificate(userId: string): Promise<boolean | undefined>;
}