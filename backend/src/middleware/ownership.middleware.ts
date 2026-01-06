import { Response, NextFunction } from 'express';
import { Trip } from '../models';
import { AuthenticatedRequest } from './auth.middleware';

export const loadTripAndVerify = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user?.id });
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    (req as AuthenticatedRequest & { trip?: typeof trip }).trip = trip;
    next();
  } catch (error) {
    next(error);
  }
};
