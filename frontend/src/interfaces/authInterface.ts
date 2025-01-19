
export interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  role: string | null;
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  registeredMail: string;
  message: string;
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