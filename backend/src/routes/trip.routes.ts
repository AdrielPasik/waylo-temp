import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  addAccommodation,
  addDestination,
  addExpense,
  addTransportation,
  createTrip,
  deleteAccommodation,
  deleteDestination,
  deleteExpense,
  deleteTransportation,
  deleteTrip,
  getTrip,
  listTrips,
  patchTrip,
  updateAccommodation,
  updateDestination,
  updateExpense,
  updateTransportation,
  updateTrip
} from '../controllers/tripController';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

const tripIdParam = param('tripId').isMongoId().withMessage('Invalid trip id');

router.get('/', requireAuth, listTrips);
router.get('/:tripId', requireAuth, [tripIdParam], validate, getTrip);

router.post(
  '/',
  requireAuth,
  [
    body('title').trim().notEmpty().isLength({ max: 100 }),
    body('budget').optional().isFloat({ min: 0 }),
    body('currency').trim().notEmpty()
  ],
  validate,
  createTrip
);

router.put('/:tripId', requireAuth, [tripIdParam], validate, updateTrip);
router.patch('/:tripId', requireAuth, [tripIdParam], validate, patchTrip);
router.delete('/:tripId', requireAuth, [tripIdParam], validate, deleteTrip);

router.post('/:tripId/destinations', requireAuth, [tripIdParam, body('city').notEmpty(), body('country').notEmpty()], validate, addDestination);
router.put('/:tripId/destinations/:destinationId', requireAuth, [tripIdParam], validate, updateDestination);
router.delete('/:tripId/destinations/:destinationId', requireAuth, [tripIdParam], validate, deleteDestination);

router.post('/:tripId/expenses', requireAuth, [tripIdParam, body('description').notEmpty(), body('amount').isFloat({ min: 0 }), body('currency').notEmpty()], validate, addExpense);
router.put('/:tripId/expenses/:expenseId', requireAuth, [tripIdParam], validate, updateExpense);
router.delete('/:tripId/expenses/:expenseId', requireAuth, [tripIdParam], validate, deleteExpense);

router.post('/:tripId/transportation', requireAuth, [tripIdParam, body('type').notEmpty(), body('from').notEmpty(), body('to').notEmpty(), body('date').notEmpty()], validate, addTransportation);
router.put('/:tripId/transportation/:transportationId', requireAuth, [tripIdParam], validate, updateTransportation);
router.delete('/:tripId/transportation/:transportationId', requireAuth, [tripIdParam], validate, deleteTransportation);

router.post('/:tripId/accommodation', requireAuth, [tripIdParam, body('name').notEmpty(), body('city').notEmpty(), body('checkIn').notEmpty(), body('checkOut').notEmpty()], validate, addAccommodation);
router.put('/:tripId/accommodation/:accommodationId', requireAuth, [tripIdParam], validate, updateAccommodation);
router.delete('/:tripId/accommodation/:accommodationId', requireAuth, [tripIdParam], validate, deleteAccommodation);

export default router;
