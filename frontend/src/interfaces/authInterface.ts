
export interface AuthState {
    user: { email: string | null } | null;
    isLoggedIn: boolean;
    role: string | null;
    accessToken: string | null;
    refreshToken: string | null;
}

export interface SignupResponse {
  registeredMail: string;
  message: string;
}