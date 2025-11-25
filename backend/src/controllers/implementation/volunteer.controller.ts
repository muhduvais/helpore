import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import {
  IAdminService,
  IVolunteerService,
} from "../../services/interfaces/ServiceInterface";
import { IVolunteerController } from "../interfaces/IVolunteerController";
import { JwtPayload } from "jsonwebtoken";
import { HttpStatusCode } from "../../constants/httpStatus";
import { ErrorMessages } from "../../constants/errorMessages";
import { AddUserRequestDTO } from "../../dtos/requests/addUser-request.dto";
import { UpdateVolunteerRequestDTO } from "../../dtos/requests/updateVolunteer-request.dto";

@injectable()
export class VolunteerController implements IVolunteerController {
  constructor(
    @inject("IVolunteerService")
    private readonly volunteerService: IVolunteerService,
    @inject("IAdminService") private readonly adminService: IAdminService
  ) {
    this.addVolunteer = this.addVolunteer.bind(this);
    this.getVolunteers = this.getVolunteers.bind(this);
    this.getVolunteerDetails = this.getVolunteerDetails.bind(this);
    this.updateProfilePicture = this.updateProfilePicture.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.toggleIsBlocked = this.toggleIsBlocked.bind(this);
    this.updateVolunteerDetails = this.updateVolunteerDetails.bind(this);
  }

  async addVolunteer(req: Request, res: Response): Promise<void> {
    try {
      const dto = AddUserRequestDTO.fromRequest(req.body.formData ?? req.body);

      const registeredMail = await this.adminService.addVolunteer(dto);

      if (registeredMail) {
        res
          .status(HttpStatusCode.CREATED)
          .json({ success: true, registeredMail });
      } else {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.EMAIL_ALREADY_REGISTERED,
        });
      }
    } catch (error) {
      console.error(ErrorMessages.REGISTER_USER_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.REGISTER_USER_FAILED, error });
    }
  }

  async getVolunteers(req: Request, res: Response): Promise<void> {
    const page =
      req.query.page !== undefined ? parseInt(req.query.page as string, 10) : 1;
    let limit =
      req.query.limit !== undefined
        ? parseInt(req.query.limit as string, 10)
        : 5;

    const search = String(req.query.search || "");
    let skip = !search ? (page - 1) * limit : 0;
    const isActive = String(req.query.isActive || "all");

    if (isActive !== "all") limit = Infinity;

    try {
      const volunteers = await this.volunteerService.fetchVolunteers(
        search,
        skip,
        limit,
        isActive
      );
      const documentsCount = await this.adminService.countVolunteers(search);
      const totalPages = Math.ceil(documentsCount / limit);

      if (volunteers) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          volunteers,
          totalPages,
          totalVolunteers: documentsCount,
        });
      } else {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ success: false, message: ErrorMessages.USER_NOT_FOUND });
      }
    } catch (error) {
      console.error(ErrorMessages.SERVER_ERROR, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.SERVER_ERROR, error });
    }
  }

  async getVolunteerDetails(req: Request, res: Response): Promise<void> {
    try {
      const volunteerId = req.params.id
        ? req.params.id
        : (req.user as JwtPayload).userId;

      const [volunteer, address] = await Promise.all([
        this.volunteerService.fetchVolunteerDetails(volunteerId),
        this.volunteerService.fetchAddress(volunteerId),
      ]);

      if (volunteer) {
        res
          .status(HttpStatusCode.OK)
          .json({ success: true, volunteer, address });
      } else {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.SERVER_ERROR,
        error,
      });
    }
  }

  async updateProfilePicture(req: Request, res: Response): Promise<void> {
    const { userId: volunteerId } = req.user as JwtPayload;
    const { profilePicture } = req.body;

    try {
      const changeProfilePicture =
        await this.volunteerService.changeProfilePicture(
          volunteerId,
          profilePicture
        );

      if (!changeProfilePicture) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.PROFILE_UPDATE_FAILED,
        });
        return;
      }

      res
        .status(HttpStatusCode.OK)
        .json({ success: true, message: ErrorMessages.PROFILE_UPDATE_SUCCESS });
    } catch (error) {
      console.error(ErrorMessages.PROFILE_UPDATE_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.PROFILE_UPDATE_FAILED, error });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const { userId: volunteerId } = req.user as JwtPayload;
    const data = req.body;
    const { currentPassword, newPassword } = data;

    try {
      const verifyCurrentPassword =
        await this.volunteerService.verifyCurrentPassword(
          volunteerId,
          currentPassword
        );

      if (!verifyCurrentPassword) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.INVALID_CURRENT_PASSWORD,
        });
        return;
      }
      const changePassword = await this.volunteerService.changePassword(
        volunteerId,
        newPassword
      );

      if (changePassword) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          message: ErrorMessages.PASSWORD_UPDATE_SUCCESS,
        });
      }
    } catch (error) {
      console.error(ErrorMessages.PASSWORD_UPDATE_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.PASSWORD_UPDATE_FAILED, error });
    }
  }

  async toggleIsBlocked(req: Request, res: Response): Promise<void> {
    try {
      const VolunteerId = req.params.id;
      const action = req.params.action === "block";
      const toggleResponse = await this.volunteerService.toggleIsBlocked(
        action,
        VolunteerId
      );

      if (toggleResponse) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          message: ErrorMessages.BLOCK_STATUS_UPDATE_SUCCESS,
        });
      }
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.BLOCK_STATUS_UPDATE_FAILED,
        error,
      });
    }
  }

  async updateVolunteerDetails(req: Request, res: Response): Promise<void> {
    try {
      const volunteerId = (req.user as JwtPayload)?.userId;
      const dto = UpdateVolunteerRequestDTO.fromRequest(
        req.body.formData ?? req.body
      );

      const registeredMail = await this.volunteerService.editVolunteer(
        volunteerId,
        dto
      );

      if (registeredMail) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          registeredMail,
        });
        return;
      }

      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: ErrorMessages.VOLUNTEER_UPDATE_FAILED,
      });
    } catch (error) {
      console.error("Error updating the volunteer:", error);
      res.status(500).json({ message: "Error updating volunteer", error });
    }
  }
}
