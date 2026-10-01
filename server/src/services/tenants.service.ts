import { getDbPool } from '../config/db.ts';

const memoryTenants = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'IronCore Fitness Downtown',
    slug: 'ironcore-downtown',
    domain: 'ironcore.gymos.io',
    plan: 'Enterprise',
    status: 'Active',
    contactEmail: 'admin@ironcore.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    totalMembers: 1248,
    totalStaff: 24,
  },
];

const memoryRoles = [
  { id: 'role-superadmin', name: 'superadmin', displayName: 'Super Administrator', isSystem: true, permissions: ['*'] },
  { id: 'role-director', name: 'director', displayName: 'Facility Director', isSystem: true, permissions: ['members:*', 'payments:*', 'attendance:*', 'staff:*', 'crm:*', 'reports:*'] },
  { id: 'role-manager', name: 'manager', displayName: 'Branch Manager', isSystem: true, permissions: ['members:*', 'payments:*', 'attendance:*', 'staff:read', 'crm:*'] },
  { id: 'role-staff', name: 'staff', displayName: 'Front Desk Operator', isSystem: true, permissions: ['members:read', 'members:write', 'attendance:*', 'payments:write'] },
];

export async function getTenants() {
  const pool = getDbPool();
  if (!pool) {
    return memoryTenants;
  }

  try {
    const { rows } = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.domain,
        t.plan,
        t.status,
        t.contact_email as "contactEmail",
        t.created_at as "createdAt",
        COUNT(DISTINCT m.id)::int as "totalMembers",
        COUNT(DISTINCT s.id)::int as "totalStaff"
      FROM tenants t
      LEFT JOIN members m ON m.tenant_id = t.id
      LEFT JOIN staff s ON s.tenant_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at ASC;
    `);
    return rows.length > 0 ? rows : memoryTenants;
  } catch (err: any) {
    console.warn('[GymOS Tenants] Database query failed, serving demo store:', err.message);
    return memoryTenants;
  }
}

export async function getTenantById(id: string) {
  const pool = getDbPool();
  if (!pool) {
    return memoryTenants.find((t) => t.id === id) || memoryTenants[0];
  }

  try {
    const { rows } = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        domain,
        plan,
        status,
        contact_email as "contactEmail",
        created_at as "createdAt"
      FROM tenants
      WHERE id = $1
    `, [id]);
    return rows[0] || memoryTenants.find((t) => t.id === id) || null;
  } catch (err: any) {
    console.warn('[GymOS Tenants] Database query failed, serving demo store:', err.message);
    return memoryTenants.find((t) => t.id === id) || null;
  }
}

export async function getTenantRoles(tenantId: string | null) {
  const pool = getDbPool();
  if (!pool) {
    return memoryRoles;
  }

  try {
    const queryText = tenantId
      ? `
        SELECT 
          r.id,
          r.tenant_id as "tenantId",
          r.name,
          r.display_name as "displayName",
          r.description,
          r.is_system as "isSystem",
          ARRAY_AGG(p.code) FILTER (WHERE p.code IS NOT NULL) as permissions
        FROM roles r
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        WHERE r.tenant_id = $1 OR r.tenant_id IS NULL
        GROUP BY r.id
        ORDER BY r.name;
      `
      : `
        SELECT 
          r.id,
          r.tenant_id as "tenantId",
          r.name,
          r.display_name as "displayName",
          r.description,
          r.is_system as "isSystem",
          ARRAY_AGG(p.code) FILTER (WHERE p.code IS NOT NULL) as permissions
        FROM roles r
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        GROUP BY r.id
        ORDER BY r.name;
      `;
    const params = tenantId ? [tenantId] : [];
    const { rows } = await pool.query(queryText, params);
    return rows.length > 0 ? rows : memoryRoles;
  } catch (err: any) {
    console.warn('[GymOS Roles] Database query failed, serving demo store:', err.message);
    return memoryRoles;
  }
}
