import { createClient } from 'redis';

const client = createClient({
  url: 'redis://localhost:6379',
});

client.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

client.connect().then(() => {
  console.log('Connected to Redis');
});

export default client;