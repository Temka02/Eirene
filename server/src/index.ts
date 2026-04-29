import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import logger from './utils/logger';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Eirene Server is running' });
});
app.use('/api/auth', authRoutes);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
