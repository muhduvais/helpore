import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import connectDB from './config/db';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send("Backend is running!");
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
