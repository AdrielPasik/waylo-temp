import express, { Request, Response } from 'express';
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

// GLOBAL LOG - FIRST MIDDLEWARE
app.use((req, res, next) => {
  console.log('REQ:', req.method, req.url);
  next();
});

// CORS MUST BE BEFORE HELMET
app.use(cors({
  origin: [
    'https://waylo-temp.vercel.app',
    'https://waylo-temp.onrender.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Explicit OPTIONS handling for preflight
app.options('*', cors());

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(morgan('dev'));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | Origin: ${req.get('origin') || 'none'}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: env.rateLimitWindowMs, max: env.rateLimitMax }));

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

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
