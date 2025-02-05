import User from '../models/userModel';

class AuthRepository {
    async findUser(email: string) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async findUserById(userId: string) {
        try {
            return await User.findById(userId);
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async createUser(newUser) {
        const { email, name, googleId, password, profilePicture } = newUser;
        const isVerified = true;
        try {
            const user = new User({ name, email, password, googleId, profilePicture, isVerified, role: 'user' });
            await user.save();
            return user;
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
