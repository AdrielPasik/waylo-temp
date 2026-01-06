import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[VALIDATION] Errors found:', errors.array());
    return res.status(400).json({ success: false, error: errors.array()[0]?.msg || 'Validation failed' });
  }
  next();
};
