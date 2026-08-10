import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../infrastructure/database/prisma';
import { mockUsers } from '../config/mockStore';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isAdmin: boolean;
    collegeId?: string;
  };
}

import { JWT_SECRET } from '../config/env';

export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized: Access token missing.' });
  }

  // Handle Mock Login Fallback for dev testing
  if (token.startsWith('mock_token_')) {
    const userId = token.replace('mock_token_', '');
    const mockUser = mockUsers.find(u => u._id === userId);
    
    if (mockUser) {
      req.user = {
        id: mockUser._id,
        email: mockUser.email,
        role: mockUser.isAdmin ? UserRole.SUPER_ADMIN : UserRole.STUDENT,
        isAdmin: mockUser.isAdmin
      };
      return next();
    }
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isAdmin: true, collegeId: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      collegeId: user.collegeId
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized: Invalid or expired token.' });
  }
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function restrictTo(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role ${req.user.role} does not have required permissions.`
      });
    }

    next();
  };
}

/**
 * Admin-only Guard
 */
export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user && (req.user.isAdmin || req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.COLLEGE_ADMIN)) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
}
