import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormState, Fields, FormIds } from '../../interfaces/formInterface';

const initialState: FormState = {
    errors: {
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        fname: '',
        lname: '',
        street: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
    },
    forms: {
        login: {
            isSubmitting: false,
            submitError: '',
        },
        register: {
            isSubmitting: false,
            submitError: '',
        },
        forgotPassword: {
            isSubmitting: false,
            submitError: '',
        },
    }
};

const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        setFieldError: (state, action: PayloadAction<{ field: keyof Fields, error: string }>) => {
            const { field, error } = action.payload;
            state.errors[field] = error;
        },
        clearFieldError: (state, action: PayloadAction<{ field: keyof Fields }>) => {
            const { field } = action.payload;
            state.errors[field] = '';
        },
        setSubmitting: (state, action: PayloadAction<{ formId: FormIds, isSubmitting: boolean }>) => {
            const { formId, isSubmitting } = action.payload
            state.forms[formId].isSubmitting = isSubmitting
        },
        setSubmitError: (state, action: PayloadAction<{ formId: FormIds, error: string }>) => {
            const { formId, error } = action.payload
            state.forms[formId].submitError = error
        },
        resetForm: (state, action: PayloadAction<{ formId: FormIds }>) => {
            const { formId } = action.payload
            const errors = Object.keys(state.errors) as Array<keyof Fields>;
            errors.forEach(field => {
                state.errors[field] = '';
            })
            state.forms[formId] = {
                isSubmitting: false,
                submitError: null,
            }
        }
    }
});

export const { setFieldError, clearFieldError, setSubmitting, setSubmitError, resetForm } = formSlice.actions;
export default formSlice.reducer;
