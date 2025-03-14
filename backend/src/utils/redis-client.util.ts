import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

redisClient.connect().then(() => {
  console.log('Connected to Redis');
});

export { redisClient };