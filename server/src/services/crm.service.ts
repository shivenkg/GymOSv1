import { getDbPool } from '../config/db.ts';

export async function getLeads(tenantId: string | null) {
  const pool = getDbPool();
  const queryText = tenantId
    ? `
      SELECT 
        l.id,
        l.tenant_id,
        l.full_name as "fullName",
        l.email,
        l.phone,
        l.source,
        l.stage,
        l.estimated_value as "estimatedValue",
        l.notes,
        l.created_at as "createdAt",
        s.full_name as "assignedStaff"
      FROM crm_leads l
      LEFT JOIN staff s ON s.id = l.assigned_staff_id
      WHERE l.tenant_id = $1
      ORDER BY l.created_at DESC;
    `
    : `
      SELECT 
        l.id,
        l.tenant_id,
        l.full_name as "fullName",
        l.email,
        l.phone,
        l.source,
        l.stage,
        l.estimated_value as "estimatedValue",
        l.notes,
        l.created_at as "createdAt",
        s.full_name as "assignedStaff"
      FROM crm_leads l
      LEFT JOIN staff s ON s.id = l.assigned_staff_id
      ORDER BY l.created_at DESC;
    `;

  const params = tenantId ? [tenantId] : [];
  const { rows } = await pool.query(queryText, params);
  return rows;
}

export async function createLead(tenantId: string, data: {
  fullName: string;
  email?: string;
  phone?: string;
  source?: string;
  stage?: string;
  notes?: string;
  estimatedValue?: number;
}) {
  const pool = getDbPool();
  const queryText = `
    INSERT INTO crm_leads (
      tenant_id, full_name, email, phone, source, stage, notes, estimated_value
    )
    VALUES ($1, $2, $3, $4, COALESCE($5, 'Walk-in'), COALESCE($6, 'New'), $7, COALESCE($8, 0))
    RETURNING 
      id, 
      tenant_id, 
      full_name as "fullName", 
      email, 
      phone, 
      source, 
      stage, 
      notes, 
      estimated_value as "estimatedValue", 
      created_at as "createdAt";
  `;

  const values = [
    tenantId,
    data.fullName,
    data.email || null,
    data.phone || null,
    data.source || 'Walk-in',
    data.stage || 'New',
    data.notes || null,
    data.estimatedValue || 0,
  ];

  const { rows } = await pool.query(queryText, values);
  return rows[0];
}

export async function updateLead(tenantId: string, id: string, data: {
  stage?: string;
  notes?: string;
  estimatedValue?: number;
}) {
  const pool = getDbPool();
  const queryText = `
    UPDATE crm_leads
    SET 
      stage = COALESCE($1, stage),
      notes = COALESCE($2, notes),
      estimated_value = COALESCE($3, estimated_value),
      updated_at = NOW()
    WHERE id = $4 AND tenant_id = $5
    RETURNING id, full_name as "fullName", stage, notes, estimated_value as "estimatedValue";
  `;

  const { rows } = await pool.query(queryText, [data.stage, data.notes, data.estimatedValue, id, tenantId]);
  if (rows.length === 0) {
    throw new Error('Lead not found or unauthorized for this tenant.');
  }
  return rows[0];
}
