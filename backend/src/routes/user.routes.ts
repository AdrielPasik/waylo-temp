import { Router } from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.put(
  '/me',
  requireAuth,
  [body('name').optional().isString().trim(), body('preferences').optional().isObject()],
  validate,
  updateProfile
);

export default router;
