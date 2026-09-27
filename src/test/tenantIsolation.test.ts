import { describe, it, expect, vi } from 'vitest';
import { enforceTenant } from '../../server/src/middleware/tenant.ts';
import { authenticateToken } from '../../server/src/middleware/auth.ts';
import jwt from 'jsonwebtoken';
import { config } from '../../server/src/config/env.ts';

describe('Multi-Tenant Isolation Security & Regression Suite', () => {
  const tenantA = '11111111-1111-1111-1111-111111111111';
  const tenantB = '22222222-2222-2222-2222-222222222222';

  it('rejects unauthenticated requests trying to access tenant data', () => {
    const req: any = { user: undefined };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    enforceTenant(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('prohibits tenant spoofing when client body specifies a different tenant_id', () => {
    const req: any = {
      user: {
        userId: 'user-001',
        tenantId: tenantA,
        role: 'admin',
        permissions: ['members:read', 'members:write'],
      },
      body: {
        tenant_id: tenantB, // Attacker attempting cross-tenant injection
        fullName: 'Unauthorized Member',
      },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    enforceTenant(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Tenant isolation violation'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('allows authorized requests matching the verified JWT tenant', () => {
    const req: any = {
      user: {
        userId: 'user-001',
        tenantId: tenantA,
        role: 'admin',
        permissions: ['members:read'],
      },
      body: {
        tenant_id: tenantA,
      },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    enforceTenant(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('verifies JWT token signature and populates verified tenantId', () => {
    const validToken = jwt.sign(
      {
        userId: 'user-123',
        tenantId: tenantA,
        role: 'admin',
        permissions: ['members:read'],
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    const req: any = {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.tenantId).toBe(tenantA);
    expect(req.user.tenantId).not.toBe(tenantB);
  });

  it('prohibits tenant spoofing when client query specifies a different tenant_id', () => {
    const req: any = {
      user: {
        userId: 'user-001',
        tenantId: tenantA,
        role: 'admin',
        permissions: ['members:read'],
      },
      query: {
        tenant_id: tenantB, // Attacker attempting query-string tenant injection
      },
      body: {},
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    enforceTenant(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Tenant isolation violation'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('allows SuperAdmin to view any tenant via query', () => {
    const req: any = {
      user: {
        userId: 'super-001',
        tenantId: null,
        role: 'superadmin',
        permissions: ['*'],
      },
      query: {
        tenant_id: tenantB,
      },
      body: {},
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    enforceTenant(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.tenantId).toBe(tenantB);
  });
});

describe('Authentication & Password Hashing Suite', () => {
  it('hashes passwords using bcrypt and verifies matches', async () => {
    const { hashPassword, comparePassword } = await import('../../server/src/services/auth.service.ts');
    const password = 'SuperSecretGymPassword#2026';
    const hash = await hashPassword(password, 10);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('authenticates valid credentials, hashes and returns signed JWT with tenant claims', async () => {
    const { loginUser } = await import('../../server/src/services/auth.service.ts');
    const result = await loginUser('admin@ironcore.com', 'demo');

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('admin@ironcore.com');
    expect(result.user.role).toBe('admin');
    expect(result.user.tenantId).toBe('11111111-1111-1111-1111-111111111111');
    expect(result.permissions).toContain('members:read');

    // Decode and verify the JWT payload
    const decoded = jwt.verify(result.token, config.jwtSecret) as any;
    expect(decoded.userId).toBe(result.user.id);
    expect(decoded.tenantId).toBe('11111111-1111-1111-1111-111111111111');
    expect(decoded.role).toBe('admin');
  });

  it('rejects invalid credentials with 401 AuthError', async () => {
    const { loginUser, AuthError } = await import('../../server/src/services/auth.service.ts');
    
    await expect(loginUser('admin@ironcore.com', 'wrong_password_123')).rejects.toThrow(AuthError);
    await expect(loginUser('nonexistent@user.com', 'demo')).rejects.toThrow('Invalid email or password.');
  });
});
