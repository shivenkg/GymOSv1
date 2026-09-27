import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.ts';
import { enforceTenant } from '../middleware/tenant.ts';
import * as crmService from '../services/crm.service.ts';

export const crmRouter = Router();

crmRouter.use(authenticateToken);
crmRouter.use(enforceTenant);

// GET /api/crm/leads
crmRouter.get('/leads', requirePermission('crm:manage'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId;
    const leads = await crmService.getLeads(tenantId);
    res.json({ leads, count: leads.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/crm/leads
crmRouter.post('/leads', requirePermission('crm:manage'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const lead = await crmService.createLead(tenantId, req.body);
    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (err) {
    next(err);
  }
});

// PUT /api/crm/leads/:id
crmRouter.put('/leads/:id', requirePermission('crm:manage'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const updated = await crmService.updateLead(tenantId, req.params.id, req.body);
    res.json({ message: 'Lead updated successfully', lead: updated });
  } catch (err) {
    next(err);
  }
});
