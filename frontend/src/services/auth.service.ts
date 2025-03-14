import customAxios from '../utils/urlProxy';
import { LoginFormData, LoginResponse, SignUpFormData, SignupResponse } from '../interfaces/authInterface';
import { auth, googleProvider, signInWithPopup } from '../config/firebase.config';
import { FirebaseError } from 'firebase/app';
import { AxiosError } from 'axios';

export const authService = {

    signup: async (data: SignUpFormData) => {
        try {
            const response = await customAxios.post<SignupResponse>('/api/auth/register', data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    login: async (data: LoginFormData, selectedRole: string) => {
        try {
            const response = await customAxios.post<LoginResponse>('/api/auth/login', { data, selectedRole });
            return response;
        } catch (error) {
            throw error;
        }
    },
    adminLogin: async (data: LoginFormData) => {
        try {
            const selectedRole = 'admin';
            const response = await customAxios.post<LoginResponse>('/api/auth/admin/login', { data, selectedRole });
            return response;
        } catch (error) {
            throw error;
        }
    },
    handleGoogleLogin: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const response = await customAxios.post('/api/auth/google-login', { idToken });
            return response.data;
        } catch (error) {
            if (error instanceof FirebaseError) {
                console.error('Firebase error during Google login:', error.message);
            } else if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    return error?.response.data;
                }
            }
            throw new Error('Google login failed. Please try again later.');
        }
    },
    authenticateUser: async (userId: string) => {
        try {
            const response = await customAxios.post(`/api/auth/authenticateUser/${userId}`);
            const isBlocked = response.data.isBlocked;
            return isBlocked;
        } catch (error) {
            throw error;
        }
    },
    forgotPassword: async (email: string) => {
        try {
            const response = await customAxios.post('/api/auth/forgotPassword', { email });
            return response;
        } catch (error) {
            throw error;
        }
    },
    resetPassword: async (token: string, newPassword: string) => {
        try {
            const response = await customAxios.post('/api/auth/resetPassword', { token, newPassword });
            return response;
        } catch (error) {
            throw error;
        }
    },
    resendOtp: async (email: string) => {
        try {
            const response = await customAxios.post('/api/auth/resendOtp', { email });
            return response;
        } catch (error) {
            throw error;
        }
    },
    verifyOtp: async (email: string, otp: string) => {
        try {
            const response = await customAxios.post('/api/auth/verifyOtp', { email, otp });
            return response;
        } catch (error) {
            throw error;
        }
    },
}
