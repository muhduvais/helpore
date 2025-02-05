
export interface Fields {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  password: string;
  fname: string;
  lname: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface FormStatus {
  isSubmitting?: boolean,
  submitError?: string | null,
}

export interface FormState {
  errors: Record<keyof Fields, string>,
  forms: {
    login: FormStatus,
    register: FormStatus,
    forgotPassword: FormStatus,
  },
}

export type FormIds = 'login' | 'register' | 'forgotPassword';

export type FormErrors = {
  name: string;
  email: string;
  password: string;
};