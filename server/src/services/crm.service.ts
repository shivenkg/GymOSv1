import { getDbPool } from '../config/db.ts';

// In-memory tenant-isolated CRM leads store for demo / fallback mode
const memoryLeads: Record<string, any[]> = {
  '11111111-1111-1111-1111-111111111111': [
    {
      id: 'lead-1',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Siddharth Roy',
      email: 'siddharth@example.com',
      phone: '+91 98200 12345',
      source: 'Instagram Ad',
      stage: 'Trial Booked',
      estimatedValue: 15000,
      notes: 'Interested in VIP Annual membership and personal training.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      assignedStaff: 'Rahul Sharma',
    },
    {
      id: 'lead-2',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Pooja Hegde',
      email: 'pooja.h@example.com',
      phone: '+91 98200 67890',
      source: 'Walk-in',
      stage: 'New Inquiry',
      estimatedValue: 8000,
      notes: 'Visited front desk inquiring about morning yoga & pilates batches.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      assignedStaff: 'Priya Patel',
    },
  ],
};

export async function getLeads(tenantId: string | null) {
  const tid = tenantId || '11111111-1111-1111-1111-111111111111';
  const pool = getDbPool();
  if (!pool) {
    return memoryLeads[tid] || memoryLeads['11111111-1111-1111-1111-111111111111'] || [];
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS CRM] Database query failed, serving demo store:', err.message);
    return memoryLeads[tid] || memoryLeads['11111111-1111-1111-1111-111111111111'] || [];
  }
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

  if (!pool) {
    const newLead = {
      id: `lead-${Date.now()}`,
      tenant_id: tenantId,
      fullName: data.fullName,
      email: data.email || null,
      phone: data.phone || null,
      source: data.source || 'Walk-in',
      stage: data.stage || 'New',
      notes: data.notes || null,
      estimatedValue: data.estimatedValue || 0,
      createdAt: new Date().toISOString(),
      assignedStaff: 'Front Desk',
    };
    if (!memoryLeads[tenantId]) memoryLeads[tenantId] = [];
    memoryLeads[tenantId].unshift(newLead);
    return newLead;
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS CRM] DB insert failed, saving to memory fallback:', err.message);
    const newLead = {
      id: `lead-${Date.now()}`,
      tenant_id: tenantId,
      fullName: data.fullName,
      email: data.email || null,
      phone: data.phone || null,
      source: data.source || 'Walk-in',
      stage: data.stage || 'New',
      notes: data.notes || null,
      estimatedValue: data.estimatedValue || 0,
      createdAt: new Date().toISOString(),
      assignedStaff: 'Front Desk',
    };
    if (!memoryLeads[tenantId]) memoryLeads[tenantId] = [];
    memoryLeads[tenantId].unshift(newLead);
    return newLead;
  }
}

export async function updateLead(tenantId: string, id: string, data: {
  stage?: string;
  notes?: string;
  estimatedValue?: number;
}) {
  const pool = getDbPool();

  if (!pool) {
    const list = memoryLeads[tenantId] || [];
    const item = list.find((l) => l.id === id);
    if (item) {
      Object.assign(item, data);
      return item;
    }
    throw new Error('Lead not found or unauthorized for this tenant.');
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS CRM] DB update failed, updating memory store:', err.message);
    const list = memoryLeads[tenantId] || [];
    const item = list.find((l) => l.id === id);
    if (item) {
      Object.assign(item, data);
      return item;
    }
    throw err;
  }
}
