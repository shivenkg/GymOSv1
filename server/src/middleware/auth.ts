import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.ts';

export interface AuthUser {
  userId: string;
  tenantId: string | null;
  role: string;
  email: string;
  fullName: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
    }
  }
}

/**
 * Rate limiter specifically for login attempts to thwart brute-force attacks.
 * Uses safe IP extraction from x-forwarded-for or socket without throwing validation errors behind proxies.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded[0]) {
      return forwarded[0].trim();
    }
    const forwardedStd = req.headers['forwarded'];
    if (typeof forwardedStd === 'string') {
      const match = forwardedStd.match(/for="?([^";,]+)"?/i);
      if (match && match[1]) return match[1].trim();
    }
    return req.ip || req.socket.remoteAddress || '127.0.0.1';
  },
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * Middleware that verifies the JWT token from the Authorization header.
 * Attaches decoded user information (userId, tenantId, role, permissions) to req.user.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      userId: decoded.userId || decoded.sub,
      tenantId: decoded.tenantId || null,
      role: decoded.role || 'staff',
      email: decoded.email,
      fullName: decoded.fullName || 'User',
      permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Session expired. Please log in again.' });
      return;
    }
    res.status(403).json({ error: 'Invalid or forged authentication token.' });
  }
}

/**
 * Enforces Role-Based Access Control (RBAC) server-side.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. Authentication required.' });
      return;
    }

    // SuperAdmin always has global override
    if (req.user.role === 'superadmin') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden. Role "${req.user.role}" does not have permission to perform this action.`,
      });
      return;
    }

    next();
  };
}

/**
 * Enforces specific permission code capability server-side.
 */
export function requirePermission(permissionCode: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    if (req.user.role === 'superadmin') {
      next();
      return;
    }

    if (!req.user.permissions.includes(permissionCode)) {
      res.status(403).json({
        error: `Forbidden. Required capability "${permissionCode}" is not granted for your role.`,
      });
      return;
    }

    next();
  };
}
