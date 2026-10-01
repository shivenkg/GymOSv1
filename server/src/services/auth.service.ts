import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbPool } from '../config/db.ts';
import { config, isPostgresConfigured } from '../config/env.ts';
import { AuthUser } from '../middleware/auth.ts';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Hashes a plaintext password using bcrypt with configurable salt rounds.
 */
export async function hashPassword(plainText: string, saltRounds = 10): Promise<string> {
  return bcrypt.hash(plainText, saltRounds);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 */
export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

/**
 * Issues a signed HS256 JWT access token containing identity and tenant claims.
 */
export function generateToken(payload: {
  userId: string;
  tenantId: string | null;
  role: string;
  email: string;
  fullName: string;
  permissions: string[];
}, expiresIn: jwt.SignOptions['expiresIn'] = '8h'): string {
  const signOptions: jwt.SignOptions = {
    expiresIn,
    algorithm: 'HS256',
  };

  return jwt.sign(
    {
      sub: payload.userId,
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
      fullName: payload.fullName,
      permissions: payload.permissions,
    },
    config.jwtSecret,
    signOptions
  );
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    tenantId: string | null;
    avatarUrl?: string;
  };
  permissions: string[];
}

// Pre-generated bcrypt hashes for demo/sandbox fallback authentication
const DEMO_BCRYPT_HASH_DEMO = bcrypt.hashSync('demo', 10);
const DEMO_BCRYPT_HASH_ADMIN = bcrypt.hashSync('admin123', 10);
const DEMO_BCRYPT_HASH_STAFF = bcrypt.hashSync('staff123', 10);

interface DemoUserAccount {
  identifiers: string[];
  passwordHashes: string[];
  id: string;
  tenantId: string | null;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string;
  permissions: string[];
}

const DEMO_USERS: DemoUserAccount[] = [
  {
    identifiers: ['admin@ironcore.com', 'admin@gymos.io', 'aarav@ironcore.com'],
    passwordHashes: [DEMO_BCRYPT_HASH_DEMO, DEMO_BCRYPT_HASH_ADMIN],
    id: 'u-ironcore-admin',
    tenantId: '11111111-1111-1111-1111-111111111111',
    email: 'admin@ironcore.com',
    fullName: 'Aarav Sharma (Branch Manager)',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    permissions: [
      'members:read', 'members:write',
      'attendance:scan',
      'payments:read', 'payments:write',
      'classes:manage',
      'crm:manage',
      'staff:manage',
      'rbac:manage',
      'settings:manage',
    ],
  },
  {
    identifiers: ['staff@ironcore.com', 'staff@gymos.io'],
    passwordHashes: [DEMO_BCRYPT_HASH_DEMO, DEMO_BCRYPT_HASH_STAFF],
    id: 'u-ironcore-staff',
    tenantId: '11111111-1111-1111-1111-111111111111',
    email: 'staff@ironcore.com',
    fullName: 'Priya Patel (Head Coach)',
    role: 'staff',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    permissions: ['members:read', 'attendance:scan', 'classes:manage', 'crm:manage'],
  },
  {
    identifiers: ['superadmin', 'superadmin@gymos.cloud'],
    passwordHashes: [DEMO_BCRYPT_HASH_DEMO, DEMO_BCRYPT_HASH_ADMIN],
    id: 'u-superadmin',
    tenantId: null,
    email: 'superadmin@gymos.cloud',
    fullName: 'Platform Super Administrator',
    role: 'superadmin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    permissions: ['*'],
  },
];

