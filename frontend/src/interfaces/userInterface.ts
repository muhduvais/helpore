
export interface IUser {
    userId?: string;
    name: string;
    age: number;
    gender: string;
    phone: number;
    email: string;
    password: string;
    profilePicture: string;
    isActive: boolean;
    isBlocked: boolean;
    isVerified: boolean;
    role: string;
    googleId: string;
    resetToken: string;
    resetTokenExpiry: Date;
    _id?: string;
    uid?: string;
    createdAt?: Date;
}

export interface UserProfileOptionsProps {
    triggerOption: (value: string) => void;
}

export interface ChangePasswordData {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
}