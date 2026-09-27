import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDbPool } from '../config/db.ts';

export async function seedDatabase(): Promise<void> {
  console.log('[GymOS Seed] Connecting to database for seeding...');
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Permissions
    const permissions = [
      { code: 'members:read', module: 'Members', description: 'View gym member profiles & membership status' },
      { code: 'members:write', module: 'Members', description: 'Create, update, and manage gym members' },
      { code: 'attendance:scan', module: 'Attendance', description: 'Operate turnstile check-in & telemetry' },
      { code: 'payments:read', module: 'Finance', description: 'View transactions, invoices, and payment ledger' },
      { code: 'payments:write', module: 'Finance', description: 'Collect fees, process refunds, and generate receipts' },
      { code: 'classes:manage', module: 'Scheduling', description: 'Schedule and manage classes & PT sessions' },
      { code: 'crm:manage', module: 'CRM', description: 'Manage sales leads and conversion pipeline' },
      { code: 'staff:manage', module: 'HR', description: 'View and manage staff roster & payroll' },
      { code: 'rbac:manage', module: 'Security', description: 'Modify roles, permissions, and audit logs' },
      { code: 'settings:manage', module: 'Settings', description: 'Update facility configuration & branding' },
    ];

    const permMap: Record<string, string> = {};
    for (const p of permissions) {
      const res = await client.query(
        `INSERT INTO permissions (code, module, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, code`,
        [p.code, p.module, p.description]
      );
      permMap[res.rows[0].code] = res.rows[0].id;
    }

    // 2. Seed Tenants
    const tenantRes = await client.query(
      `INSERT INTO tenants (name, slug, domain, plan, status, contact_email)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name, slug`,
      ['IronCore Fitness Club', 'ironcore', 'ironcore.gymos.io', 'enterprise', 'active', 'operations@ironcore.com']
    );
    const tenantId = tenantRes.rows[0].id;

    // 3. Seed Roles for Tenant
    const adminRoleRes = await client.query(
      `INSERT INTO roles (tenant_id, name, display_name, description, is_system)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [tenantId, 'admin', 'Tenant Administrator', 'Full administrative authority for this facility branch', true]
    );
    const adminRoleId = adminRoleRes.rows[0].id;

    const staffRoleRes = await client.query(
      `INSERT INTO roles (tenant_id, name, display_name, description, is_system)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [tenantId, 'staff', 'Desk Staff & Trainer', 'Front-desk operations, check-in, and member bookings', true]
    );
    const staffRoleId = staffRoleRes.rows[0].id;

    // Map permissions to admin
    for (const permId of Object.values(permMap)) {
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         VALUES ($1, $2)
         ON CONFLICT (role_id, permission_id) DO NOTHING`,
        [adminRoleId, permId]
      );
    }

    // Map limited permissions to staff
    const staffPerms = ['members:read', 'attendance:scan', 'classes:manage', 'crm:manage'];
    for (const code of staffPerms) {
      if (permMap[code]) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT (role_id, permission_id) DO NOTHING`,
          [staffRoleId, permMap[code]]
        );
      }
    }

    // 4. Seed Random Admin User Credentials (never hardcoded, output once)
    const randomAdminPassword = `Admin_${crypto.randomBytes(6).toString('hex')}!`;
    const passwordHash = await bcrypt.hash(randomAdminPassword, 10);

    const userEmail = `admin@${tenantRes.rows[0].slug}.com`;
    const userRes = await client.query(
      `INSERT INTO users (tenant_id, role_id, email, password_hash, full_name, avatar_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, email`,
      [tenantId, adminRoleId, userEmail, passwordHash, 'Aarav Sharma (Branch Manager)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true]
    );

    // 5. Seed Membership Plans
    await client.query(
      `INSERT INTO membership_plans (tenant_id, name, duration_months, price, features)
       VALUES 
        ($1, 'Monthly Flex Pass', 1, 49.00, '["Gym Floor Access", "Locker Room", "Cardio Zone"]'::jsonb),
        ($1, 'Quarterly Athlete Plan', 3, 129.00, '["All Flex Benefits", "Sauna & Steam", "1 PT Session/mo"]'::jsonb),
        ($1, 'Annual Elite Membership', 12, 449.00, '["All Benefits", "Unlimited PT Booking", "Nutrition Consultations", "VIP Towel Service"]'::jsonb)
      ON CONFLICT DO NOTHING`,
      [tenantId]
    );

    await client.query('COMMIT');

    console.log('\n================================================================');
    console.log(' [GymOS Security] Real Admin User Seeded Successfully');
    console.log('================================================================');
    console.log(` Tenant:   ${tenantRes.rows[0].name} (ID: ${tenantId})`);
    console.log(` User ID:  ${userRes.rows[0].id}`);
    console.log(` Email:    ${userEmail}`);
    console.log(` Password: ${randomAdminPassword}`);
    console.log(' NOTE: This password was dynamically generated and printed ONCE.');
    console.log(' Save it securely. It is stored exclusively as a bcrypt hash.');
    console.log('================================================================\n');

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[GymOS Seed] Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
