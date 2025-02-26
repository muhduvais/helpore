import { Request, Response } from 'express';

export interface IUserController {
  addUser(req: Request, res: Response): Promise<void>;
  getUsers(req: Request, res: Response): Promise<void>;
  getUserDetails(req: Request, res: Response): Promise<void>;
  updateUserDetails(req: Request, res: Response): Promise<void>;
  updateProfilePicture(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
  toggleIsBlocked(req: Request, res: Response): Promise<void>;
}