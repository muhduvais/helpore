import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Helpore')
        console.log('MongoDB connected')
    } catch (err) {
        console.log('Error connecting to mongodb', err);
    }
}

export default connectDB;