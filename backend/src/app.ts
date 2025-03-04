import express from 'express';
import cors from 'cors';
import router from './routes/routes';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { handleError } from './middlewares/errorMiddleware';
import cookieParser from 'cookie-parser';
import "reflect-metadata";
import { registerDependencies } from "./container";
import http from 'http';
import { setupSocketIO } from './utils/socket';

dotenv.config();

// Initializing dependency injection
registerDependencies();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

const io = setupSocketIO(server);
app.set('socketio', io);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api', router);

// Error handling middleware
app.use(handleError);

connectDB();

const PORT = parseInt(process.env.PORT, 10);
const SERVER_URL = process.env.SERVER_URL;

server.listen(PORT, () => {
    console.log(`Server running on ${SERVER_URL}`);
});
