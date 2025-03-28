import { IUser, IAddress, IAsset, IAssetRequestResponse, IAssetRequest, IUserDocument, IAssistanceRequestResponse } from '../../interfaces/user.interface';
import { IAddUserForm } from '../../interfaces/admin.interface';
import { IAssistanceRequest } from '../../interfaces/user.interface';
import { IConversationDocument, IMessageDocument } from '../../interfaces/chat.interface';
import { IDonation } from '../../models/donation.model';
import { IDonationResponse } from '../../repositories/implementation/donation.repository';
import { INotificationDocument } from '../../models/notification.model';

export interface IAuthService {
    registerUser(name: string, email: string, password: string): Promise<string | boolean | null>;
    resendOtp(email: string): Promise<string | null>;
    generateOtp(email: string): Promise<string | null>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    verifyLogin(email: string, password: string): Promise<any>;
    generateAccessToken(userId: string, role: string): Promise<string>;
    generateRefreshToken(userId: string, role: string): Promise<string>;
    verifyRefreshToken(refreshToken: string): Promise<any>;
    findIsBlocked(userId: string): Promise<boolean | null>;
    findOrCreateUser(profile: any): Promise<IUserDocument | null>;
    findUserById(userId: string): Promise<IUser | null>;
    sendResetLink(email: string): Promise<boolean | null>;
    resetPassword(email: string, password: string): Promise<void>;
}


export interface IUserService {
    fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null>;
    fetchUserDetails(userId: string): Promise<IUser | null>;
    countUsers(search: string): Promise<number>;
    toggleIsBlocked(action: boolean, userId: string): Promise<boolean>;
    editUser(userId: string, formData: IAddUserForm): Promise<string | null | undefined>;
    changeProfilePicture(userId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean | null | undefined>;
    changePassword(userId: string, newPassword: string): Promise<boolean>;
    addAddress(addressData: IAddress): Promise<string | null>;
    fetchAddresses(userId: string): Promise<IAddress[] | null>;
    fetchAddress(userId: string): Promise<IAddress | null>;
    uploadCertificateImage(userId: string, file: Express.Multer.File): Promise<string>;
    deleteCertificate(userId: string, certificateUrl: string): Promise<IUser>;
    checkCertificate(userId: string): Promise<boolean | undefined>;
}

export interface IAdminService {
    addUser(formData: IAddUserForm): Promise<string | boolean | null>;
    editUser(userId: string, formData: IAddUserForm): Promise<string | null>;
    fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null>;
    fetchUserDetails(userId: string): Promise<IUser | null>;
    countUsers(search: string): Promise<number>;
    toggleIsBlocked(action: boolean, userId: string): Promise<boolean>;

    addVolunteer(formData: IAddUserForm): Promise<string | boolean | null>;
    fetchVolunteers(search: string, skip: number, limit: number, isActive: any): Promise<IUser[] | null>;
    fetchVolunteerDetails(volunteerId: string): Promise<IUser | null>;
    countVolunteers(search: string): Promise<number>;

