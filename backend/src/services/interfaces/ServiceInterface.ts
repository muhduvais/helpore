import { IUser, IAddress, IAsset, IAssetRequestResponse, IAssetRequest, IUserDocument } from '../../interfaces/userInterface';
import { IAddUserForm } from '../../interfaces/adminInterface';
import { IAssistanceRequest } from '../../interfaces/userInterface';

export interface IAuthService {
    registerUser(name: string, email: string, password: string): Promise<string | boolean>;
    resendOtp(email: string): Promise<string | null>;
    generateOtp(email: string): Promise<string | null>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    verifyLogin(email: string, password: string): Promise<any>;
    generateAccessToken(userId: string, role: string): Promise<string>;
    generateRefreshToken(userId: string, role: string): Promise<string>;
    verifyRefreshToken(refreshToken: string): Promise<any>;
    findIsBlocked(userId: string): Promise<boolean>;
    findOrCreateUser(profile: any): Promise<IUserDocument | null>;
    findUserById(userId: string): Promise<IUser | null>;
    sendResetLink(email: string): Promise<boolean | null>;
    resetPassword(email: string, password: string): Promise<void>;
}


export interface IUserService {
    fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null>;
    fetchUserDetails(userId: string): Promise<IUser>;
    countUsers(search: string): Promise<number>;
    toggleIsBlocked(action: boolean, userId: string): Promise<boolean>;
    editUser(userId: string, formData: IAddUserForm): Promise<string | null>;
    changeProfilePicture(userId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean | null>;
    changePassword(userId: string, newPassword: string): Promise<boolean>;
    addAddress(addressData: IAddress): Promise<string>;
    fetchAddresses(userId: string): Promise<IAddress[]>;
    fetchAddress(userId: string): Promise<IAddress>;
}

export interface IAdminService {
    addUser(formData: IAddUserForm): Promise<string | boolean | null>;
    editUser(userId: string, formData: IAddUserForm): Promise<string | null>;
    fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null>;
    fetchUserDetails(userId: string): Promise<IUser>;
    countUsers(search: string): Promise<number>;
    toggleIsBlocked(action: boolean, userId: string): Promise<boolean>;

    addVolunteer(formData: IAddUserForm): Promise<string | boolean | null>;
    fetchVolunteers(search: string, skip: number, limit: number, isActive: any): Promise<IUser[] | null>;
    fetchVolunteerDetails(volunteerId: string): Promise<IUser>;
    countVolunteers(search: string): Promise<number>;

    fetchAddresses(entityId: string): Promise<IAddress[]>;
}

export interface IVolunteerService {
    addVolunteer(formData: IAddUserForm): Promise<string | boolean | null>;
    fetchVolunteers(search: string, skip: number, limit: number, isActive: string): Promise<IUser[] | null>;
    countVolunteers(search: string): Promise<number>;
    fetchVolunteerDetails(volunteerId: string): Promise<IUser>;
    changeProfilePicture(volunteerId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(volunteerId: string, currentPassword: string): Promise<boolean | null>;
    changePassword(volunteerId: string, newPassword: string): Promise<boolean>;
    toggleIsBlocked(action: boolean, volunteerId: string): Promise<boolean>;
    checkTasksLimit(volunteerId: string): Promise<boolean>;
}

export interface IAssetService {
    addAsset(data: IAsset): Promise<any>;
    uploadAssetImage(file: Express.Multer.File): Promise<string>;
    fetchAssets(search: string, skip: number, limit: number): Promise<IAsset[] | null>;
    fetchAssetDetails(assetId: string): Promise<IAsset>;
    updateAsset(assetId: string, submitData: any): Promise<IAsset>;
    countAssets(search: string): Promise<number>;
    createAssetRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<boolean>;
    countAssetRequests(search: string, status: string): Promise<number>;
    fetchAssetRequests(search: string, skip: number, limit: number, userId: string, sort: string, status: string): Promise<IAssetRequestResponse[] | null>;
    findRequestDetails(userId: string, assetId: string): Promise<IAssetRequest[]>
    updateStatus(requestId: string, status: string, comment: string): Promise<any>;
}

export interface IAssistanceRequestService {
    createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean>;
    fetchAssistanceRequests(search?: string, filter?: string, skip?: number, limit?: number, sort?: string, priority?: string): Promise<IAssistanceRequest[]>;
    countAssistanceRequests(search?: string, filter?: string, priority?: string): Promise<number>;
    getNearbyRequests(volunteerId: string, page: number, search: string, filter: string): Promise<any>;
    updateRequestStatus(requestId: string, volunteerId: string, action: string): Promise<string>;
    fetchAssistanceRequestDetails(requestId: string): Promise<IAssistanceRequest | null>;
    checkTasksLimit(volunteerId: string): Promise<boolean>;
    assignVolunteer(requestId: string, volunteerId: string): Promise<boolean>;
}

export interface IOtpService {
    sendOtpEmail(email: string, otp: string): Promise<boolean>;
}
