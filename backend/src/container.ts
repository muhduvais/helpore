import { container } from "tsyringe";

// Repositories - Interfaces
import { IUserRepository } from "./repositories/interfaces/IUserRepository";
import { IAddressRepository } from "./repositories/interfaces/IAddressRepository";
import { IAssetRepository } from "./repositories/interfaces/IAssetRepository";
import { IAssetRequestRepository } from "./repositories/interfaces/IAssetRequestRepository";
import { IAssistanceRepository } from "./repositories/interfaces/IAssistanceRequestRepository";
import { IAuthRepository } from "./repositories/interfaces/IAuthRepository";
import { IOtpRepository } from "./repositories/interfaces/IOtpRepository";

// Services - Interfaces
import { IAdminService } from './services/interfaces/ServiceInterface';
import { IUserService } from "./services/interfaces/ServiceInterface";
import { IVolunteerService } from "./services/interfaces/ServiceInterface";
import { IAssetService } from "./services/interfaces/ServiceInterface";
import { IAssistanceRequestService } from "./services/interfaces/ServiceInterface";
import { IAuthService } from "./services/interfaces/ServiceInterface";

// Controllers - Interfaces
import { IAuthController } from './controllers/interfaces/IAuthController';
import { IUserController } from './controllers/interfaces/IUserController';
import { IVolunteerController } from "./controllers/interfaces/IVolunteerController";
import { IAssetController } from './controllers/interfaces/IAssetController';
import { IAssetRequestController } from "./controllers/interfaces/IAssetRequestController";
import { IAssistanceRequestController } from "./controllers/interfaces/IAssistanceRequesController";
import { IAddressController } from "./controllers/interfaces/IAddressController";

// Repositories
import { UserRepository } from "./repositories/UserRepository";
import { AddressRepository } from "./repositories/AddressRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AssetRequestRepository } from "./repositories/AssetRequestRepository";
import { AssistanceRequestRepository } from "./repositories/AssistanceRequestRepository";
import { AuthRepository } from "./repositories/AuthRepository";
import { OtpRepository } from "./repositories/OtpRepository";

// Services
import { AdminService } from './services/AdminService';
import { UserService } from './services/UserService';
import { VolunteerService } from './services/VolunteerService';
import { AssetService } from './services/AssetService';
import { AssistanceRequestService } from './services/AssistanceRequestService';
import { AuthService } from './services/AuthService';

// Controllers
import { AuthController } from "./controllers/authController";
import { UserController } from "./controllers/userController";
import { VolunteerController } from "./controllers/voluteerController";
import { AssetController } from "./controllers/assetController";
import { AssetRequestController } from "./controllers/assetRequestController";
import { AssistanceRequestController } from "./controllers/assistanceRequestController";
import { AddressController } from "./controllers/addressController";

export function registerDependencies() {
    // Register Repositories
    container.register<IUserRepository>("IUserRepository", { useClass: UserRepository });
    container.register<IAddressRepository>("IAddressRepository", { useClass: AddressRepository });
    container.register<IAssetRepository>("IAssetRepository", { useClass: AssetRepository });
    container.register<IAssetRequestRepository>("IAssetRequestRepository", { useClass: AssetRequestRepository });
    container.register<IAssistanceRepository>("IAssistanceRequestRepository", { useClass: AssistanceRequestRepository });
    container.register<IAuthRepository>("IAuthRepository", { useClass: AuthRepository });
    container.register<IOtpRepository>("IOtpRepository", { useClass: OtpRepository });

    // Register Services
    container.register<IAdminService>('IAdminService', { useClass: AdminService });
    container.register<IUserService>('IUserService', { useClass: UserService });
    container.register<IVolunteerService>('IVolunteerService', { useClass: VolunteerService });
    container.register<IAssetService>('IAssetService', { useClass: AssetService });
    container.register<IAssistanceRequestService>('IAssistanceRequestService', { useClass: AssistanceRequestService });
    container.register<IAuthService>('IAuthService', { useClass: AuthService });

    // Register Controllers
    container.register<IAuthController>("AuthController", { useClass: AuthController });
    container.register<IUserController>("UserController", { useClass: UserController });
    container.register<IVolunteerController>("VolunteerController", { useClass: VolunteerController });
    container.register<IAddressController>("AddressController", { useClass: AddressController });
    container.register<IAssetController>("AssetController", { useClass: AssetController });
    container.register<IAssetRequestController>("AssetRequestController", { useClass: AssetRequestController });
    container.register<IAssistanceRequestController>("AssistanceRequestController", { useClass: AssistanceRequestController });

    return container;
}
