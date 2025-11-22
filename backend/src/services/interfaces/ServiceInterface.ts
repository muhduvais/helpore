import { IUser, IAsset, IAssetRequestResponse, IAssetRequest, IUserDocument, IAssistanceRequestResponse } from '../../interfaces/user.interface';
import { IAddUserForm } from '../../interfaces/admin.interface';
import { IAssistanceRequest } from '../../interfaces/user.interface';
import { IConversationDocument, IMessageDocument } from '../../interfaces/chat.interface';
import { IDonation } from '../../models/donation.model';
import { INotificationDocument } from '../../models/notification.model';
import { IMeeting } from '../../interfaces/meeting.interface';
import { UserDTO } from '../../dtos/user.dto';
import { IAddressDocument } from '../../interfaces/address.interface';
import { NotificationDTO } from '../../dtos/notification.dto';
import { MeetingDTO } from '../../dtos/meeting.dto';
import { MessageDTO } from '../../dtos/message.dto';
import { ConversationDTO } from '../../dtos/conversation.dto';
import { AssetDTO } from '../../dtos/asset.dto';
import { AssetRequestDTO } from '../../dtos/asset-request.dto';
import { AddressDTO } from '../../dtos/address.dto';
import { AssistanceRequestDTO } from '../../dtos/assistance-request.dto';
import { DonationDTO } from '../../dtos/donation.dto';

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
    fetchUsers(search: string, skip: number, limit: number): Promise<UserDTO[] | null>;
    fetchUserDetails(userId: string): Promise<UserDTO | null>;
    countUsers(search: string): Promise<number>;
    toggleIsBlocked(action: boolean, userId: string): Promise<boolean>;
    editUser(userId: string, formData: IAddUserForm): Promise<string | null | undefined>;
    changeProfilePicture(userId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean | null | undefined>;
    changePassword(userId: string, newPassword: string): Promise<boolean>;
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

    fetchAddresses(entityId: string): Promise<IAddressDocument[] | null>;
}

export interface IVolunteerService {
    addVolunteer(formData: IAddUserForm): Promise<string | boolean | null>;
    fetchVolunteers(search: string, skip: number, limit: number, isActive: string): Promise<UserDTO[] | null>;
    editVolunteer(volunteerId: string, formData: any): Promise<string | null | undefined>;
    countVolunteers(search: string): Promise<number>;
    fetchVolunteerDetails(volunteerId: string): Promise<UserDTO | null>;
    changeProfilePicture(volunteerId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(volunteerId: string, currentPassword: string): Promise<boolean | null | undefined>;
    changePassword(volunteerId: string, newPassword: string): Promise<boolean>;
    toggleIsBlocked(action: boolean, volunteerId: string): Promise<boolean>;
    checkTasksLimit(volunteerId: string): Promise<boolean>;
    fetchAddress(volunteerId: string): Promise<AddressDTO | null>;
}

export interface IAssetService {
    addAsset(data: IAsset): Promise<any>;
    uploadAssetImage(file: Express.Multer.File): Promise<string>;
    fetchAssets(search: string, skip: number, limit: number, sortBy: string, filterByAvailability: string): Promise<AssetDTO[] | null>;
    fetchAssetDetails(assetId: string): Promise<AssetDTO | null>;
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
    ): Promise<AssetRequestDTO[] | null>;
    fetchMyAssetRequests(search: string, filter: string, skip: number, limit: number, userId: string): Promise<AssetRequestDTO[] | null>;
    countMyAssetRequests(userId: string, search: string, filter: string): Promise<number | null>;
    findRequestDetails(userId: string, assetId: string): Promise<AssetRequestDTO | null>
    updateStatus(requestId: string, status: string, comment: string): Promise<any>;
    checkIsRequestLimit(userId: string, quantity: number): Promise<boolean | null>;
}

export interface IAssistanceRequestService {
    createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean>;
    fetchAssistanceRequests(search?: string, filter?: string, skip?: number, limit?: number, sort?: string, priority?: string): Promise<AssistanceRequestDTO[] | null>;
    fetchMyAssistanceRequests(
        userId: string, search: string, filter: string, skip: number, limit: number, sort: string, priority: string
    ): Promise<AssistanceRequestDTO[] | null>;
    fetchProcessingRequests(search: string, filter: string, skip: number, limit: number, volunteerId: string
    ): Promise<AssistanceRequestDTO[] | null>;
    countAssistanceRequests(search?: string, filter?: string, priority?: string): Promise<number>;
    countMyAssistanceRequests(userId: string, search: string, filter: string, priority: string): Promise<number>;
    countProcessingRequests(search?: string, filter?: string, volunteerId?: string): Promise<number>;
    getNearbyRequests(volunteerId: string, page: number, search: string, filter: string): Promise<any>;
    updateRequestStatus(requestId: string, volunteerId: string, action: string): Promise<string>;
    fetchAssistanceRequestDetails(requestId: string): Promise<AssistanceRequestDTO | null>;
    checkTasksLimit(volunteerId: string): Promise<boolean | null>;
    assignVolunteer(requestId: string, volunteerId: string): Promise<boolean>;
    fetchPendingRequests(): Promise<AssistanceRequestDTO[] | null>;
}

export interface IDonationService {
    createCheckoutSession(donationData: any): Promise<any>;
    verifySession(sessionId: string): Promise<any>;
    handleWebhookEvent(event: any): Promise<any>;
    getUserDonationHistory(userId: string): Promise<DonationDTO[]>;
    getRecentDonations(): Promise<DonationDTO[] | null>;
    constructEvent(payload: any, signature: any, secret: any): Promise<any>;
    generateAndSendReceipt(donationId: string, userId?: string): Promise<Buffer>;
    getAllDonations(page: number, limit: number, search: string, campaign: string): Promise<DonationDTO[] | null>;
    totalDonationsCount(search: string, campaign: string): Promise<number | null>;
}

export interface IChatService {
    sendMessage(senderId: string, receiverId: string, content: string, requestId: string, senderType: 'users' | 'volunteers', receiverType: 'users' | 'volunteers', uploadedMediaUrls: string[]): Promise<IMessageDocument>;
    uploadMedia(mediaFiles: Express.Multer.File[], requestId: string): Promise<string[]>
    getConversationMessages(requestId: string): Promise<MessageDTO[]>;
    getUserConversations(userId: string): Promise<ConversationDTO[]>;
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
    getUserNotifications(userId: string): Promise<NotificationDTO[]>;
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
    createMeeting(adminId: string, title: string, participants: string[], scheduledTime: Date | string): Promise<IMeeting>;
    getMeetings(page: number, limit: number, search: string, filter: string): Promise<MeetingDTO[] | null>;
    totalMeetingsCount(search: string, filter: string): Promise<number | null>;
    totalUserMeetingsCount(userId: string, search: string, filter: string): Promise<number | null>;
    getMeetingById(meetingId: string): Promise<MeetingDTO | null>;
    getUserMeetings(userId: string, page: number, limit: number, search: string, filter: string): Promise<MeetingDTO[] | null>;
    updateMeetingStatus(meetingId: string, status: 'scheduled' | 'active' | 'completed'): Promise<IMeeting | null>;
    generateToken(userId: string, roomId: string, userName: string): Promise<string>;
    deleteMeeting(meetingId: string): Promise<IMeeting | null>;
    getUpcomingMeetings(): Promise<MeetingDTO[] | null>;
}
