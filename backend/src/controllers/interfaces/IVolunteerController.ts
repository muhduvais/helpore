import { Request, Response } from 'express';

export interface IVolunteerController {
  addVolunteer(req: Request, res: Response): Promise<void>;
  getVolunteers(req: Request, res: Response): Promise<void>;
  getVolunteerDetails(req: Request, res: Response): Promise<void>;
  updateProfilePicture(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
  toggleIsBlocked(req: Request, res: Response): Promise<void>;
}