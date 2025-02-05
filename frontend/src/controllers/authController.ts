import { FirebaseError } from 'firebase/app';
import { auth, googleProvider, signInWithPopup } from '../config/firebase.config';
import customAxios from '../utils/urlProxy'
import { AxiosError } from 'axios';

export const authController = {
    async handleGoogleLogin() {
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
};
