import { getDbPool } from '../config/db.ts';

// In-memory tenant-isolated staff store for demo / fallback mode
const memoryStaff: Record<string, any[]> = {
  '11111111-1111-1111-1111-111111111111': [
    {
      id: 'stf-1',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      name: 'Rahul Sharma',
      email: 'rahul.s@example.com',
      phone: '+91 98111 22334',
      role: 'Head Trainer',
      department: 'Fitness & Training',
      salary: 45000,
      shift: 'Morning (06:00 - 14:00)',
      hireDate: '2024-03-01',
      status: 'Active',
    },
    {
      id: 'stf-2',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      name: 'Priya Patel',
      email: 'priya.p@example.com',
      phone: '+91 98222 33445',
      role: 'Operations Lead',
      department: 'Operations & Front Desk',
      salary: 38000,
      shift: 'General (09:00 - 18:00)',
      hireDate: '2024-05-15',
      status: 'Active',
    },
    {
      id: 'stf-3',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      name: 'Amit Verma',
      email: 'amit.v@example.com',
      phone: '+91 98333 44556',
      role: 'Yoga Specialist',
      department: 'Group Fitness',
      salary: 32000,
      shift: 'Evening (14:00 - 22:00)',
      hireDate: '2024-07-20',
      status: 'Active',
    },
  ],
};

export async function getStaff(tenantId: string | null) {
  const tid = tenantId || '11111111-1111-1111-1111-111111111111';
  const pool = getDbPool();
  if (!pool) {
    return memoryStaff[tid] || memoryStaff['11111111-1111-1111-1111-111111111111'] || [];
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS Staff] Database query failed, serving demo store:', err.message);
    return memoryStaff[tid] || memoryStaff['11111111-1111-1111-1111-111111111111'] || [];
  }
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

  if (!pool) {
    const newStaff = {
      id: `stf-${Date.now()}`,
      tenant_id: tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
      department: data.department || 'Fitness & Training',
      salary: data.salary || 0,
      shift: data.shift || 'Morning (06:00 - 14:00)',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    if (!memoryStaff[tenantId]) memoryStaff[tenantId] = [];
    memoryStaff[tenantId].unshift(newStaff);
    return newStaff;
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS Staff] DB insert failed, saving to memory fallback:', err.message);
    const newStaff = {
      id: `stf-${Date.now()}`,
      tenant_id: tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
      department: data.department || 'Fitness & Training',
      salary: data.salary || 0,
      shift: data.shift || 'Morning (06:00 - 14:00)',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    if (!memoryStaff[tenantId]) memoryStaff[tenantId] = [];
    memoryStaff[tenantId].unshift(newStaff);
    return newStaff;
  }
}

export async function updateStaff(tenantId: string, id: string, data: {
  name?: string;
  role?: string;
  department?: string;
  salary?: number;
  status?: string;
}) {
  const pool = getDbPool();

  if (!pool) {
    const list = memoryStaff[tenantId] || [];
    const item = list.find((s) => s.id === id);
    if (item) {
      Object.assign(item, data);
      return item;
    }
    throw new Error('Staff member not found or unauthorized for this tenant.');
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS Staff] DB update failed, updating memory store:', err.message);
    const list = memoryStaff[tenantId] || [];
    const item = list.find((s) => s.id === id);
    if (item) {
      Object.assign(item, data);
      return item;
    }
    throw err;
  }
}
