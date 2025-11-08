import { container } from "tsyringe";

// Repositories - Interfaces
import { IUserRepository } from "./repositories/interfaces/IUserRepository";
import { IAddressRepository } from "./repositories/interfaces/IAddressRepository";
import { IAssetRepository } from "./repositories/interfaces/IAssetRepository";
import { IAssetRequestRepository } from "./repositories/interfaces/IAssetRequestRepository";
import { IAssistanceRequestRepository } from "./repositories/interfaces/IAssistanceRequestRepository";
import { IAuthRepository } from "./repositories/interfaces/IAuthRepository";
import { IOtpRepository } from "./repositories/interfaces/IOtpRepository";
import { IDonationRepository } from "./repositories/interfaces/IDonationRepository";
import { IChatRepository } from "./repositories/interfaces/IChatRepository";
import { INotificationRepository } from "./repositories/interfaces/INotificationRepository";

// Services - Interfaces
import { IAdminService } from './services/interfaces/ServiceInterface';
import { IUserService } from "./services/interfaces/ServiceInterface";
import { IVolunteerService } from "./services/interfaces/ServiceInterface";
import { IAssetService } from "./services/interfaces/ServiceInterface";
import { IAssistanceRequestService } from "./services/interfaces/ServiceInterface";
import { IAuthService } from "./services/interfaces/ServiceInterface";
import { IDonationService } from "./services/interfaces/ServiceInterface";
import { IChatService } from "./services/interfaces/ServiceInterface";
import { INotificationService } from "./services/interfaces/ServiceInterface";
import { IMeetingService } from "./services/interfaces/ServiceInterface";

// Controllers - Interfaces
import { IAuthController } from './controllers/interfaces/IAuthController';
import { IUserController } from './controllers/interfaces/IUserController';
import { IVolunteerController } from "./controllers/interfaces/IVolunteerController";
import { IAssetController } from './controllers/interfaces/IAssetController';
import { IAssetRequestController } from "./controllers/interfaces/IAssetRequestController";
import { IAssistanceRequestController } from "./controllers/interfaces/IAssistanceRequestController";
import { IAddressController } from "./controllers/interfaces/IAddressController";
import { IDonationController } from "./controllers/interfaces/IDonationController";
import { IChatController } from "./controllers/interfaces/IChatController";
import { INotificationController } from "./controllers/interfaces/INotificationController";
import { IMeetingController } from "./controllers/interfaces/IMeetingController";

// Repositories
import { UserRepository } from "./repositories/implementation/user.repository";
import { AddressRepository } from "./repositories/implementation/address.repository";
import { AssetRepository } from "./repositories/implementation/asset.repository";
import { AssetRequestRepository } from "./repositories/implementation/asset-request.repository";
import { AssistanceRequestRepository } from "./repositories/implementation/assistance-request.repository";
import { AuthRepository } from "./repositories/implementation/auth.repository";
import { OtpRepository } from "./repositories/implementation/otp.repository";
import { DonationRepository } from "./repositories/implementation/donation.repository";
import { ChatRepository } from "./repositories/implementation/chat.repository";
import { NotificationRepository } from "./repositories/implementation/notification.repository";

// Services
import { AdminService } from './services/implementation/admin.service';
import { UserService } from './services/implementation/user.service';
import { VolunteerService } from './services/implementation/volunteer.service';
import { AssetService } from './services/implementation/asset.service';
import { AssistanceRequestService } from './services/implementation/assistance-request.service';
import { AuthService } from './services/implementation/auth.service';
import { DonationService } from "./services/implementation/donation.service";
import { ChatService } from "./services/implementation/chat.service";
import { NotificationService } from "./services/implementation/notification.service";
import { MeetingService } from "./services/implementation/meeting.service";

