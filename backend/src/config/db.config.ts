import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string)
        console.log('MongoDB connected')
    } catch (err) {
        console.log('Error connecting to mongodb', err);
    }
}

export { connectDB };