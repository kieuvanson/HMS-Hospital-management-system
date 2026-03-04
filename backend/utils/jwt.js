import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';
const ACCESS_TOKEN_TTL= '7d';
const refreshTokenTTL= 30*24*60*60*1000; 
export const createAccessToken=(user) =>
           jwt.sign(
        {
            id: user._id,     
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
export const createrefreshToken=() => crypto.randomBytes(40).toString('hex');

export const saveRefreshToken = async (user, refreshToken, res) => {
  await Session.create({
    userId: user._id,  
            role: user.role,
            refreshToken,
            expiresAt: new Date(Date.now() + refreshTokenTTL),
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: refreshTokenTTL,
  });
};


export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};