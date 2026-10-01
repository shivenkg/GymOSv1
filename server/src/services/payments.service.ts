import { getDbPool } from '../config/db.ts';

// In-memory tenant-isolated payments store for demo / fallback mode
const memoryPayments: Record<string, any[]> = {
  '11111111-1111-1111-1111-111111111111': [
    {
      id: 'pay-1',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      invoiceNo: 'INV-891024',
      amount: 18500,
      method: 'UPI',
      status: 'Completed',
      upiRef: 'pay_98240219482',
      transactionId: 'TXN-984210',
      paidAt: new Date(Date.now() - 3600000).toISOString(),
      memberName: 'Vikram Malhotra',
    },
    {
      id: 'pay-2',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      invoiceNo: 'INV-891025',
      amount: 12000,
      method: 'Credit Card',
      status: 'Completed',
      upiRef: null,
      transactionId: 'TXN-984211',
      paidAt: new Date(Date.now() - 7200000).toISOString(),
      memberName: 'Ananya Roy',
    },
    {
      id: 'pay-3',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      invoiceNo: 'INV-891026',
      amount: 3500,
      method: 'Cash',
      status: 'Completed',
      upiRef: null,
      transactionId: 'TXN-984212',
      paidAt: new Date(Date.now() - 14400000).toISOString(),
      memberName: 'Rohan Mehra',
    },
  ],
};

export async function getPayments(tenantId: string | null) {
  const tid = tenantId || '11111111-1111-1111-1111-111111111111';
  const pool = getDbPool();
  if (!pool) {
    return memoryPayments[tid] || memoryPayments['11111111-1111-1111-1111-111111111111'] || [];
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS Payments] Database query failed, serving demo store:', err.message);
    return memoryPayments[tid] || memoryPayments['11111111-1111-1111-1111-111111111111'] || [];
  }
}

export async function createPayment(tenantId: string, data: {
  memberId?: string;
  amount: number;
  method?: string;
  upiRef?: string;
}) {
  const pool = getDbPool();
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
  const txId = `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  if (!pool) {
    const newPay = {
      id: `pay-${Date.now()}`,
      tenant_id: tenantId,
      invoiceNo,
      amount: data.amount,
      method: data.method || 'UPI',
      status: 'Completed',
      upiRef: data.upiRef || null,
      transactionId: txId,
      paidAt: new Date().toISOString(),
      memberName: 'Member Payment',
    };
    if (!memoryPayments[tenantId]) memoryPayments[tenantId] = [];
    memoryPayments[tenantId].unshift(newPay);
    return newPay;
  }

  try {
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
  } catch (err: any) {
    console.warn('[GymOS Payments] DB insert failed, saving to memory fallback:', err.message);
    const newPay = {
      id: `pay-${Date.now()}`,
      tenant_id: tenantId,
      invoiceNo,
      amount: data.amount,
      method: data.method || 'UPI',
      status: 'Completed',
      upiRef: data.upiRef || null,
      transactionId: txId,
      paidAt: new Date().toISOString(),
      memberName: 'Member Payment',
    };
    if (!memoryPayments[tenantId]) memoryPayments[tenantId] = [];
    memoryPayments[tenantId].unshift(newPay);
    return newPay;
  }
}
