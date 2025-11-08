import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IAuthService } from "../../services/interfaces/ServiceInterface";
import { IAuthController } from "../interfaces/IAuthController";
import { firebaseAdmin } from "../../config";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "../../constants/httpStatus";
import { ErrorMessages } from "../../constants/errorMessages";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject("IAuthService") private readonly authService: IAuthService
  ) {
    this.registerUser = this.registerUser.bind(this);
    this.resendOtp = this.resendOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.logoutUser = this.logoutUser.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
  }

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const registeredMail = await this.authService.registerUser(
        name,
        email,
        password
      );

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

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const otp = await this.authService.resendOtp(email);

      if (otp) {
        console.log("New OTP:", otp);
        res.status(HttpStatusCode.OK).json({
          success: true,
          message: ErrorMessages.OTP_GENERATED_SUCCESS,
        });
      } else {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: ErrorMessages.EMAIL_NOT_FOUND_TEMP_REGISTRATION,
        });
      }
    } catch (error) {
      console.error(ErrorMessages.OTP_GENERATE_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.OTP_GENERATE_FAILED, error });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const verified = await this.authService.verifyOtp(email, otp);
      if (!verified) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: ErrorMessages.WRONG_OTP });
        return;
      }
      res
        .status(HttpStatusCode.OK)
        .json({ message: ErrorMessages.OTP_VERIFICATION_SUCCESS });
    } catch (error) {
      console.error(ErrorMessages.OTP_VERIFICATION_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.OTP_VERIFICATION_FAILED, error });
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body.data;
      const selectedRole = req.body.selectedRole;

      const user = await this.authService.verifyLogin(email, password);

      if (!user || user.role !== selectedRole) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: ErrorMessages.INVALID_EMAIL_OR_PASSWORD });
        return;
      }

      if (user.isBlocked) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ message: ErrorMessages.UNAUTHORIZED_USER });
        return;
      }

      const accessToken = await this.authService.generateAccessToken(
        user._id,
        user.role
      );
      const refreshToken = await this.authService.generateRefreshToken(
        user._id,
        user.role
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });

      res.status(HttpStatusCode.OK).json({
        message: ErrorMessages.LOGIN_SUCCESS,
        accessToken,
        user: {
          id: user._id,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(ErrorMessages.LOGIN_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.LOGIN_FAILED, error });
    }
  }

  async logoutUser(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res
        .status(HttpStatusCode.OK)
        .json({ message: ErrorMessages.LOGOUT_SUCCESS });
    } catch (error) {
      console.error(ErrorMessages.LOGOUT_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.LOGOUT_FAILED, error });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        console.log(ErrorMessages.REFRESH_TOKEN_MISSING);
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ message: ErrorMessages.REFRESH_TOKEN_MISSING });
        return;
      }

      const payload = await this.authService.verifyRefreshToken(refreshToken);
      const userId = payload.userId;
      const role = payload.role;
      if (!userId) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ message: ErrorMessages.INVALID_REFRESH_TOKEN });
        return;
      }

      const newAccessToken = await this.authService.generateAccessToken(
        userId,
        role
      );

      res.status(HttpStatusCode.OK).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error(ErrorMessages.REFRESH_TOKEN_FAILED, error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.REFRESH_TOKEN_FAILED, error });
    }
  }

  async googleLogin(req: Request, res: Response): Promise<void> {
    const { idToken } = req.body;

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const user = await this.authService.findOrCreateUser(decodedToken);

      if (!user) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: ErrorMessages.NOT_REGISTERED_VOLUNTEER,
        });
        return;
      }

      const userId = user._id as string;
      const role = user.role as string;

      if (user.isBlocked) {
        res.status(HttpStatusCode.FORBIDDEN).json({
          success: false,
          message: ErrorMessages.INVALID_EMAIL_OR_PASSWORD,
        });
        return;
      }

      const accessToken = await this.authService.generateAccessToken(
        userId,
        role
      );
      const refreshToken = await this.authService.generateRefreshToken(
        userId,
        role
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      if (error.code === "auth/invalid-id-token") {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: ErrorMessages.INVALID_GOOGLE_ID_TOKEN });
        console.error(ErrorMessages.INVALID_GOOGLE_ID_TOKEN, error);
      } else {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          message: ErrorMessages.GOOGLE_LOGIN_FAILED,
          error: error.message,
        });
        console.error(ErrorMessages.GOOGLE_LOGIN_FAILED, error);
      }
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const sendResetLink = await this.authService.sendResetLink(email);
      if (!sendResetLink) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: ErrorMessages.EMAIL_NOT_REGISTERED });
      } else {
        res
          .status(HttpStatusCode.OK)
          .json({ message: ErrorMessages.RESET_LINK_SENT });
      }
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.FORGOT_PASSWORD_FAILED,
        error: error.message,
      });
      console.error(ErrorMessages.FORGOT_PASSWORD_FAILED, error);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(
        token,
        process.env.RESET_LINK_SECRET!
      ) as JwtPayload;
      const { userId } = decoded;
      const user = await this.authService.findUserById(userId);
      if (!user) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: ErrorMessages.USER_NOT_FOUND });
        return;
      }
      const email = user.email;

      await this.authService.resetPassword(email, newPassword);
      res
        .status(HttpStatusCode.OK)
        .json({ message: ErrorMessages.PASSWORD_RESET_SUCCESS });
    } catch (error) {
      console.log("error: ", error);
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: ErrorMessages.INVALID_OR_EXPIRED_TOKEN });
    }
  }

  async authenticateUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    try {
      const isBlocked = await this.authService.findIsBlocked(userId);
      res
        .status(HttpStatusCode.OK)
        .json({ isBlocked, message: ErrorMessages.AUTHENTICATED_USER_SUCCESS });
    } catch (error) {
      console.log(ErrorMessages.AUTHENTICATE_USER_FAILED);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        isBlocked: false,
        message: ErrorMessages.AUTHENTICATE_USER_FAILED,
      });
    }
  }
}
