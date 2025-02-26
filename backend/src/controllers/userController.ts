import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { IUserController } from './interfaces/IUserController';
import { IAdminService, IUserService } from '../services/interfaces/ServiceInterface';

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject('IUserService') private readonly userService: IUserService,
    @inject('IAdminService') private readonly adminService: IAdminService,
  ) { }

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
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;
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
      const userId = req.params.id;

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
      const userId = req.user.userId;
      const { formData } = req.body;
      const registeredMail = await this.userService.editUser(userId, formData);

      if (registeredMail) {
        res.status(200).json({ success: true, registeredMail });
      }
    } catch (error) {
      console.error('Error registering the user:', error);
      res.status(500).json({ message: 'Error registering user', error });
    }
  }

  async updateProfilePicture(req: Request, res: Response): Promise<void> {

    const userId = req.user.userId;

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

    const userId = req.user.userId;

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
      const action = req.params.action === 'block';
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
}