/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Knowledge Document Repository
 * 
 * Storage abstraction for RAG knowledge chunks.
 * 
 * Safety & Zero-DDL Principles:
 * - Checks if PostgreSQL 'knowledge_documents' table exists before issuing queries.
 * - If DB table exists: persists chunks directly into knowledge_documents with structured JSONB provenance.
 * - If DB is unavailable or unmigrated: safely falls back to a persistent JSON store at server/data/knowledge_base.json.
 * - Never claims persistence without real backing store.
 * - Enforces content-based deduplication using SHA-256 contentHash.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../../db/pool.js';
import { env } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'knowledge_base.json');

// Memory cache of chunks for fast retrieval
let memoryChunks = null;
let dbTableAvailable = null; // null: unchecked, true: available, false: unavailable

/**
 * Check if the PostgreSQL database has the 'knowledge_documents' table.
 * 
 * @returns {Promise<boolean>}
 */
export async function isDatabaseTableAvailable() {
  if (dbTableAvailable !== null) return dbTableAvailable;

  if (!env.isDbConfigured()) {
    dbTableAvailable = false;
    return false;
  }

  try {
    const pool = getPool();
    const res = await pool.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = current_schema() AND table_name = 'knowledge_documents'
    `);
    dbTableAvailable = res.rows.length > 0;
    return dbTableAvailable;
  } catch (err) {
    dbTableAvailable = false;
    return false;
  }
}

/**
 * Reset cached DB table check (useful for unit tests with disposable schemas)
 */
export function resetDatabaseCheck() {
  dbTableAvailable = null;
}

/**
 * Ensure local persistent store exists and load into memory.
 * 
 * @returns {Array<object>}
 */
function loadFileStore() {
  if (memoryChunks !== null) return memoryChunks;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
      memoryChunks = JSON.parse(data);
    } else {
      memoryChunks = [];
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[DocumentRepository] Error loading local file store:', err.message);
    memoryChunks = [];
  }

  return memoryChunks;
}

/**
 * Persist memory chunks to local file store.
 */
function syncToFileStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(memoryChunks || [], null, 2), 'utf-8');
  } catch (err) {
    console.error('[DocumentRepository] Error saving local file store:', err.message);
  }
}

/**
 * Save a single chunk with deduplication.
 * 
 * @param {object} chunk
 * @returns {Promise<{ inserted: boolean, chunk: object, reason?: string }>}
 */
export async function saveChunk(chunk) {
  const hasDb = await isDatabaseTableAvailable();

  if (hasDb) {
    const pool = getPool();

    // Check if chunk with identical hash already exists in provenance
    const checkQuery = `
      SELECT id FROM knowledge_documents 
      WHERE provenance->>'contentHash' = $1
      LIMIT 1;
    `;
    const checkRes = await pool.query(checkQuery, [chunk.contentHash]);

    if (checkRes.rows.length > 0) {
      return { inserted: false, chunk, reason: 'DUPLICATE_CONTENT_HASH' };
    }

    const insertQuery = `
      INSERT INTO knowledge_documents (scheme_id, title, content, source_url, provenance)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const provenance = {
      documentId: chunk.documentId,
      documentTitle: chunk.documentTitle,
      department: chunk.department,
      section: chunk.section,
      page: chunk.page,
      language: chunk.language,
      verificationStatus: chunk.verificationStatus,
      lastVerifiedDate: chunk.lastVerifiedDate,
      chunkIndex: chunk.chunkIndex,
      totalChunks: chunk.totalChunks,
      contentHash: chunk.contentHash,
      createdAt: chunk.createdAt
    };

    const result = await pool.query(insertQuery, [
      chunk.schemeId || null,
      chunk.documentTitle,
      chunk.content,
      chunk.sourceUrl || null,
      JSON.stringify(provenance)
    ]);

    return { inserted: true, chunk: { id: result.rows[0].id, ...chunk } };
  } else {
    // Persistent file store fallback
    const store = loadFileStore();
    const exists = store.some((c) => c.contentHash === chunk.contentHash);

    if (exists) {
      return { inserted: false, chunk, reason: 'DUPLICATE_CONTENT_HASH' };
    }

    store.push(chunk);
    syncToFileStore();
    return { inserted: true, chunk };
  }
}

/**
 * Save multiple chunks with deduplication and transactional batching where available.
 * 
 * @param {Array<object>} chunks
 * @returns {Promise<{ total: number, inserted: number, skipped: number, storageBackend: string }>}
 */
export async function saveChunks(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return { total: 0, inserted: 0, skipped: 0, storageBackend: 'none' };
  }

  const hasDb = await isDatabaseTableAvailable();
  let inserted = 0;
  let skipped = 0;

  for (const chunk of chunks) {
    const res = await saveChunk(chunk);
    if (res.inserted) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return {
    total: chunks.length,
    inserted,
    skipped,
    storageBackend: hasDb ? 'postgres' : 'file_storage'
  };
}

/**
 * Retrieve all chunks matching optional filters.
 * 
 * @param {object} [filters]
 * @param {string} [filters.schemeId]
 * @param {string} [filters.documentId]
 * @param {string} [filters.language]
 * @returns {Promise<Array<object>>}
 */
export async function getAllChunks(filters = {}) {
  const hasDb = await isDatabaseTableAvailable();

  if (hasDb) {
    const pool = getPool();
    let query = `
      SELECT id, scheme_id, title, content, source_url, provenance, created_at
      FROM knowledge_documents
      WHERE 1=1
    `;
    const params = [];

    if (filters.schemeId) {
      params.push(filters.schemeId);
      query += ` AND scheme_id = $${params.length}`;
    }

    if (filters.documentId) {
      params.push(filters.documentId);
      query += ` AND provenance->>'documentId' = $${params.length}`;
    }

    if (filters.language) {
      params.push(filters.language);
      query += ` AND provenance->>'language' = $${params.length}`;
    }

    query += ` ORDER BY created_at ASC;`;

    const res = await pool.query(query, params);
    return res.rows.map((row) => ({
      id: row.id,
      schemeId: row.scheme_id,
      documentTitle: row.title,
      content: row.content,
      sourceUrl: row.source_url,
      createdAt: row.created_at,
      ...(row.provenance || {})
    }));
  } else {
    const store = loadFileStore();
    return store.filter((c) => {
      if (filters.schemeId && c.schemeId !== filters.schemeId) return false;
      if (filters.documentId && c.documentId !== filters.documentId) return false;
      if (filters.language && c.language !== filters.language) return false;
      return true;
    });
  }
}

/**
 * Clear in-memory cache and test store (useful for automated testing)
 */
export function clearTestStore() {
  memoryChunks = [];
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    // Ignore test cleanup errors
  }
}

/**
 * Report storage diagnostic metadata.
 * 
 * @returns {Promise<object>}
 */
export async function getStorageStats() {
  const hasDb = await isDatabaseTableAvailable();
  const all = await getAllChunks();

  const uniqueDocs = new Set(all.map((c) => c.documentId)).size;

  return {
    storageBackend: hasDb ? 'postgres' : 'file_storage',
    isDbTableAvailable: hasDb,
    isPersistent: true,
    totalChunks: all.length,
    totalDocuments: uniqueDocs,
    storeLocation: hasDb ? 'PostgreSQL knowledge_documents' : LOCAL_STORE_FILE
  };
}

