import { FirebaseError } from 'firebase/app';
import { auth, googleProvider, signInWithPopup } from '../config/firebase.config';
import axios from '../utils/urlProxy'

export const authController = {
    async handleGoogleLogin() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const response = await axios.post('/api/auth/google-login', { idToken });
            return response.data;
        } catch (error) {
            // console.error('Google login failed:', error);
            // throw error;
            if (error instanceof FirebaseError) {
                console.error('Firebase error during Google login:', error.message);
            } else {
                console.error('Unexpected error during Google login:', error);
            }
            throw new Error('Google login failed. Please try again later.');
        }
    },
};
