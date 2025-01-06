import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: { email: string } | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    accessToken: string | null;
    refreshToken: string | null;
}

const initialState: AuthState = {
    user: null,
    isLoggedIn: false,
    isAdmin: false,
    accessToken: null,
    refreshToken: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<{ email: string, accessToken: string, refreshToken: string, isAdmin: boolean }>) {
            state.user = { email: action.payload.email };
            state.isLoggedIn = true;
            state.isAdmin = action.payload.isAdmin;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            
            localStorage.setItem('accessToken', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
        logout(state) {
            state.user = null;
            state.isLoggedIn = false;
            state.accessToken = null;
            state.refreshToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        refreshToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            localStorage.setItem('accessToken', action.payload);
        }
    },
});

export const { login, logout, refreshToken } = authSlice.actions;
export default authSlice.reducer;