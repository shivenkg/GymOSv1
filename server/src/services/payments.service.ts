import { getDbPool } from '../config/db.ts';

export async function getPayments(tenantId: string | null) {
  const pool = getDbPool();
  const queryText = tenantId
    ? `
      SELECT 
        p.id,
        p.tenant_id,
        p.invoice_no as "invoiceNo",
        p.amount,
        p.method,
        p.status,
        p.upi_ref as "upiRef",
        p.transaction_id as "transactionId",
        p.paid_at as "paidAt",
        m.full_name as "memberName"
      FROM payments p
      LEFT JOIN members m ON m.id = p.member_id
      WHERE p.tenant_id = $1
      ORDER BY p.paid_at DESC;
    `
    : `
      SELECT 
        p.id,
        p.tenant_id,
        p.invoice_no as "invoiceNo",
        p.amount,
        p.method,
        p.status,
        p.upi_ref as "upiRef",
        p.transaction_id as "transactionId",
        p.paid_at as "paidAt",
        m.full_name as "memberName"
      FROM payments p
      LEFT JOIN members m ON m.id = p.member_id
      ORDER BY p.paid_at DESC;
    `;

  const params = tenantId ? [tenantId] : [];
  const { rows } = await pool.query(queryText, params);
  return rows;
}

export async function createPayment(tenantId: string, data: {
  memberId?: string;
  amount: number;
  method?: string;
  upiRef?: string;
}) {
  const pool = getDbPool();
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;

  const queryText = `
    INSERT INTO payments (
      tenant_id, member_id, invoice_no, amount, method, status, upi_ref, transaction_id, paid_at
    )
    VALUES (
      $1, $2, $3, $4, COALESCE($5, 'UPI'), 'Completed', $6, $7, NOW()
    )
    RETURNING 
      id, 
      invoice_no as "invoiceNo", 
      amount, 
      method, 
      status, 
      paid_at as "paidAt";
  `;

  const txId = `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const values = [
    tenantId,
    data.memberId || null,
    invoiceNo,
    data.amount,
    data.method || 'UPI',
    data.upiRef || null,
    txId,
  ];

  const { rows } = await pool.query(queryText, values);
  return rows[0];
}
