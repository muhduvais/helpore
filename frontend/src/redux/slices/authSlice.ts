import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../../interfaces/authInterface';

const setLocalStorage = (key: string, value: string) => localStorage.setItem(key, value);
const removeLocalStorage = (key: string) => localStorage.removeItem(key);
const getLocalStorage = (key: string): string | null => localStorage.getItem(key);

const initialState: AuthState = {
    userId: getLocalStorage('userId') || null,
    isLoggedIn: getLocalStorage('isLoggedIn') === 'true',
    role: getLocalStorage('role') || null,
    accessToken: getLocalStorage('accessToken') || '',
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        login(state, action: PayloadAction<{ userId: string, accessToken: string, role: string }>) {
            state.userId = action.payload.userId;
            state.isLoggedIn = true;
            state.role = action.payload.role;
            setLocalStorage('userId', action.payload.userId);
            setLocalStorage('role', action.payload.role);
            setLocalStorage('isLoggedIn', 'true');
            setLocalStorage('accessToken', action.payload.accessToken);
        },
        logout(state) {
            state.userId = null;
            state.isLoggedIn = false;
            state.role = null;
            removeLocalStorage('userId');
            removeLocalStorage('role');
            removeLocalStorage('isLoggedIn');
            removeLocalStorage('accessToken');
        },
        refreshToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            setLocalStorage('accessToken', action.payload);
        }
    },
});

export const { login, logout, refreshToken } = authSlice.actions;
export default authSlice.reducer;
