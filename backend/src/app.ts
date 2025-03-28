import express from 'express';
import cors from 'cors';
import router from './routes/routes';
import { connectDB } from './config';
import dotenv from 'dotenv';
import { handleError } from './middlewares';
import cookieParser from 'cookie-parser';
import "reflect-metadata";
import { registerDependencies } from "./container";
import http from 'http';
import { setupSocketIO } from './utils/socket.util';
import morgan from 'morgan';
import { DonationController } from './controllers/implementation/donation.controller';
import { IDonationController } from './controllers/interfaces/IDonationController';
import { container } from 'tsyringe';

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

// Webhook listener
const donationController = container.resolve<IDonationController>('IDonationController');
app.post('/api/donations/webhook', express.raw({ type: 'application/json' }), donationController.webhook);

app.use(cookieParser());
app.use(express.json());

app.use(morgan("dev"));

// Routes
app.use('/api', router);

// Error handling middleware
app.use(handleError);

connectDB();

const PORT = parseInt(process.env.PORT as string, 10);
const SERVER_URL = process.env.SERVER_URL;

server.listen(PORT, () => {
    console.log(`Server running on ${SERVER_URL}`);
});
