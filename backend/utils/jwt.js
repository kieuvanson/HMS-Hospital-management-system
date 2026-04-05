import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';
const ACCESS_TOKEN_TTL= '7d';
const refreshTokenTTL= 30*24*60*60*1000; 
const isProduction = process.env.NODE_ENV === 'production';

const getJwtSecret = () => (
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  ''
).trim();

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  // Cross-site cookie required when frontend and backend are on different domains
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: refreshTokenTTL,
});

export const getRefreshCookieClearOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
});

export const createAccessToken=(user) =>
       (() => {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      throw new Error('Missing JWT secret. Set ACCESS_TOKEN_SECRET (or JWT_SECRET) in environment variables.');
    }
    return jwt.sign(
    {
      id: user._id,     
      role: user.role
    },
    jwtSecret,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
  })();
export const createrefreshToken=() => crypto.randomBytes(40).toString('hex');

export const saveRefreshToken = async (user, refreshToken, res) => {
  await Session.create({
    userId: user._id,  
            role: user.role,
            refreshToken,
            expiresAt: new Date(Date.now() + refreshTokenTTL),
  });

  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
};


export const verifyAccessToken = (token) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    throw new Error('Missing JWT secret. Set ACCESS_TOKEN_SECRET (or JWT_SECRET) in environment variables.');
  }
  return jwt.verify(token, jwtSecret);
};