import { ObjectId } from "mongoose";

export interface AuthState {
  userId: string | null | ObjectId;
  isLoggedIn: boolean;
  isBlocked: boolean;
  role: string | null;
  accessToken: string;
}

export interface FormState {
  fields: object,
  errors: object,
  forms: object,
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  registeredMail: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  selectedRole?: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string,
    role: string,
  }
}

export interface AddAssetFormData {
  name: string;
  category: string;
  description: string;
  stocks: number | string | null;
  image: File | string | null;
}

export interface AddAssetFormErrors {
  name: string;
  category: string;
  description: string;
  stocks: string;
  image: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}