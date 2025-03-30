import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { IUserController } from '../interfaces/IUserController';
import { IAdminService, IUserService } from '../../services/interfaces/ServiceInterface';
import { JwtPayload } from 'jsonwebtoken';

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
        res.status(201).json({
          success: true,
          registeredMail
        });
      } else {
        res.status(400).json({
          success: false,
          existingMail: true,
          message: 'This email is already registered!'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering user',
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
        res.status(200).json({
          success: true,
          users,
          totalPages,
          totalUsers: documentsCount
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Users not found!'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching the users',
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
        res.status(200).json({ success: true, user, address });
      } else {
        res.status(400).json({
          success: false,
          message: 'User not found!'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching the user details',
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
        res.status(200).json({ success: true, registeredMail });
      }
    } catch (error) {
      console.error('Error updating the user:', error);
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async updateProfilePicture(req: Request, res: Response): Promise<void> {

    const { userId } = req.user as JwtPayload;

    const { profilePicture } = req.body;

    try {
      const changeProfilePicture = await this.userService.changeProfilePicture(userId, profilePicture);

      if (!changeProfilePicture) {
        res.status(400).json({ success: false, message: 'Error changing the profile!' });
        return;
      }

      res.status(200).json({ success: true, message: 'profile updated successfully!' });
    } catch (error) {
      console.error('Error updating the profile picture: ', error);
      res.status(500).json({ message: 'Error updating the profile picture: ', error });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {

    const { userId } = req.user as JwtPayload;

    const data = req.body;

    const { currentPassword, newPassword } = data;

    try {
      const verifyCurrentPassword = await this.userService.verifyCurrentPassword(userId, currentPassword);

      if (!verifyCurrentPassword) {
        res.status(400).json({ success: false, message: 'Invalid current password!' });
        return;
      }
      const changePassword = await this.userService.changePassword(userId, newPassword);

      if (changePassword) {
        res.status(200).json({ success: true, message: 'Password updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating the password: ', error);
      res.status(500).json({ message: 'Error updating the password: ', error });
    }
  }

  async toggleIsBlocked(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const action = req.params.blockAction === 'block';
      const toggleResponse = await this.userService.toggleIsBlocked(action, userId);

      if (toggleResponse) {
        res.status(200).json({
          success: true,
          message: 'Updated the block status successfully!'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating the block status',
        error
      });
    }
  }

  async uploadCertificateImage(req: Request, res: Response): Promise<void> {
    const { userId } = req.user as JwtPayload;
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No image uploaded' });
        return;
      }

      const uploadResponse = await this.userService.uploadCertificateImage(userId, file);

      if (!uploadResponse) {
        res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
        return;
      }

      res.status(200).json({ certificateUrl: uploadResponse });
    } catch (error) {
      console.error('Error uploading the certificate image: ', error);
      res.status(500).json({
        message: 'Error uploading the certificate image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { certificateUrl } = req.body;
      const { userId } = req.user as JwtPayload;

      console.log('certificateUrl: ', certificateUrl)

      if (!certificateUrl) {
        res.status(400).json({ success: false, message: "Certificate URL is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
        return;
      }

      const result = await this.userService.deleteCertificate(userId, certificateUrl);

      if (!result) {
        res.status(404).json({ success: false, message: "Certificate not found or could not be deleted" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Certificate deleted successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error deleting certificate:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete certificate",
      });
    }
  };

}