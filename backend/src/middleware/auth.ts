import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    userId: string;
    role: 'user' | 'admin';
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Debug logging
    console.log('[Auth] Verifying token:', token.substring(0, 20) + '...');

    let decodedToken: any;
    let isExtensionToken = false;

    try {
      // 1. Try to verify as Firebase ID Token
      decodedToken = await firebaseAuth.verifyIdToken(token);
      // console.log('[Auth] Valid Firebase Token for:', decodedToken.email);
    } catch (firebaseError: any) {
      console.log('[Auth] Firebase verification failed:', firebaseError.code || firebaseError.message);

      // DEBUG: Decode token to see why
      try {
        const decodedDebug = jwt.decode(token) as any;
        if (decodedDebug) {
          console.log('[Auth] Debug Token Payload:', {
            iss: decodedDebug.iss,
            aud: decodedDebug.aud,
            exp: decodedDebug.exp,
            sub: decodedDebug.sub,
            iat: decodedDebug.iat
          });
          // Check expiration
          const now = Math.floor(Date.now() / 1000);
          if (decodedDebug.exp && decodedDebug.exp < now) {
            console.log('[Auth] Token is EXPIRED by', now - decodedDebug.exp, 'seconds');
          }
        }
      } catch (e) { console.log('[Auth] Token not decodable'); }

      // 2. Try to verify as Extension JWT
      try {
        const secretKey = process.env.API_SECRET_KEY || 'default_secret_key';
        decodedToken = jwt.verify(token, secretKey);
        isExtensionToken = true;
        console.log('[Auth] Valid Extension Token for:', decodedToken.email);
      } catch (jwtError) {
        console.error('[Auth] JWT verification also failed');
        throw new Error('Invalid token');
      }
    }

    // Get user from database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    // If user doesn't exist in DB, create them (only for Firebase flows usually)
    if (!user) {
      // For extension token, we expect user to already exist (since we created token from user)
      // But if somehow missing, we error out or handle it
      if (isExtensionToken) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0],
        photoURL: decodedToken.picture,
        role: 'user',
      });
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const verifyApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_SECRET_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  next();
};
