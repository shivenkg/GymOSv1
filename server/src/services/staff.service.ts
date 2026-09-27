import { getDbPool } from '../config/db.ts';

export async function getStaff(tenantId: string | null) {
  const pool = getDbPool();
  const queryText = tenantId
    ? `
      SELECT 
        s.id,
        s.tenant_id,
        s.full_name as "name",
        s.email,
        s.phone,
        s.role_title as "role",
        s.department,
        s.salary,
        s.shift,
        s.hire_date as "hireDate",
        s.status
      FROM staff s
      WHERE s.tenant_id = $1
      ORDER BY s.hire_date DESC;
    `
    : `
      SELECT 
        s.id,
        s.tenant_id,
        s.full_name as "name",
        s.email,
        s.phone,
        s.role_title as "role",
        s.department,
        s.salary,
        s.shift,
        s.hire_date as "hireDate",
        s.status
      FROM staff s
      ORDER BY s.hire_date DESC;
    `;

  const params = tenantId ? [tenantId] : [];
  const { rows } = await pool.query(queryText, params);
  return rows;
}

export async function createStaff(tenantId: string, data: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  salary?: number;
  shift?: string;
}) {
  const pool = getDbPool();
  const queryText = `
    INSERT INTO staff (
      tenant_id, full_name, email, phone, role_title, department, salary, shift, hire_date, status
    )
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'Fitness & Training'), COALESCE($7, 0), COALESCE($8, 'Morning'), CURRENT_DATE, 'Active')
    RETURNING 
      id,
      tenant_id,
      full_name as "name",
      email,
      phone,
      role_title as "role",
      department,
      salary,
      shift,
      status;
  `;

  const values = [
    tenantId,
    data.name,
    data.email,
    data.phone || null,
    data.role,
    data.department || 'Fitness & Training',
    data.salary || 0,
    data.shift || 'Morning (06:00 - 14:00)',
  ];

  const { rows } = await pool.query(queryText, values);
  return rows[0];
}

export async function updateStaff(tenantId: string, id: string, data: {
  name?: string;
  role?: string;
  department?: string;
  salary?: number;
  status?: string;
}) {
  const pool = getDbPool();
  const queryText = `
    UPDATE staff
    SET 
      full_name = COALESCE($1, full_name),
      role_title = COALESCE($2, role_title),
      department = COALESCE($3, department),
      salary = COALESCE($4, salary),
      status = COALESCE($5, status),
      updated_at = NOW()
    WHERE id = $6 AND tenant_id = $7
    RETURNING id, full_name as "name", role_title as "role", status;
  `;

  const { rows } = await pool.query(queryText, [data.name, data.role, data.department, data.salary, data.status, id, tenantId]);
  if (rows.length === 0) {
    throw new Error('Staff member not found or unauthorized for this tenant.');
  }
  return rows[0];
}
