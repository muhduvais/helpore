import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './routes/routes';
import volunteerRoutes from './routes/volunteerRoutes';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { handleError } from './middlewares/errorMiddleware';
import cookieParser from 'cookie-parser';
import "reflect-metadata";
import { registerDependencies } from "./container";

dotenv.config();

// Initializing dependency injection
registerDependencies();

const app = express();

const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api', router);

// Error handling middleware
app.use(handleError);

connectDB();

const PORT = parseInt(process.env.PORT, 10);
const SERVER_URL = process.env.SERVER_URL;

app.listen(PORT, () => {
    console.log(`Server running on ${SERVER_URL}`);
});
