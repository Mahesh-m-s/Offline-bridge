/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Semantic Text Chunker
 * 
 * Splits documents into overlapping semantic chunks while preserving:
 * - Markdown and document headings (e.g. # Section, ## Sub-section).
 * - Page references (1-based page number from multi-page PDFs).
 * - Document identity and metadata.
 * - SHA-256 content hashes for deterministic deduplication.
 */

import crypto from 'crypto';
import { detectLanguage } from './textCleaner.js';

/**
 * Generate SHA-256 hash of a string.
 * 
 * @param {string} text
 * @returns {string} Hex hash
 */
export function generateHash(text) {
  return crypto.createHash('sha256').update(String(text).trim()).digest('hex');
}

/**
 * Extract active section heading from text lines.
 * 
 * @param {string} line
 * @returns {string|null} Heading title or null
 */
function extractHeading(line) {
  const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  // Also recognize uppercase section headers like "ELIGIBILITY CRITERIA:"
  const uppercaseMatch = line.match(/^([A-Z\s]{4,40}):\s*$/);
  if (uppercaseMatch) {
    return uppercaseMatch[1].trim();
  }
  return null;
}

/**
 * Split text into semantic chunks with overlap.
 * 
 * @param {string} text - Cleaned text
 * @param {object} [options]
 * @param {number} [options.targetChunkSize=600] - Desired character count per chunk
 * @param {number} [options.chunkOverlap=100] - Overlap character count
 * @param {number} [options.pageNumber=1] - Associated page number
 * @param {string} [options.defaultSection='General Information'] - Initial section title
 * @returns {Array<{ content: string, section: string, pageNumber: number, charCount: number }>}
 */
export function chunkTextWithSections(text, options = {}) {
  const targetChunkSize = options.targetChunkSize || 600;
  const chunkOverlap = options.chunkOverlap || 100;
  const pageNumber = options.pageNumber || 1;
  let currentSection = options.defaultSection || 'General Information';

  if (!text || typeof text !== 'string') return [];

  // Break text into paragraphs
  const paragraphs = text.split(/\n\n+/);
  const rawSections = [];

  for (const para of paragraphs) {
    const lines = para.split('\n');
    let buffer = [];

    for (const line of lines) {
      const heading = extractHeading(line);
      if (heading) {
        if (buffer.length > 0) {
          rawSections.push({ section: currentSection, text: buffer.join(' ').trim() });
          buffer = [];
        }
        currentSection = heading;
      } else {
        buffer.push(line);
      }
    }

    if (buffer.length > 0) {
      rawSections.push({ section: currentSection, text: buffer.join(' ').trim() });
    }
  }

  // Now assemble sections into target-sized chunks with overlap
  const chunks = [];

  for (const sec of rawSections) {
    const secText = sec.text;
    if (!secText) continue;

    if (secText.length <= targetChunkSize) {
      chunks.push({
        content: secText,
        section: sec.section,
        pageNumber,
        charCount: secText.length
      });
      continue;
    }

    // Split long section into sentences/words respecting chunkOverlap
    const sentences = secText.split(/(?<=[.!?।\n])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).trim().length <= targetChunkSize) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) {
          chunks.push({
            content: currentChunk,
            section: sec.section,
            pageNumber,
            charCount: currentChunk.length
          });
          // Retain overlap from end of currentChunk
          const words = currentChunk.split(/\s+/);
          const overlapWords = words.slice(-Math.max(1, Math.floor(chunkOverlap / 8))).join(' ');
          currentChunk = (overlapWords + ' ' + sentence).trim();
        } else {
          // Single sentence is longer than targetChunkSize -> hard break
          chunks.push({
            content: sentence.substring(0, targetChunkSize),
            section: sec.section,
            pageNumber,
            charCount: Math.min(sentence.length, targetChunkSize)
          });
          currentChunk = sentence.substring(targetChunkSize - chunkOverlap);
        }
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        section: sec.section,
        pageNumber,
        charCount: currentChunk.trim().length
      });
    }
  }

  return chunks;
}

/**
 * Split a parsed document (with optional multi-page mapping) into enriched chunks.
 * 
 * @param {object} parsedDoc - Result from documentParser.js
 * @param {object} metadata - Document-level metadata (documentId, documentTitle, department, schemeId, sourceUrl, etc.)
 * @param {object} [options] - Chunking configuration options
 * @returns {Array<object>} Array of fully enriched chunk objects ready for ingestion
 */
export function chunkDocument(parsedDoc, metadata = {}, options = {}) {
  const documentId = metadata.documentId || `doc-${generateHash(metadata.documentTitle || parsedDoc.text.substring(0, 50)).substring(0, 16)}`;
  const documentTitle = metadata.documentTitle || metadata.title || 'Untitled Government Document';
  const department = metadata.department || 'Government of Karnataka';
  const schemeId = metadata.schemeId || null;
  const sourceUrl = metadata.sourceUrl || null;
  const verificationStatus = metadata.verificationStatus || 'provisional_catalogue_entry';
  const lastVerifiedDate = metadata.lastVerifiedDate || null;

  const pages = parsedDoc.pages && parsedDoc.pages.length > 0
    ? parsedDoc.pages
    : [{ pageNumber: 1, text: parsedDoc.text }];

  const rawChunks = [];
  let defaultSection = metadata.section || 'General Information';

  for (const page of pages) {
    const pageChunks = chunkTextWithSections(page.text, {
      ...options,
      pageNumber: page.pageNumber,
      defaultSection
    });

    if (pageChunks.length > 0) {
      defaultSection = pageChunks[pageChunks.length - 1].section;
    }

    rawChunks.push(...pageChunks);
  }

  const totalChunks = rawChunks.length;

  return rawChunks.map((chunk, index) => {
    const language = metadata.language || detectLanguage(chunk.content);
    const contentHash = generateHash(`${documentId}:${index}:${chunk.content}`);

    return {
      documentId,
      documentTitle,
      department,
      schemeId,
      sourceUrl,
      language,
      verificationStatus,
      lastVerifiedDate,
      section: chunk.section,
      page: chunk.pageNumber,
      chunkIndex: index,
      totalChunks,
      content: chunk.content,
      contentHash,
      createdAt: new Date().toISOString()
    };
  });
}

