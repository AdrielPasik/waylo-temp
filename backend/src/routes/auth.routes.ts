import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, me, refresh, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').optional().isString().trim()
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 8 })
  ],
  validate,
  login
);

router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', requireAuth, me);

export default router;
