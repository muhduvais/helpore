import { Request, Response } from 'express';

export interface IAuthController {
  registerUser(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  loginUser(req: Request, res: Response): Promise<void>;
  logoutUser(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
  googleLogin(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
  authenticateUser(req: Request, res: Response): Promise<void>;
}