    fetchAddresses(entityId: string): Promise<IAddress[] | null>;
}

export interface IVolunteerService {
    addVolunteer(formData: IAddUserForm): Promise<string | boolean | null>;
    fetchVolunteers(search: string, skip: number, limit: number, isActive: string): Promise<IUser[] | null>;
    countVolunteers(search: string): Promise<number>;
    fetchVolunteerDetails(volunteerId: string): Promise<IUser | null>;
    changeProfilePicture(volunteerId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(volunteerId: string, currentPassword: string): Promise<boolean | null | undefined>;
    changePassword(volunteerId: string, newPassword: string): Promise<boolean>;
    toggleIsBlocked(action: boolean, volunteerId: string): Promise<boolean>;
    checkTasksLimit(volunteerId: string): Promise<boolean>;
}

export interface IAssetService {
    addAsset(data: IAsset): Promise<any>;
    uploadAssetImage(file: Express.Multer.File): Promise<string>;
    fetchAssets(search: string, skip: number, limit: number, sortBy: string, filterByAvailability: string): Promise<IAsset[] | null>;
    fetchAssetDetails(assetId: string): Promise<IAsset | null>;
    updateAsset(assetId: string, submitData: any): Promise<IAsset | null>;
    countAssets(search: string): Promise<number>;
    createRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<boolean>;
    countRequests(userId: string, search: string): Promise<number>;
    fetchAssetRequests(
        search: string,
        skip: number,
        limit: number,
        userId: string,
        sort: string,
        status: string,
    ): Promise<IAssetRequestResponse[] | null>;
    fetchMyAssetRequests(search: string, filter: string, skip: number, limit: number, userId: string): Promise<IAssetRequestResponse[] | null>;
    countMyAssetRequests(userId: string, search: string, filter: string): Promise<number | null>;
    findRequestDetails(userId: string, assetId: string): Promise<IAssetRequest[]>
    updateStatus(requestId: string, status: string, comment: string): Promise<any>;
    checkIsRequestLimit(userId: string, quantity: number): Promise<boolean | null>;
}

export interface IAssistanceRequestService {
    createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean>;
    fetchAssistanceRequests(search?: string, filter?: string, skip?: number, limit?: number, sort?: string, priority?: string): Promise<IAssistanceRequestResponse[] | null>;
    fetchProcessingRequests(search: string, filter: string, skip: number, limit: number, volunteerId: string
    ): Promise<IAssistanceRequestResponse[] | null>;
    countAssistanceRequests(search?: string, filter?: string, priority?: string): Promise<number>;
    countProcessingRequests(search?: string, filter?: string, volunteerId?: string): Promise<number>;
    getNearbyRequests(volunteerId: string, page: number, search: string, filter: string): Promise<any>;
    updateRequestStatus(requestId: string, volunteerId: string, action: string): Promise<string>;
    fetchAssistanceRequestDetails(requestId: string): Promise<IAssistanceRequest | null>;
    checkTasksLimit(volunteerId: string): Promise<boolean | null>;
    assignVolunteer(requestId: string, volunteerId: string): Promise<boolean>;
}

export interface IDonationService {
    createCheckoutSession(donationData: any): Promise<any>;
    verifySession(sessionId: string): Promise<any>;
    handleWebhookEvent(event: any): Promise<any>;
    getUserDonationHistory(userId: string): Promise<any>;
    constructEvent(payload: any, signature: any, secret: any): Promise<any>;
    generateAndSendReceipt(donationId: string, userId: string): Promise<Buffer>;
    getAllDonations(page: number, limit: number, search: string, campaign: string): Promise<IDonation[] | null>;
    totalDonationsCount(search: string, campaign: string): Promise<number | null>;
}

export interface IChatService {
    sendMessage(senderId: string, receiverId: string, content: string, requestId: string, senderType: 'users' | 'volunteers', receiverType: 'users' | 'volunteers'): Promise<IMessageDocument>;
    getConversationMessages(requestId: string): Promise<IMessageDocument[]>;
    getUserConversations(userId: string): Promise<IConversationDocument[]>;
    markConversationAsRead(conversationId: string, userId: string): Promise<void>;
}

export interface INotificationService {
    createNotification(
        userId: string,
        userType: 'users' | 'volunteers',
        type: 'message' | 'system',
        content: string,
        requestId?: string,
        sender?: string,
        senderType?: 'users' | 'volunteers'
    ): Promise<INotificationDocument>;
    getUserNotifications(userId: string): Promise<INotificationDocument[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    deleteAllNotifications(userId: string): Promise<void>;
}

export interface IOtpService {
    sendOtpEmail(email: string, otp: string): Promise<boolean>
}

export interface IMeetingService {
    generateToken( userId: string, roomId: string, userName: string ): Promise<string>;
    verifyToken(token: string): Promise<boolean>;
}
