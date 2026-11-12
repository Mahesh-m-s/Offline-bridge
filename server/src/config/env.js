import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory if it exists
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Resolves SSL/TLS configuration securely adhering to PostgreSQL driver defaults:
 * - If DB_SSL is explicitly set to 'false': disable SSL (false).
 * - If DB_SSL is explicitly set to 'true': enable secure SSL verification with Node CAs (true).
 * - If DB_SSL is 'no-verify': allow self-signed certificates without verification ({ rejectUnauthorized: false }).
 * - If DB_SSL is omitted:
 *     - If DATABASE_URL contains sslmode=require or neon.tech: enable secure SSL (true).
 *     - Otherwise: default to false for local development.
 */
function resolveSslConfig() {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL === 'true') return true;
  if (process.env.DB_SSL === 'no-verify') return { rejectUnauthorized: false };

  const url = process.env.DATABASE_URL || '';
  if (url.includes('sslmode=require') || url.includes('neon.tech')) {
    return true; // Secure TLS verification using Node.js built-in root CAs
  }

  return false;
}

export const DEV_FALLBACK_JWT_SECRET = 'arivunet_dev_jwt_secret_minimum_32_characters_secure';

const KNOWN_DEV_SECRETS = [
  DEV_FALLBACK_JWT_SECRET,
  'your_jwt_secret_minimum_32_characters_here'
];

/**
 * Resolves and validates JWT secret for production security:
 * - Production: refuses to start if missing, matches dev fallback, or is < 32 characters.
 * - Development: allows safe local development fallback without logging secrets.
 */
export function resolveJwtSecret(nodeEnv = process.env.NODE_ENV, customSecret = process.env.JWT_SECRET) {
  const isProd = nodeEnv === 'production';
  const secret = customSecret;

  if (isProd) {
    if (!secret || typeof secret !== 'string' || secret.trim() === '') {
      throw new Error(
        '[FATAL CONFIG ERROR] JWT_SECRET is required in production environment. Refusing to start server with missing secret.'
      );
    }

    if (KNOWN_DEV_SECRETS.includes(secret.trim())) {
      throw new Error(
        '[FATAL CONFIG ERROR] Known development fallback JWT_SECRET cannot be used in production. Refusing to start server.'
      );
    }

    if (secret.trim().length < 32) {
      throw new Error(
        `[FATAL CONFIG ERROR] JWT_SECRET must be at least 32 characters in production (received ${secret.trim().length} characters).`
      );
    }

    return secret.trim();
  }

  // Development / Test environment fallback
  return (secret && secret.trim()) || DEV_FALLBACK_JWT_SECRET;
}

/**
 * Resolves Swagger UI activation policy:
 * - Production: disabled by default, enabled only if SWAGGER_ENABLED === 'true'
 * - Development: enabled by default, disabled only if SWAGGER_ENABLED === 'false'
 */
export function resolveSwaggerEnabled(nodeEnv = process.env.NODE_ENV, swaggerEnv = process.env.SWAGGER_ENABLED) {
  const isProd = nodeEnv === 'production';
  if (isProd) {
    return swaggerEnv === 'true';
  }
  return swaggerEnv !== 'false';
}

export const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  swaggerEnabled: resolveSwaggerEnabled(process.env.NODE_ENV, process.env.SWAGGER_ENABLED),
  
  // CORS configuration
  allowedOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // JWT configuration
  jwt: {
    secret: resolveJwtSecret(process.env.NODE_ENV, process.env.JWT_SECRET),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Database settings
  db: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'arivunet_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: resolveSslConfig(),
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 10000
  },

  // Gemini AI configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004'
  },

  /**
   * Helper to check whether database configuration has been explicitly provided
   */
  isDbConfigured: () => {
    const url = process.env.DATABASE_URL;
    if (url && url.trim() !== '' && !url.includes('your_password') && !url.includes('your_neon_connection_string_here')) {
      return true;
    }
    const hasPassword = Boolean(process.env.DB_PASSWORD && process.env.DB_PASSWORD !== 'your_database_password_here');
    return hasPassword;
  }
};
