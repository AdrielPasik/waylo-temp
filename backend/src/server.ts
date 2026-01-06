import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { env } from './config/environment';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimit({ windowMs: env.rateLimitWindowMs, max: env.rateLimitMax }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

void start();
