import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import formReducer from '../redux/slices/formSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        form: formReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;