import axios from 'axios';
import { store } from '../redux/store';
import { logout, refreshToken } from '../redux/slices/authSlice';
import { useSelector } from 'react-redux';

export const customAxios = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
});

// Include access token in request
customAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers['Authorization']);
    }
    return config;
});

// Handle expired tokens
customAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log('Handling expired token!');
        console.log('error.response: ', error);
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('Detected 401 error, attempting token refresh...');
            originalRequest._retry = true;
            const storedRefreshToken = store.getState().auth.refreshToken;
            console.log('refreshToken: ', storedRefreshToken);
            try {
                const refreshResponse = await customAxios.post('/api/auth/refreshToken', { refreshToken: storedRefreshToken }, {
                    withCredentials: true,
                });

                const newAccessToken = refreshResponse.data.accessToken;
                if (newAccessToken) {
                    store.dispatch(refreshToken(newAccessToken));
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    console.log('Token updated using refresh token!');
                    return customAxios(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                store.dispatch(logout());

                const role = store.getState().auth.role;

                if (role === 'admin') {
                    window.location.href = '/admin/login';
                } else {
                    '/users/login';
                }
            }
        }

        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);
