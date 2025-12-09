import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import admin from '../config/firebase.js';
import jwt from 'jsonwebtoken';

// Login endpoint for extension
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('[AUTH] Login request received');

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    console.log('[AUTH] Looking for user:', email.toLowerCase());

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('[AUTH] User not found:', email);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    console.log('[AUTH] User found:', user.email, 'UID:', user.firebaseUid);
    console.log('[AUTH] Creating extension JWT token...');

    // Create a standard JWT for the extension
    // We use a long expiration (30 days) for convenience
    // This solves the issue where Firebase Admin can't verify Custom Tokens
    const secretKey = process.env.API_SECRET_KEY || 'default_secret_key';
    const token = jwt.sign(
      {
        uid: user.firebaseUid,
        email: user.email,
        role: user.role,
        type: 'extension_token' // Marker to identify this token type
      },
      secretKey,
      { expiresIn: '30d' }
    );

    console.log('[AUTH] Extension JWT created successfully');

    const response = {
      token: token,
      userId: user._id,
      uid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };

    console.log('[AUTH] Sending response');
    res.json(response);
  } catch (error: any) {
    console.error('[AUTH] Login error:', error);
    console.error('[AUTH] Error stack:', error.stack);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findOne({ firebaseUid: req.user?.uid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { displayName, photoURL } = req.body;

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user?.uid },
      { displayName, photoURL },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
