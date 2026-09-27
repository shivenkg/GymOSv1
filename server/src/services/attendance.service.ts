import { getDbPool } from '../config/db.ts';

export async function getAttendance(tenantId: string | null) {
  const pool = getDbPool();
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
}

export async function recordCheckIn(tenantId: string, memberId: string, deviceId = 'TURNSTILE-GATE-01', method = 'QR_CODE') {
  const pool = getDbPool();

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
}
