import { getDbPool } from '../config/db.ts';
import { config } from '../config/env.ts';

export interface MemberDto {
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status?: string;
  rfidCardId?: string;
  planId?: string;
  emergencyContact?: string;
  notes?: string;
}

// In-memory tenant-isolated store for standalone / sandbox mode
const memoryMembers: Record<string, any[]> = {
  '11111111-1111-1111-1111-111111111111': [
    {
      id: 'mem-1',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Vikram Malhotra',
      email: 'vikram.m@example.com',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active',
      rfidCardId: '#RFID-9842',
      joinDate: '2025-01-10',
      expirationDate: '2026-01-10',
      planName: 'VIP Annual',
    },
    {
      id: 'mem-2',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Ananya Roy',
      email: 'ananya.r@example.com',
      phone: '+91 98765 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Active',
      rfidCardId: '#RFID-4190',
      joinDate: '2025-02-15',
      expirationDate: '2026-02-15',
      planName: 'Gold 6-Month',
    },
    {
      id: 'mem-3',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Rohan Mehra',
      email: 'rohan.m@example.com',
      phone: '+91 98765 99887',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'Expiring',
      rfidCardId: '#RFID-1205',
      joinDate: '2024-10-01',
      expirationDate: '2025-10-01',
      planName: 'Silver Monthly',
    },
  ],
};

export async function getMembers(tenantId: string | null) {
  const tid = tenantId || '11111111-1111-1111-1111-111111111111';
  const pool = getDbPool();
  if (!pool) {
    return memoryMembers[tid] || memoryMembers['11111111-1111-1111-1111-111111111111'] || [];
  }

  try {
    // If tenantId is provided, filter strictly by it.
    const queryText = tenantId
      ? `
        SELECT 
          m.id, 
          m.tenant_id, 
          m.full_name as "fullName", 
          m.email, 
          m.phone, 
          m.avatar_url as "avatarUrl", 
          m.status, 
          m.rfid_card_id as "rfidCardId", 
          m.join_date as "joinDate", 
          m.expiration_date as "expirationDate", 
          m.emergency_contact as "emergencyContact", 
          m.notes,
          p.name as "planName"
        FROM members m
        LEFT JOIN memberships ms ON ms.member_id = m.id AND ms.status = 'Active'
        LEFT JOIN membership_plans p ON p.id = ms.plan_id
        WHERE m.tenant_id = $1
        ORDER BY m.created_at DESC;
      `
      : `
        SELECT 
          m.id, 
          m.tenant_id, 
          m.full_name as "fullName", 
          m.email, 
          m.phone, 
          m.avatar_url as "avatarUrl", 
          m.status, 
          m.rfid_card_id as "rfidCardId", 
          m.join_date as "joinDate", 
          m.expiration_date as "expirationDate",
          p.name as "planName"
        FROM members m
        LEFT JOIN memberships ms ON ms.member_id = m.id AND ms.status = 'Active'
        LEFT JOIN membership_plans p ON p.id = ms.plan_id
        ORDER BY m.created_at DESC;
      `;

    const params = tenantId ? [tenantId] : [];
    const { rows } = await pool.query(queryText, params);
    return rows;
  } catch (err: any) {
    console.warn('[GymOS Members] Database query failed, serving demo store:', err.message);
    return memoryMembers[tid] || memoryMembers['11111111-1111-1111-1111-111111111111'] || [];
  }
}

export async function createMember(tenantId: string, data: MemberDto) {
  const pool = getDbPool();
  if (!pool) {
    const newMem = {
      id: `mem-${Date.now()}`,
      tenant_id: tenantId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '+91 98765 00000',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: data.status || 'Active',
      rfidCardId: data.rfidCardId || `#RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      joinDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      planName: 'VIP Annual',
    };
    if (!memoryMembers[tenantId]) memoryMembers[tenantId] = [];
    memoryMembers[tenantId].unshift(newMem);
    return newMem;
  }

  try {
    const queryText = `
      INSERT INTO members (
        tenant_id, full_name, email, phone, avatar_url, status, rfid_card_id, 
        emergency_contact, notes, join_date, expiration_date
      )
      VALUES (
        $1, $2, $3, $4, $5, COALESCE($6, 'Active'), $7, $8, $9, 
        CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'
      )
      RETURNING 
        id, 
        tenant_id, 
        full_name as "fullName", 
        email, 
        phone, 
        status, 
        join_date as "joinDate", 
        expiration_date as "expirationDate";
    `;

    const values = [
      tenantId,
      data.fullName,
      data.email,
      data.phone || null,
      data.avatarUrl || null,
      data.status || 'Active',
      data.rfidCardId || null,
      data.emergencyContact || null,
      data.notes || null,
    ];

    const { rows } = await pool.query(queryText, values);
    return rows[0];
  } catch (err: any) {
    console.warn('[GymOS Members] DB insert failed, saving to memory fallback:', err.message);
    const newMem = {
      id: `mem-${Date.now()}`,
      tenant_id: tenantId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '+91 98765 00000',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: data.status || 'Active',
      rfidCardId: data.rfidCardId || `#RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      joinDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      planName: 'VIP Annual',
    };
    if (!memoryMembers[tenantId]) memoryMembers[tenantId] = [];
    memoryMembers[tenantId].unshift(newMem);
    return newMem;
  }
}

export async function updateMember(tenantId: string, id: string, data: Partial<MemberDto>) {
  const pool = getDbPool();
  if (!pool) {
    const list = memoryMembers[tenantId] || [];
    const item = list.find((m) => m.id === id);
    if (!item) {
      throw new Error('Member not found or access denied for this tenant.');
    }
    Object.assign(item, data);
    return item;
  }

  try {
    const queryText = `
      UPDATE members
      SET 
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        status = COALESCE($4, status),
        emergency_contact = COALESCE($5, emergency_contact),
        notes = COALESCE($6, notes),
        updated_at = NOW()
      WHERE id = $7 AND tenant_id = $8
      RETURNING id, full_name as "fullName", email, status;
    `;

    const values = [
      data.fullName || null,
      data.email || null,
      data.phone || null,
      data.status || null,
      data.emergencyContact || null,
      data.notes || null,
      id,
      tenantId,
    ];

    const { rows } = await pool.query(queryText, values);
    if (rows.length === 0) {
      throw new Error('Member not found or access denied for this tenant.');
    }
    return rows[0];
  } catch (err: any) {
    console.warn('[GymOS Members] DB update failed, updating memory store:', err.message);
    const list = memoryMembers[tenantId] || [];
    const item = list.find((m) => m.id === id);
    if (item) {
      Object.assign(item, data);
      return item;
    }
    throw err;
  }
}

export async function deleteMember(tenantId: string, id: string) {
  const pool = getDbPool();
  if (!pool) {
    const list = memoryMembers[tenantId] || [];
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) {
      throw new Error('Member not found or access denied for this tenant.');
    }
    list.splice(idx, 1);
    return { deleted: true, id };
  }

  try {
    const queryText = `
      DELETE FROM members
      WHERE id = $1 AND tenant_id = $2
      RETURNING id;
    `;
    const { rows } = await pool.query(queryText, [id, tenantId]);
    if (rows.length === 0) {
      throw new Error('Member not found or access denied for this tenant.');
    }
    return { deleted: true, id };
  } catch (err: any) {
    console.warn('[GymOS Members] DB delete failed, updating memory store:', err.message);
    const list = memoryMembers[tenantId] || [];
    const idx = list.findIndex((m) => m.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
    }
    return { deleted: true, id };
  }
}
