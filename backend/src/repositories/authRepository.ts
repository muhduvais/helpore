import User from '../models/userModel';

class AuthRepository {
    async findUser(email: string) {
        return User.findOne({ email });
    }

    async createUser(newUser) {
        const { email, name, googleId, password, profilePicture } = newUser;
        const isVerified = true;
        try {
            const user = new User({ name, email, password, googleId, profilePicture, isVerified });
            await user.save();
            return user.email;
        } catch (error) {
            console.error('Error creating the user:', error);
            return null;
        }
    }

    async storeResetToken(email: string, resetToken: string, tokenExpiry: Date): Promise<void> {
        try {
            await User.updateOne(
                { email },
                { resetToken, resetTokenExpiry: tokenExpiry }
            );
        } catch (error) {
            console.error('Error storing the reset toekn:', error);
        }
    }

    async resetPassword(email: string, password: string): Promise<void> {
        try {
            await User.updateOne(
                { email },
                { password }
            );
        } catch (error) {
            console.error('Error saving the new password!', error);
        }
    }
}

export default AuthRepository;
