import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../../interfaces/authInterface';

const setLocalStorage = (key: string, value: string) => localStorage.setItem(key, value);
const removeLocalStorage = (key: string) => localStorage.removeItem(key);
const getLocalStorage = (key: string): string | null => localStorage.getItem(key);

const initialState: AuthState = {
    userId: getLocalStorage('userId') || null,
    isLoggedIn: getLocalStorage('isLoggedIn') === 'true',
    role: getLocalStorage('role') || null,
    accessToken: getLocalStorage('accessToken'),
    refreshToken: getLocalStorage('refreshToken'),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<{ userId: string, accessToken: string, refreshToken: string, role: string }>) {
            state.userId = action.payload.userId;
            state.isLoggedIn = true;
            state.role = action.payload.role;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;

            setLocalStorage('email', action.payload.userId);
            setLocalStorage('accessToken', action.payload.accessToken);
            setLocalStorage('refreshToken', action.payload.refreshToken);
            setLocalStorage('role', action.payload.role);
            setLocalStorage('isLoggedIn', 'true');
        },
        logout(state) {
            state.userId = null;
            state.isLoggedIn = false;
            state.accessToken = null;
            state.refreshToken = null;
            state.role = null;

            removeLocalStorage('accessToken');
            removeLocalStorage('refreshToken');
            removeLocalStorage('email');
            removeLocalStorage('role');
            removeLocalStorage('isLoggedIn');
        },
        refreshToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            setLocalStorage('accessToken', action.payload);
        }
    },
});

export const { login, logout, refreshToken } = authSlice.actions;
export default authSlice.reducer;