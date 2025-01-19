import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import connectDB from './config/db';
import adminRoutes from './routes/adminRoutes';
import dotenv from 'dotenv';
import { handleError } from './middlewares/errorMiddleware';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const CLIENT_PORT = parseInt(process.env.CLIENT_PORT, 10);

app.use(cors({
  origin: `http://localhost:${CLIENT_PORT}`,
  credentials: true,
}));

app.use(cookieParser());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(handleError);

connectDB();

const PORT = parseInt(process.env.PORT, 10);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
