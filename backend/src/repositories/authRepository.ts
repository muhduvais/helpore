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
}

export default AuthRepository;
