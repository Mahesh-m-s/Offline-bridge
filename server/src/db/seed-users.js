/**
 * OfflineBridge — User Accounts Seeder
 * 
 * Seeds verified official, administrator, and demo citizen accounts
 * into PostgreSQL with genuine bcrypt password hashes.
 */

import bcrypt from 'bcryptjs';
import { getPool } from './pool.js';

const BCRYPT_SALT_ROUNDS = 10;

const DEFAULT_USERS = [
  {
    phone: '9845100000',
    full_name: 'Platform Administrator',
    role: 'admin',
    village_panchayat: 'State Secretariat, Bengaluru',
    password: 'Admin@123'
  },
  {
    phone: '9845100001',
    full_name: 'Dr. Ramesh Kumar (Agri Scrutiny Officer)',
    role: 'official',
    village_panchayat: 'Hunsur Taluk Office, Mysuru',
    password: 'Official@123'
  },
  {
    phone: '9845100002',
    full_name: 'Smt. Lakshmi Devi (Welfare Officer)',
    role: 'official',
    village_panchayat: 'Mandya Taluk Office',
    password: 'Official@123'
  },
  {
    phone: '9845100003',
    full_name: 'Basavaraju M. (Rural Citizen)',
    role: 'citizen',
    village_panchayat: 'Biligere Gram Panchayat, Nanjangud',
    password: 'Citizen@123'
  }
];

export async function seedUsers() {
  const pool = getPool();

  console.log('[ArivuNet Seed Users] Checking users table in PostgreSQL...');

  for (const user of DEFAULT_USERS) {
    const existing = await pool.query('SELECT id, role FROM users WHERE phone = $1', [user.phone]);
    if (existing.rows.length === 0) {
      const passwordHash = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
      const insertQuery = `
        INSERT INTO users (full_name, phone, role, password_hash, village_panchayat, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING id, full_name, phone, role
      `;
      const res = await pool.query(insertQuery, [
        user.full_name,
        user.phone,
        user.role,
        passwordHash,
        user.village_panchayat
      ]);
      console.log(`[ArivuNet Seed Users] Created ${user.role} user: ${user.full_name} (${user.phone}) -> ID: ${res.rows[0].id}`);
    } else {
      console.log(`[ArivuNet Seed Users] User with phone ${user.phone} (${existing.rows[0].role}) already exists.`);
    }
  }

  console.log('[ArivuNet Seed Users] Seeding completed.');
}

// Execute directly if run as CLI script
if (process.argv[1]?.endsWith('seed-users.js')) {
  seedUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[ArivuNet Seed Users] Error:', err);
      process.exit(1);
    });
}