export async function loginUser(emailOrUsername: string, pass: string): Promise<LoginResult> {
  const cleanIdentifier = emailOrUsername.trim().toLowerCase();

  // 1. Try real PostgreSQL database authentication if PostgreSQL is configured
  if (isPostgresConfigured()) {
    try {
      const pool = getDbPool();
      if (pool) {
        const userQuery = `
        SELECT 
          u.id, 
          u.tenant_id, 
          u.email, 
          u.password_hash, 
          u.full_name, 
          u.avatar_url, 
          u.is_active,
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE LOWER(u.email) = $1
        LIMIT 1;
      `;

        const { rows } = await pool.query(userQuery, [cleanIdentifier]);
        const user = rows[0];

        if (user) {
          if (!user.is_active) {
            throw new AuthError('This user account has been deactivated. Please contact your administrator.', 403);
          }

          const isMatch = await comparePassword(pass, user.password_hash);
          if (!isMatch) {
            throw new AuthError('Invalid email or password.', 401);
          }

          // Fetch permissions assigned to this user's role
          const permQuery = `
          SELECT p.code
          FROM permissions p
          INNER JOIN role_permissions rp ON rp.permission_id = p.id
          INNER JOIN users u ON u.role_id = rp.role_id
          WHERE u.id = $1;
        `;
          const permResult = await pool.query(permQuery, [user.id]);
          const permissions = permResult.rows.map((r: any) => r.code);
          const role = user.role_name || 'staff';

          const token = generateToken({
            userId: user.id,
            tenantId: user.tenant_id,
            role,
            email: user.email,
            fullName: user.full_name,
            permissions,
          });

          return {
            token,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.full_name,
              role,
              tenantId: user.tenant_id,
              avatarUrl: user.avatar_url,
            },
            permissions,
          };
        }
      }
    } catch (err: any) {
      if (err instanceof AuthError) {
        throw err;
      }
      console.warn('[GymOS Auth] PostgreSQL auth failed, falling back to demo verify:', err.message);
    }
  }

  // 2. Demo/Sandbox fallback authentication with bcrypt comparison
  const demoUser = DEMO_USERS.find(u => 
    u.identifiers.some(id => id.toLowerCase() === cleanIdentifier)
  );

  if (!demoUser) {
    throw new AuthError('Invalid email or password.', 401);
  }

  let matched = false;
  for (const hash of demoUser.passwordHashes) {
    if (await comparePassword(pass, hash)) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    throw new AuthError('Invalid email or password.', 401);
  }

  const token = generateToken({
    userId: demoUser.id,
    tenantId: demoUser.tenantId,
    role: demoUser.role,
    email: demoUser.email,
    fullName: demoUser.fullName,
    permissions: demoUser.permissions,
  });

  return {
    token,
    user: {
      id: demoUser.id,
      email: demoUser.email,
      fullName: demoUser.fullName,
      role: demoUser.role,
      tenantId: demoUser.tenantId,
      avatarUrl: demoUser.avatarUrl,
    },
    permissions: demoUser.permissions,
  };
}

export async function getUserProfile(userId: string): Promise<AuthUser | null> {
  if (isPostgresConfigured()) {
    try {
      const pool = getDbPool();
      if (!pool) return null;
      const queryText = `
        SELECT 
          u.id, 
          u.tenant_id, 
          u.email, 
          u.full_name, 
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
        LIMIT 1;
      `;
      const { rows } = await pool.query(queryText, [userId]);
      if (rows[0]) {
        const user = rows[0];
        const permQuery = `
          SELECT p.code
          FROM permissions p
          INNER JOIN role_permissions rp ON rp.permission_id = p.id
          INNER JOIN users u ON u.role_id = rp.role_id
          WHERE u.id = $1;
        `;
        const permRes = await pool.query(permQuery, [userId]);

        return {
          userId: user.id,
          tenantId: user.tenant_id,
          role: user.role_name || 'staff',
          email: user.email,
          fullName: user.full_name,
          permissions: permRes.rows.map((r: any) => r.code),
        };
      }
    } catch {
      // ignore and check fallback
    }
  }

  const demoUser = DEMO_USERS.find(u => u.id === userId);
  if (demoUser) {
    return {
      userId: demoUser.id,
      tenantId: demoUser.tenantId,
      role: demoUser.role,
      email: demoUser.email,
      fullName: demoUser.fullName,
      permissions: demoUser.permissions,
    };
  }

  return null;
}
