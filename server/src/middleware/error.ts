import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Structured logging (never log passwords or sensitive tokens)
  console.error(`[GymOS Server Error] ${req.method} ${req.originalUrl} - Status ${status}:`, {
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    user: req.user ? { userId: req.user.userId, tenantId: req.user.tenantId, role: req.user.role } : null,
  });

  res.status(status).json({
    error: message,
    statusCode: status,
    timestamp: new Date().toISOString(),
  });
}