// Controllers
import { AuthController } from "./controllers/implementation/auth.controller";
import { UserController } from "./controllers/implementation/user.controller";
import { VolunteerController } from "./controllers/implementation/volunteer.controller";
import { AssetController } from "./controllers/implementation/asset.controller";
import { AssetRequestController } from "./controllers/implementation/asset-request.controller";
import { AssistanceRequestController } from "./controllers/implementation/assistance-request.controller";
import { AddressController } from "./controllers/implementation/address.controller";
import { DonationController } from "./controllers/implementation/donation.controller";
import { ChatController } from "./controllers/implementation/chat.controller";
import { NotificationController } from "./controllers/implementation/notification.controller";
import { MeetingController } from "./controllers/implementation/meeting.controller";
import { IMeetingRepository } from "./repositories/interfaces/IMeetingRepository";
import { MeetingRepository } from "./repositories/implementation/meeting.repository";
import { IAddressService } from "./services/interfaces/IAddressService";
import { AddressService } from "./services/implementation/address.service";

export function registerDependencies() {
    try {
        // Register Repositories
        container.register<IUserRepository>("IUserRepository", { useClass: UserRepository });
        container.register<IAddressRepository>("IAddressRepository", { useClass: AddressRepository });
        container.register<IAssetRepository>("IAssetRepository", { useClass: AssetRepository });
        container.register<IAssetRequestRepository>("IAssetRequestRepository", { useClass: AssetRequestRepository });
        container.register<IAssistanceRequestRepository>("IAssistanceRequestRepository", { useClass: AssistanceRequestRepository });
        container.register<IAuthRepository>("IAuthRepository", { useClass: AuthRepository });
        container.register<IOtpRepository>("IOtpRepository", { useClass: OtpRepository });
        container.register<IDonationRepository>("IDonationRepository", { useClass: DonationRepository });
        container.register<IChatRepository>("IChatRepository", { useClass: ChatRepository });
        container.register<INotificationRepository>("INotificationRepository", { useClass: NotificationRepository });
        container.register<IMeetingRepository>("IMeetingRepository", { useClass: MeetingRepository });

        // Register Services
        container.register<IAdminService>('IAdminService', { useClass: AdminService });
        container.register<IUserService>('IUserService', { useClass: UserService });
        container.register<IVolunteerService>('IVolunteerService', { useClass: VolunteerService });
        container.register<IAddressService>('IAddressService', { useClass: AddressService });
        container.register<IAssetService>('IAssetService', { useClass: AssetService });
        container.register<IAssistanceRequestService>('IAssistanceRequestService', { useClass: AssistanceRequestService });
        container.register<IAuthService>('IAuthService', { useClass: AuthService });
        container.register<IDonationService>('IDonationService', { useClass: DonationService });
        container.register<IChatService>('IChatService', { useClass: ChatService });
        container.register<INotificationService>('INotificationService', { useClass: NotificationService });
        container.register<IMeetingService>('IMeetingService', {
            useFactory: (dependencyContainer) => {
                const appId = process.env.ZEGO_APP_ID ? parseInt(process.env.ZEGO_APP_ID) : 0;
                const serverSecret = process.env.ZEGO_SERVER_SECRET || '';
                const meetingRepository = dependencyContainer.resolve<IMeetingRepository>('IMeetingRepository');
                const notificationRepository = dependencyContainer.resolve<INotificationRepository>('INotificationRepository');
                return new MeetingService(appId, serverSecret, meetingRepository, notificationRepository);
            }
        });

        // Register Controllers
        container.register<IAuthController>("IAuthController", { useClass: AuthController });
        container.register<IUserController>("IUserController", { useClass: UserController });
        container.register<IVolunteerController>("IVolunteerController", { useClass: VolunteerController });
        container.register<IAddressController>("IAddressController", { useClass: AddressController });
        container.register<IAssetController>("IAssetController", { useClass: AssetController });
        container.register<IAssetRequestController>("IAssetRequestController", { useClass: AssetRequestController });
        container.register<IAssistanceRequestController>("IAssistanceRequestController", { useClass: AssistanceRequestController });
        container.register<IDonationController>("IDonationController", { useClass: DonationController });
        container.register<IChatController>("IChatController", { useClass: ChatController });
        container.register<INotificationController>("INotificationController", { useClass: NotificationController });
        container.register<IMeetingController>("IMeetingController", { useClass: MeetingController });
    } catch (error) {
        console.error("Error registering dependencies:", error);
        throw error;
    }

    return container;
}
