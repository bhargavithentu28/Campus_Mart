import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isMockDB, connectDB } from '../config/db';
import User from '../models/User';
import { mockUsers } from '../config/mockStore';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'campusmart_secret_key_123';

export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing.' });
  }

  // Handle Mock Login Fallback
  if (token.startsWith('mock_token_')) {
    const userId = token.replace('mock_token_', '');
    const user = mockUsers.find(u => u._id === userId);
    
    if (user) {
      req.user = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      };
      return next();
    }
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (isMockDB) {
      const user = mockUsers.find(u => u._id === decoded.id);
      if (user) {
        req.user = { id: user._id, email: user.email, isAdmin: user.isAdmin };
        return next();
      }
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = { id: user.id, email: user.email, isAdmin: user.isAdmin };
        return next();
      }
    }

    return res.status(401).json({ success: false, message: 'User not found in system.' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid.' });
  }
}

export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
}
