import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.ts';
import { enforceTenant } from '../middleware/tenant.ts';
import * as staffService from '../services/staff.service.ts';

export const staffRouter = Router();

staffRouter.use(authenticateToken);
staffRouter.use(enforceTenant);

// GET /api/staff
staffRouter.get('/', requirePermission('staff:manage'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId;
    const staff = await staffService.getStaff(tenantId);
    res.json({ staff, count: staff.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/staff
staffRouter.post('/', requirePermission('staff:manage'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const member = await staffService.createStaff(tenantId, req.body);
    res.status(201).json({ message: 'Staff member added successfully', staff: member });
  } catch (err) {
    next(err);
  }
});

// PUT /api/staff/:id
staffRouter.put('/:id', requirePermission('staff:manage'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const updated = await staffService.updateStaff(tenantId, req.params.id, req.body);
    res.json({ message: 'Staff updated successfully', staff: updated });
  } catch (err) {
    next(err);
  }
});
