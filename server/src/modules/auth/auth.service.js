import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../../db/pool.js';
import { env } from '../../config/env.js';
import { recordAuditLog } from '../audit/audit.service.js';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Modern password hashing using bcrypt (salt rounds: 10)
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string' || plainPassword.length < 6) {
    throw new Error('Password must be a valid string of at least 6 characters.');
  }
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare plain password against stored hash
 */
export async function verifyPassword(plainPassword, hash) {
  if (!plainPassword || !hash) return false;
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Generate signed JWT token
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    phone: user.phone || null,
    role: user.role,
    name: user.full_name,
    villagePanchayat: user.village_panchayat || null
  };

  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });
}

/**
 * Register a new Citizen user
 */
export async function registerCitizen({ fullName, phone, password, villagePanchayat, ipAddress = null }) {
  const pool = getPool();

  // Check if phone already registered
  const existingRes = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
  if (existingRes.rows.length > 0) {
    const err = new Error('A user with this mobile phone number is already registered.');
    err.code = 'PHONE_ALREADY_REGISTERED';
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  const insertQuery = `
    INSERT INTO users (full_name, phone, role, password_hash, village_panchayat, is_active)
    VALUES ($1, $2, 'citizen', $3, $4, true)
    RETURNING id, full_name, phone, role, village_panchayat, created_at
  `;

  const result = await pool.query(insertQuery, [
    fullName.trim(),
    phone.trim(),
    passwordHash,
    villagePanchayat ? villagePanchayat.trim() : null
  ]);

  const user = result.rows[0];
  const token = generateToken(user);

  await recordAuditLog({
    actorId: user.id,
    actorRole: 'citizen',
    action: 'AUTH_REGISTER',
    resourceType: 'user',
    resourceId: user.id,
    ipAddress,
    metadata: { phone: user.phone, villagePanchayat: user.village_panchayat }
  });

  return { user, token };
}

/**
 * Universal login for all roles (Citizen, Official, Admin)
 */
export async function login({ identifier, password, ipAddress = null }) {
  const pool = getPool();

  // Look up by phone number or UUID
  const query = `
    SELECT id, full_name, phone, role, password_hash, village_panchayat, is_active
    FROM users
    WHERE phone = $1 OR id::text = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [identifier.trim()]);
  const user = result.rows[0];

  if (!user || !user.password_hash) {
    await recordAuditLog({
      action: 'AUTH_LOGIN_FAILED',
      resourceType: 'user',
      resourceId: identifier,
      ipAddress,
      status: 'failure',
      metadata: { reason: 'User not found or no password set' }
    });

    const err = new Error('Invalid mobile number/identifier or password.');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('This user account has been deactivated. Please contact an administrator.');
    err.code = 'ACCOUNT_DEACTIVATED';
    err.status = 403;
    throw err;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'AUTH_LOGIN_FAILED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress,
      status: 'failure',
      metadata: { reason: 'Password mismatch' }
    });

    const err = new Error('Invalid mobile number/identifier or password.');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  // Remove password_hash before returning
  delete user.password_hash;
  const token = generateToken(user);

  await recordAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_LOGIN_SUCCESS',
    resourceType: 'user',
    resourceId: user.id,
    ipAddress
  });

  return { user, token };
}

/**
 * Seed or provision an official or admin user (Admin only)
 */
export async function createPrivilegedUser({
  fullName,
  phone,
  role,
  password,
  villagePanchayat = null,
  creatorAdminId = null,
  ipAddress = null
}) {
  if (!['official', 'admin'].includes(role)) {
    throw new Error("Privileged role must be either 'official' or 'admin'.");
  }

  const pool = getPool();
  const passwordHash = await hashPassword(password);

  const query = `
    INSERT INTO users (full_name, phone, role, password_hash, village_panchayat, is_active)
    VALUES ($1, $2, $3, $4, $5, true)
    ON CONFLICT (phone) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        password_hash = EXCLUDED.password_hash,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id, full_name, phone, role, village_panchayat, created_at
  `;

  const result = await pool.query(query, [
    fullName.trim(),
    phone ? phone.trim() : null,
    role,
    passwordHash,
    villagePanchayat
  ]);

  const createdUser = result.rows[0];

  await recordAuditLog({
    actorId: creatorAdminId,
    actorRole: 'admin',
    action: 'PRIVILEGED_USER_CREATED',
    resourceType: 'user',
    resourceId: createdUser.id,
    ipAddress,
    metadata: { role: createdUser.role, name: createdUser.full_name }
  });

  return createdUser;
}

