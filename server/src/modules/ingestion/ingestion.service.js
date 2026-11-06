/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Ingestion Service
 * 
 * Orchestrates multi-format document ingestion, semantic chunking,
 * metadata extraction, deduplication, and audit logging.
 */

import { parseDocument } from './documentParser.js';
import { chunkDocument } from './chunker.js';
import { saveChunks, getStorageStats, getAllChunks } from './documentRepository.js';
import { ingestCatalogue } from './schemeCatalogueIngester.js';
import { recordAuditLog } from '../audit/audit.service.js';

/**
 * Ingest raw document content (Text, Markdown, JSON) into chunked knowledge base.
 */
export async function ingestDocument({
  schemeId = null,
  title,
  content,
  format = 'text',
  sourceUrl = null,
  department = 'Government of Karnataka',
  provenance = {},
  actorUser = null,
  ipAddress = null
}) {
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    const err = new Error('Document title must be at least 3 characters.');
    err.code = 'INVALID_TITLE';
    throw err;
  }

  if (!content || (typeof content !== 'string' && typeof content !== 'object')) {
    const err = new Error('Document content cannot be empty.');
    err.code = 'EMPTY_CONTENT';
    throw err;
  }

  // 1. Parse document
  const parsed = await parseDocument(content, { format });

  // 2. Chunk document with metadata
  const chunks = chunkDocument(parsed, {
    documentTitle: title.trim(),
    department: department || provenance.department,
    schemeId: schemeId || provenance.schemeId,
    sourceUrl: sourceUrl || provenance.sourceUrl,
    verificationStatus: provenance.verificationStatus || 'provisional_catalogue_entry',
    lastVerifiedDate: provenance.lastVerifiedDate || null,
    language: provenance.language
  });

  // 3. Save chunks with deduplication
  const saveResult = await saveChunks(chunks);

  // 4. Record audit log if actor user is provided
  if (actorUser) {
    await recordAuditLog({
      actorId: actorUser.id,
      actorRole: actorUser.role,
      action: 'DOCUMENT_INGESTED',
      resourceType: 'knowledge_document',
      resourceId: chunks[0]?.documentId || 'unknown',
      ipAddress,
      metadata: {
        title,
        schemeId,
        format,
        totalChunks: chunks.length,
        insertedChunks: saveResult.inserted,
        skippedChunks: saveResult.skipped,
        storageBackend: saveResult.storageBackend
      }
    });
  }

  return {
    documentId: chunks[0]?.documentId,
    title,
    format,
    totalChunks: chunks.length,
    insertedChunks: saveResult.inserted,
    skippedChunks: saveResult.skipped,
    storageBackend: saveResult.storageBackend,
    sampleChunk: chunks[0] || null
  };
}

/**
 * Ingest document file (PDF, Markdown, Text) from Buffer.
 */
export async function ingestFileDocument({
  buffer,
  filename,
  title = null,
  department = 'Government of Karnataka',
  schemeId = null,
  sourceUrl = null,
  provenance = {},
  actorUser = null,
  ipAddress = null
}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    const err = new Error('A valid file buffer is required.');
    err.code = 'INVALID_FILE_BUFFER';
    throw err;
  }

  const effectiveTitle = (title || filename || 'Uploaded Document').replace(/\.[^/.]+$/, '');

  // 1. Parse document from buffer (handles PDF, Markdown, Text)
  const parsed = await parseDocument(buffer, { filename });

  // 2. Chunk document with page numbers and metadata
  const chunks = chunkDocument(parsed, {
    documentTitle: effectiveTitle,
    department: department || provenance.department,
    schemeId: schemeId || provenance.schemeId,
    sourceUrl: sourceUrl || provenance.sourceUrl,
    verificationStatus: provenance.verificationStatus || 'provisional_catalogue_entry',
    lastVerifiedDate: provenance.lastVerifiedDate || null,
    language: provenance.language
  });

  // 3. Save chunks
  const saveResult = await saveChunks(chunks);

  // 4. Record audit log
  if (actorUser) {
    await recordAuditLog({
      actorId: actorUser.id,
      actorRole: actorUser.role,
      action: 'DOCUMENT_FILE_INGESTED',
      resourceType: 'knowledge_document',
      resourceId: chunks[0]?.documentId || 'unknown',
      ipAddress,
      metadata: {
        filename,
        title: effectiveTitle,
        format: parsed.format,
        numPages: parsed.numPages,
        totalChunks: chunks.length,
        insertedChunks: saveResult.inserted,
        skippedChunks: saveResult.skipped,
        storageBackend: saveResult.storageBackend
      }
    });
  }

  return {
    documentId: chunks[0]?.documentId,
    filename,
    title: effectiveTitle,
    format: parsed.format,
    numPages: parsed.numPages,
    totalChunks: chunks.length,
    insertedChunks: saveResult.inserted,
    skippedChunks: saveResult.skipped,
    storageBackend: saveResult.storageBackend
  };
}

/**
 * Seed official Karnataka schemes catalogue into knowledge base.
 */
export async function seedSchemesCatalogue({ catalogue = null, actorUser = null, ipAddress = null } = {}) {
  const result = await ingestCatalogue(catalogue);

  if (actorUser) {
    await recordAuditLog({
      actorId: actorUser.id,
      actorRole: actorUser.role,
      action: 'CATALOGUE_SEEDED',
      resourceType: 'knowledge_base',
      resourceId: 'schemes_catalogue',
      ipAddress,
      metadata: result
    });
  }

  return result;
}

/**
 * Get comprehensive ingestion statistics.
 */
export async function getIngestionStatus() {
  return getStorageStats();
}

/**
 * Query chunks by filter (used by RAG retrieval)
 */
export async function getKnowledgeChunks(filters = {}) {
  return getAllChunks(filters);
}
