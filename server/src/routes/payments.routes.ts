import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.ts';
import { enforceTenant } from '../middleware/tenant.ts';
import * as paymentsService from '../services/payments.service.ts';

export const paymentsRouter = Router();

paymentsRouter.use(authenticateToken);
paymentsRouter.use(enforceTenant);

// GET /api/payments
paymentsRouter.get('/', requirePermission('payments:read'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId;
    const payments = await paymentsService.getPayments(tenantId);
    res.json({ payments, count: payments.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments
paymentsRouter.post('/', requirePermission('payments:write'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const payment = await paymentsService.createPayment(tenantId, req.body);
    res.status(201).json({ message: 'Payment recorded successfully', payment });
  } catch (err) {
    next(err);
  }
});
