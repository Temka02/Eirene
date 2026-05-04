import 'dotenv/config';
import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDB } from './config/db';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { startDeadlineScheduler } from './utils/scheduler';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  if (!req.path.startsWith('/api-docs')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Eirene Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  startDeadlineScheduler();

  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

export default app;
