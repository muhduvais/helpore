import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { handleError } from './middlewares/errorMiddleware';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use(handleError);

connectDB();

const PORT = parseInt(process.env.PORT, 10);
const SERVER_URL = process.env.SERVER_URL;

app.listen(PORT, () => {
    console.log(`Server running on ${SERVER_URL}`);
});
