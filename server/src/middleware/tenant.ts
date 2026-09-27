import { Request, Response, NextFunction } from 'express';

/**
 * Tenant resolution middleware:
 * Enforces that requests targeting tenant data have a verified tenantId attached from the verified JWT.
 * Prevents client-supplied query/body spoofing of tenant_id.
 */
export function enforceTenant(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required for tenant operations.' });
    return;
  }

  // SuperAdmin may inspect any tenant if explicitly requested via query, else acts on default/global
  if (req.user.role === 'superadmin') {
    const requestedTenant = (req.query.tenant_id as string) || req.user.tenantId;
    if (requestedTenant) {
      req.user.tenantId = requestedTenant;
    }
    next();
    return;
  }

  if (!req.user.tenantId) {
    res.status(403).json({ error: 'User is not associated with an active tenant.' });
    return;
  }

  // Override any client attempt to supply a different tenant_id in body or query
  if (req.body && req.body.tenant_id && req.body.tenant_id !== req.user.tenantId) {
    res.status(403).json({ error: 'Tenant isolation violation: cross-tenant access prohibited.' });
    return;
  }

  if (req.query && req.query.tenant_id && req.query.tenant_id !== req.user.tenantId) {
    res.status(403).json({ error: 'Tenant isolation violation: cross-tenant access prohibited.' });
    return;
  }

  // Attach canonical verified tenant ID to request context
  req.tenantId = req.user.tenantId;

  next();
}
