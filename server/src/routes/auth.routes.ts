import { Router, Request, Response, NextFunction } from 'express';
import { loginUser, getUserProfile, AuthError } from '../services/auth.service.ts';
import { authenticateToken, loginRateLimiter } from '../middleware/auth.ts';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', loginRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, username } = req.body || {};
    const identifier = (email || username || '').toString().trim();
    const rawPassword = (password || '').toString();

    if (!identifier || !rawPassword) {
      res.status(400).json({ error: 'Email/username and password are required.' });
      return;
    }

    const result = await loginUser(identifier, rawPassword);
    res.json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
      permissions: result.permissions,
    });
  } catch (err: any) {
    if (err instanceof AuthError || err.statusCode) {
      res.status(err.statusCode || 401).json({ error: err.message, statusCode: err.statusCode || 401 });
      return;
    }
    next(err);
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const profile = await getUserProfile(req.user.userId);
    res.json({ user: profile || req.user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response): void => {
  // Stateless JWT invalidation on client
  res.json({ message: 'Logged out successfully.' });
});
