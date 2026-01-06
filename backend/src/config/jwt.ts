import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { env } from './environment';

type JwtPayloadInput = string | Buffer | object;

const jwtSecret: Secret = env.jwtSecret;
const accessTokenOptions: SignOptions = { expiresIn: parseInt(env.jwtExpiresIn) };

export const signAccessToken = (payload: JwtPayloadInput): string => {
  return jwt.sign(payload, jwtSecret, accessTokenOptions);
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, jwtSecret) as T;
};
