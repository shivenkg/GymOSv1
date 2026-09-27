import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './config/logger.ts';
import { checkDbConnection } from './config/db.ts';
import { authRouter } from './routes/auth.routes.ts';
import { membersRouter } from './routes/members.routes.ts';
import { paymentsRouter } from './routes/payments.routes.ts';
import { attendanceRouter } from './routes/attendance.routes.ts';
import { crmRouter } from './routes/crm.routes.ts';
import { staffRouter } from './routes/staff.routes.ts';
import { tenantsRouter } from './routes/tenants.routes.ts';
import { adminRouter } from './routes/admin.routes.ts';
import { sheetsRouter } from './routes/sheets.routes.ts';
import { errorHandler } from './middleware/error.ts';

export function createExpressApp(): Express {
  const app = express();

  // Basic security and parsing middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Structured request logger with sensitive data redaction (excludes health pings)
  app.use(pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => !req.url || req.url.startsWith('/health') || !req.url.startsWith('/api'),
    },
  }));

  // GET /health - Checks server status and DB connectivity
  app.get(['/health', '/health/'], async (_req: Request, res: Response): Promise<void> => {
    try {
      const dbStatus = await checkDbConnection();
      res.status(200).json({
        status: 'UP',
        service: 'GymOS Enterprise Backend API',
        timestamp: new Date().toISOString(),
        database: {
          configured: !dbStatus.error?.includes('not configured'),
          connected: dbStatus.healthy,
          latencyMs: dbStatus.latencyMs,
          mode: dbStatus.healthy ? 'POSTGRES_LIVE' : 'DEMO_STANDALONE',
          error: dbStatus.error,
        },
      });
    } catch (err: any) {
      res.status(200).json({
        status: 'UP',
        service: 'GymOS Enterprise Backend API',
        timestamp: new Date().toISOString(),
        database: {
          configured: false,
          connected: false,
          mode: 'DEMO_STANDALONE',
          error: err.message,
        },
      });
    }
  });

  // Resource routers
  app.use('/api/auth', authRouter);
  app.use('/api/members', membersRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/attendance', attendanceRouter);
  app.use('/api/crm', crmRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/tenants', tenantsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/integrations/sheets', sheetsRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
