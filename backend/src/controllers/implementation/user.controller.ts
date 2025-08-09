import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { IUserController } from '../interfaces/IUserController';
import { IAdminService, IUserService } from '../../services/interfaces/ServiceInterface';
import { JwtPayload } from 'jsonwebtoken';
import { HttpStatusCode } from '../../constants/httpStatus';
import { ErrorMessages } from '../../constants/errorMessages';

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject('IUserService') private readonly userService: IUserService,
    @inject('IAdminService') private readonly adminService: IAdminService,
  ) {
    this.addUser = this.addUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
    this.updateUserDetails = this.updateUserDetails.bind(this);
    this.updateProfilePicture = this.updateProfilePicture.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.toggleIsBlocked = this.toggleIsBlocked.bind(this);
    this.uploadCertificateImage = this.uploadCertificateImage.bind(this);
    this.deleteCertificate = this.deleteCertificate.bind(this);
  }

  async addUser(req: Request, res: Response): Promise<void> {
    try {
      const { formData } = req.body;
      const registeredMail = await this.adminService.addUser(formData);

      if (registeredMail) {
        res.status(HttpStatusCode.CREATED).json({
          success: true,
          registeredMail
        });
      } else {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          existingMail: true,
          message: ErrorMessages.EMAIL_ALREADY_REGISTERED
        });
      }
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.REGISTER_USER_FAILED,
        error
      });
    }
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page !== undefined ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit !== undefined ? parseInt(req.query.limit as string, 10) : 5;

      const search = req.query.search as string;

      const skip = !search ? ((page - 1) * limit) : 0;

      const [users, documentsCount] = await Promise.all([
        this.userService.fetchUsers(search, skip, limit),
        this.userService.countUsers(search)
      ]);

      const totalPages = Math.ceil(documentsCount / limit);

      if (users) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          users,
          totalPages,
          totalUsers: documentsCount
        });
      } else {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.USER_NOT_FOUND
        });
      }
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.SERVER_ERROR,
        error
      });
    }
  }

  async getUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id ? req.params.id : (req.user as JwtPayload).userId;

      const [user, address] = await Promise.all([
        this.userService.fetchUserDetails(userId),
        this.userService.fetchAddress(userId)
      ]);

      if (user) {
        res.status(HttpStatusCode.OK).json({ success: true, user, address });
      } else {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.USER_NOT_FOUND
        });
      }
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.SERVER_ERROR,
        error
      });
    }
  }

  async updateUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user as JwtPayload;
      const { formData } = req.body;
      const registeredMail = await this.userService.editUser(userId, formData);

      if (registeredMail) {
        res.status(HttpStatusCode.OK).json({ success: true, registeredMail });
      }
    } catch (error) {
      console.error(ErrorMessages.USER_UPDATE_FAILED, error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.USER_UPDATE_FAILED, error });
    }
  }

  async updateProfilePicture(req: Request, res: Response): Promise<void> {
    const { userId } = req.user as JwtPayload;
    const { profilePicture } = req.body;

    try {
      const changeProfilePicture = await this.userService.changeProfilePicture(userId, profilePicture);

      if (!changeProfilePicture) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.PROFILE_UPDATE_FAILED });
        return;
      }

      res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.PROFILE_UPDATE_SUCCESS });
    } catch (error) {
      console.error(ErrorMessages.PROFILE_UPDATE_FAILED, error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.PROFILE_UPDATE_FAILED, error });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const { userId } = req.user as JwtPayload;
    const data = req.body;
    const { currentPassword, newPassword } = data;

    try {
      const verifyCurrentPassword = await this.userService.verifyCurrentPassword(userId, currentPassword);

      if (!verifyCurrentPassword) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.INVALID_CURRENT_PASSWORD });
        return;
      }
      const changePassword = await this.userService.changePassword(userId, newPassword);

      if (changePassword) {
        res.status(HttpStatusCode.OK).json({ success: true, message: ErrorMessages.PASSWORD_RESET_SUCCESS });
      }
    } catch (error) {
      console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.PASSWORD_UPDATE_FAILED, error });
    }
  }

  async toggleIsBlocked(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const action = req.params.blockAction === 'block';
      const toggleResponse = await this.userService.toggleIsBlocked(action, userId);

      if (toggleResponse) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          message: ErrorMessages.BLOCK_STATUS_UPDATE_SUCCESS
        });
      }
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.BLOCK_STATUS_UPDATE_FAILED,
        error
      });
    }
  }

  async uploadCertificateImage(req: Request, res: Response): Promise<void> {
    const { userId } = req.user as JwtPayload;
    try {
      const file = req.file;

      if (!file) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: ErrorMessages.NO_IMAGE_UPLOADED });
        return;
      }

      const uploadResponse = await this.userService.uploadCertificateImage(userId, file);

      if (!uploadResponse) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.CERTIFICATE_UPLOAD_FAILED });
        return;
      }

      res.status(HttpStatusCode.OK).json({ certificateUrl: uploadResponse });
    } catch (error) {
      console.error(ErrorMessages.CERTIFICATE_UPLOAD_FAILED, error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.CERTIFICATE_UPLOAD_FAILED,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { certificateUrl } = req.body;
      const { userId } = req.user as JwtPayload;

      if (!certificateUrl) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.CERTIFICATE_URL_REQUIRED });
        return;
      }

      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
        return;
      }

      const result = await this.userService.deleteCertificate(userId, certificateUrl);

      if (!result) {
        res.status(HttpStatusCode.NOT_FOUND).json({ success: false, message: ErrorMessages.CERTIFICATE_NOT_FOUND });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ErrorMessages.CERTIFICATE_DELETE_SUCCESS,
        data: result,
      });
    } catch (error: any) {
      console.error(ErrorMessages.CERTIFICATE_DELETE_FAILED, error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.CERTIFICATE_DELETE_FAILED,
        error: error.message || ErrorMessages.CERTIFICATE_DELETE_FAILED,
      });
    }
  };

}