import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Trip } from '../models';

const parsePagination = (req: AuthenticatedRequest) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';
  return { page, limit, sort: [[sortBy, order]] as [string, 'asc' | 'desc'][] };
};

type Subdoc = { _id?: { toString(): string } };

const findSubdoc = <T extends Subdoc>(items: T[], id: string) =>
  items.find((item) => item._id?.toString() === id);

const removeSubdoc = <T extends Subdoc>(items: T[], id: string) =>
  items.filter((item) => item._id?.toString() !== id);

export const listTrips = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page, limit, sort } = parsePagination(req);
    const [trips, total] = await Promise.all([
      Trip.find({ userId }).sort(sort).skip((page - 1) * limit).limit(limit),
      Trip.countDocuments({ userId })
    ]);
    return res.json({ success: true, data: { trips, total, page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getTrip = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const trip = await Trip.findOne({ _id: req.params.tripId, userId });
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const trip = await Trip.create({ ...req.body, userId });
    return res.status(201).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.tripId, userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const patchTrip = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.tripId, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const deleted = await Trip.findOneAndDelete({ _id: req.params.tripId, userId });
    if (!deleted) return res.status(404).json({ success: false, error: 'Trip not found' });
    return res.json({ success: true, data: { message: 'Trip deleted' } });
  } catch (error) {
    next(error);
  }
};

const getTripForUser = async (req: AuthenticatedRequest) => {
  const userId = req.user?.id;
  return Trip.findOne({ _id: req.params.tripId, userId });
};

export const addDestination = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    trip.destinations.push(req.body);
    await trip.save();
    return res.status(201).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const destination = trip.destinations.find((d: any) => d._id.toString() === req.params.destinationId);
    if (!destination) return res.status(404).json({ success: false, error: 'Destination not found' });
    Object.assign(destination, req.body);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const destination = findSubdoc(trip.destinations, req.params.destinationId);
    if (!destination) return res.status(404).json({ success: false, error: 'Destination not found' });
    trip.destinations = removeSubdoc(trip.destinations, req.params.destinationId);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const addExpense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    trip.expenses.push(req.body);
    await trip.save();
    return res.status(201).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const expense = findSubdoc(trip.expenses, req.params.expenseId);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    Object.assign(expense, req.body);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const expense = findSubdoc(trip.expenses, req.params.expenseId);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    trip.expenses = removeSubdoc(trip.expenses, req.params.expenseId);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const addTransportation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    trip.transportation.push(req.body);
    await trip.save();
    return res.status(201).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const updateTransportation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const transport = findSubdoc(trip.transportation, req.params.transportationId);
    if (!transport) return res.status(404).json({ success: false, error: 'Transportation not found' });
    Object.assign(transport, req.body);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const deleteTransportation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const transport = findSubdoc(trip.transportation, req.params.transportationId);
    if (!transport) return res.status(404).json({ success: false, error: 'Transportation not found' });
    trip.transportation = removeSubdoc(trip.transportation, req.params.transportationId);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const addAccommodation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    trip.accommodation.push(req.body);
    await trip.save();
    return res.status(201).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const updateAccommodation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const accommodation = findSubdoc(trip.accommodation, req.params.accommodationId);
    if (!accommodation) return res.status(404).json({ success: false, error: 'Accommodation not found' });
    Object.assign(accommodation, req.body);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

export const deleteAccommodation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await getTripForUser(req);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    const accommodation = findSubdoc(trip.accommodation, req.params.accommodationId);
    if (!accommodation) return res.status(404).json({ success: false, error: 'Accommodation not found' });
    trip.accommodation = removeSubdoc(trip.accommodation, req.params.accommodationId);
    await trip.save();
    return res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};
