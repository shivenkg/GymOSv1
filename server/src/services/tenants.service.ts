import { getDbPool } from '../config/db.ts';

export async function getTenants() {
  const pool = getDbPool();
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
  return rows;
}

export async function getTenantById(id: string) {
  const pool = getDbPool();
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
  return rows[0] || null;
}

export async function getTenantRoles(tenantId: string | null) {
  const pool = getDbPool();
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
  return rows;
}
