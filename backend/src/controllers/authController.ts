import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/environment';
import { User, RefreshToken } from '../models';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const parseDurationToMs = (value: string): number => {
  const match = /^([0-9]+)([smhd])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
    default:
      return amount * 24 * 60 * 60 * 1000;
  }
};

const buildCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: parseDurationToMs(env.refreshTokenExpiresIn)
});

const generateTokens = async (userId: string) => {
  const accessTokenUser = { userId };
  const refreshTokenString = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.refreshTokenExpiresIn));
  await RefreshToken.create({ userId, token: refreshTokenString, expiresAt });
  const user = await User.findById(userId);
  const accessToken = user?.generateAuthToken();
  return { accessToken, refreshTokenString };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  console.log('[REGISTER] Endpoint called | Email:', req.body.email, '| Has password:', !!req.body.password, '| Has name:', !!req.body.name);
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, error: 'Email already in use' });

    const user = await User.create({ email, password, name });
    const { accessToken, refreshTokenString } = await generateTokens(user.id);

    res.cookie('refreshToken', refreshTokenString, buildCookieOptions());
    return res.status(201).json({ success: true, data: { user, accessToken, refreshToken: refreshTokenString } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const { accessToken, refreshTokenString } = await generateTokens(user.id);
    res.cookie('refreshToken', refreshTokenString, buildCookieOptions());
    return res.json({ success: true, data: { user, accessToken, refreshToken: refreshTokenString } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req as Request & { cookies?: Record<string, string> }).cookies?.refreshToken || req.body.refreshToken;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }
    res.clearCookie('refreshToken');
    return res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req as Request & { cookies?: Record<string, string> }).cookies?.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: 'Refresh token missing' });

    const stored = await RefreshToken.findOne({ token });
    if (!stored) return res.status(401).json({ success: false, error: 'Invalid refresh token' });

    if (stored.expiresAt.getTime() < Date.now()) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({ success: false, error: 'Refresh token expired' });
    }

    const { accessToken, refreshTokenString } = await generateTokens(stored.userId.toString());
    await RefreshToken.deleteOne({ _id: stored._id });
    res.cookie('refreshToken', refreshTokenString, buildCookieOptions());
    return res.json({ success: true, data: { accessToken, refreshToken: refreshTokenString } });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
