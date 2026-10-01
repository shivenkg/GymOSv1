import { getDbPool } from '../config/db.ts';

// In-memory tenant-isolated attendance store for demo / fallback mode
const memoryAttendance: Record<string, any[]> = {
  '11111111-1111-1111-1111-111111111111': [
    {
      id: 'att-1',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      memberId: 'mem-1',
      memberName: 'Vikram Malhotra',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      checkInTime: new Date(Date.now() - 15 * 60000).toISOString(),
      checkOutTime: null,
      deviceId: 'TURNSTILE-GATE-01',
      method: 'QR_CODE',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'att-2',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      memberId: 'mem-2',
      memberName: 'Ananya Roy',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      checkInTime: new Date(Date.now() - 45 * 60000).toISOString(),
      checkOutTime: null,
      deviceId: 'TURNSTILE-GATE-02',
      method: 'RFID_WRISTBAND',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'att-3',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      memberId: 'mem-3',
      memberName: 'Rohan Mehra',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      checkInTime: new Date(Date.now() - 120 * 60000).toISOString(),
      checkOutTime: new Date(Date.now() - 30 * 60000).toISOString(),
      deviceId: 'TURNSTILE-GATE-01',
      method: 'MANUAL_ENTRY',
      verificationStatus: 'VERIFIED',
    },
  ],
};

export async function getAttendance(tenantId: string | null) {
  const tid = tenantId || '11111111-1111-1111-1111-111111111111';
  const pool = getDbPool();
  if (!pool) {
    return memoryAttendance[tid] || memoryAttendance['11111111-1111-1111-1111-111111111111'] || [];
  }

  try {
    const queryText = tenantId
      ? `
        SELECT 
          a.id,
          a.tenant_id,
          a.member_id as "memberId",
          m.full_name as "memberName",
          m.avatar_url as "avatarUrl",
          a.check_in_time as "checkInTime",
          a.check_out_time as "checkOutTime",
          a.device_id as "deviceId",
          a.method,
          a.verification_status as "verificationStatus"
        FROM attendance a
        JOIN members m ON m.id = a.member_id
        WHERE a.tenant_id = $1
        ORDER BY a.check_in_time DESC
        LIMIT 100;
      `
      : `
        SELECT 
          a.id,
          a.tenant_id,
          a.member_id as "memberId",
          m.full_name as "memberName",
          m.avatar_url as "avatarUrl",
          a.check_in_time as "checkInTime",
          a.check_out_time as "checkOutTime",
          a.device_id as "deviceId",
          a.method,
          a.verification_status as "verificationStatus"
        FROM attendance a
        JOIN members m ON m.id = a.member_id
        ORDER BY a.check_in_time DESC
        LIMIT 100;
      `;

    const params = tenantId ? [tenantId] : [];
    const { rows } = await pool.query(queryText, params);
    return rows;
  } catch (err: any) {
    console.warn('[GymOS Attendance] Database query failed, serving demo store:', err.message);
    return memoryAttendance[tid] || memoryAttendance['11111111-1111-1111-1111-111111111111'] || [];
  }
}

export async function recordCheckIn(tenantId: string, memberId: string, deviceId = 'TURNSTILE-GATE-01', method = 'QR_CODE') {
  const pool = getDbPool();

  if (!pool) {
    const newLog = {
      id: `att-${Date.now()}`,
      tenant_id: tenantId,
      memberId,
      memberName: 'Active Member',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      deviceId,
      method,
      verificationStatus: 'VERIFIED',
    };
    if (!memoryAttendance[tenantId]) memoryAttendance[tenantId] = [];
    memoryAttendance[tenantId].unshift(newLog);
    return newLog;
  }

  try {
    // First verify member belongs to this tenant
    const memberCheck = await pool.query(
      'SELECT id, full_name, status FROM members WHERE id = $1 AND tenant_id = $2',
      [memberId, tenantId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error('Member not found or unauthorized for this tenant.');
    }

    const member = memberCheck.rows[0];
    const queryText = `
      INSERT INTO attendance (
        tenant_id, member_id, check_in_time, device_id, method, verification_status
      )
      VALUES ($1, $2, NOW(), $3, $4, 'VERIFIED')
      RETURNING 
        id, 
        member_id as "memberId", 
        check_in_time as "checkInTime", 
        device_id as "deviceId", 
        method, 
        verification_status as "verificationStatus";
    `;

    const { rows } = await pool.query(queryText, [tenantId, memberId, deviceId, method]);
    return {
      ...rows[0],
      memberName: member.full_name,
    };
  } catch (err: any) {
    console.warn('[GymOS Attendance] DB insert failed, saving to memory fallback:', err.message);
    const newLog = {
      id: `att-${Date.now()}`,
      tenant_id: tenantId,
      memberId,
      memberName: 'Active Member',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      deviceId,
      method,
      verificationStatus: 'VERIFIED',
    };
    if (!memoryAttendance[tenantId]) memoryAttendance[tenantId] = [];
    memoryAttendance[tenantId].unshift(newLog);
    return newLog;
  }
}
