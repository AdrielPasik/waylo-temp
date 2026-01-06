import mongoose from 'mongoose';
import { env } from './environment';

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri);
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error', err);
  });
};
