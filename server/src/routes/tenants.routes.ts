import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.ts';
import * as tenantsService from '../services/tenants.service.ts';

export const tenantsRouter = Router();

tenantsRouter.use(authenticateToken);

// GET /api/tenants (SuperAdmin or TenantAdmin)
tenantsRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user!.role === 'superadmin') {
      const tenants = await tenantsService.getTenants();
      res.json({ tenants });
      return;
    }

    if (req.user!.tenantId) {
      const tenant = await tenantsService.getTenantById(req.user!.tenantId);
      res.json({ tenants: tenant ? [tenant] : [] });
      return;
    }

    res.json({ tenants: [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/tenants/roles (List roles and permissions)
tenantsRouter.get('/roles', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await tenantsService.getTenantRoles(req.user!.tenantId);
    res.json({ roles });
  } catch (err) {
    next(err);
  }
});
