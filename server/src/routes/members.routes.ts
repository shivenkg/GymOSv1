import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.ts';
import { enforceTenant } from '../middleware/tenant.ts';
import * as membersService from '../services/members.service.ts';

export const membersRouter = Router();

membersRouter.use(authenticateToken);
membersRouter.use(enforceTenant);

// GET /api/members
membersRouter.get('/', requirePermission('members:read'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId;
    const members = await membersService.getMembers(tenantId);
    res.json({ members, count: members.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/members
membersRouter.post('/', requirePermission('members:write'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const newMember = await membersService.createMember(tenantId, req.body);
    res.status(201).json({ message: 'Member created successfully', member: newMember });
  } catch (err) {
    next(err);
  }
});

// PUT /api/members/:id
membersRouter.put('/:id', requirePermission('members:write'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const updated = await membersService.updateMember(tenantId, req.params.id, req.body);
    res.json({ message: 'Member updated successfully', member: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/members/:id
membersRouter.delete('/:id', requirePermission('members:write'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const result = await membersService.deleteMember(tenantId, req.params.id);
    res.json({ message: 'Member deleted successfully', ...result });
  } catch (err) {
    next(err);
  }
});
