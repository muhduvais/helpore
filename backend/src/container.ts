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

// Repositories
import { UserRepository } from "./repositories/userRepository";
import { AddressRepository } from "./repositories/addressRepository";
import { AssetRepository } from "./repositories/assetRepository";
import { AssetRequestRepository } from "./repositories/assetRequestRepository";
import { AssistanceRequestRepository } from "./repositories/assistanceRequestRepository";
import { AuthRepository } from "./repositories/authRepository";
import { OtpRepository } from "./repositories/otpRepository";
import { DonationRepository } from "./repositories/donationRepository";
import { ChatRepository } from "./repositories/chatRepository";
import { NotificationRepository } from "./repositories/notificationRepository";

// Services
import { AdminService } from './services/AdminService';
import { UserService } from './services/UserService';
import { VolunteerService } from './services/VolunteerService';
import { AssetService } from './services/AssetService';
import { AssistanceRequestService } from './services/AssistanceRequestService';
import { AuthService } from './services/AuthService';
import { DonationService } from "./services/DonationService";
import { ChatService } from "./services/chatService";
import { NotificationService } from "./services/notificationService";

// Controllers
import { AuthController } from "./controllers/authController";
import { UserController } from "./controllers/userController";
import { VolunteerController } from "./controllers/volunteerController";
import { AssetController } from "./controllers/assetController";
import { AssetRequestController } from "./controllers/assetRequestController";
import { AssistanceRequestController } from "./controllers/assistanceRequestController";
import { AddressController } from "./controllers/addressController";
import { DonationController } from "./controllers/donationController";
import { ChatController } from "./controllers/chatController";
import { NotificationController } from "./controllers/notificationController";

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

        // Register Services
        container.register<IAdminService>('IAdminService', { useClass: AdminService });
        container.register<IUserService>('IUserService', { useClass: UserService });
        container.register<IVolunteerService>('IVolunteerService', { useClass: VolunteerService });
        container.register<IAssetService>('IAssetService', { useClass: AssetService });
        container.register<IAssistanceRequestService>('IAssistanceRequestService', { useClass: AssistanceRequestService });
        container.register<IAuthService>('IAuthService', { useClass: AuthService });
        container.register<IDonationService>('IDonationService', { useClass: DonationService });
        container.register<IChatService>('IChatService', { useClass: ChatService });
        container.register<INotificationService>('INotificationService', { useClass: NotificationService });

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
    } catch (error) {
        console.error("Error registering dependencies:", error);
        throw error;
    }

    return container;
}
