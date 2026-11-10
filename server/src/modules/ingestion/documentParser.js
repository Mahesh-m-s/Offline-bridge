/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Multi-Format Document Parser
 * 
 * Extracts clean structured text and page boundaries from:
 * - PDF documents (via pdf-parse with page-level mapping)
 * - Markdown documents (.md)
 * - Plain text documents (.txt)
 * - JSON documents (.json / structured objects)
 */

import { createRequire } from 'module';
import { cleanText } from './textCleaner.js';

const require = createRequire(import.meta.url);

/**
 * Parse a PDF buffer into structured text and pages.
 * 
 * @param {Buffer} buffer - Raw PDF buffer
 * @returns {Promise<{ text: string, pages: Array<{ pageNumber: number, text: string }>, numPages: number, info: object }>}
 */
export async function parsePdfBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    const err = new Error('Invalid PDF: Input must be a valid Buffer.');
    err.code = 'INVALID_PDF_BUFFER';
    throw err;
  }

  if (buffer.length === 0) {
    const err = new Error('Empty PDF: Buffer has 0 bytes.');
    err.code = 'EMPTY_DOCUMENT';
    throw err;
  }

  // Check PDF signature (%PDF-)
  const header = buffer.subarray(0, 5).toString('ascii');
  if (!header.startsWith('%PDF-')) {
    const err = new Error('Invalid PDF format: Missing %PDF- header magic bytes.');
    err.code = 'INVALID_PDF_HEADER';
    throw err;
  }

  try {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    const pages = (result.pages || []).map((p, idx) => ({
      pageNumber: p.num || idx + 1,
      text: cleanText(p.text || '')
    })).filter((p) => p.text.length > 0);

    const fullCleanText = cleanText(result.text || pages.map((p) => p.text).join('\n\n'));

    return {
      text: fullCleanText,
      pages,
      numPages: pages.length || 1,
      info: result.info || {}
    };
  } catch (err) {
    if (err.code === 'INVALID_PDF_HEADER' || err.code === 'EMPTY_DOCUMENT') {
      throw err;
    }
    const parseErr = new Error(`Failed to parse PDF document: ${err.message}`);
    parseErr.code = 'PDF_PARSE_FAILED';
    parseErr.cause = err;
    throw parseErr;
  }
}

/**
 * Parse plain text or Markdown document content.
 * 
 * @param {string|Buffer} content - Raw text or Markdown
 * @param {string} [format='text'] - 'text' | 'markdown' | 'md'
 * @returns {{ text: string, pages: Array<{ pageNumber: number, text: string }>, numPages: number }}
 */
export function parseTextDocument(content, format = 'text') {
  const rawString = Buffer.isBuffer(content) ? content.toString('utf-8') : String(content || '');
  const cleaned = cleanText(rawString);

  if (!cleaned) {
    const err = new Error('Document content is empty after cleaning.');
    err.code = 'EMPTY_DOCUMENT';
    throw err;
  }

  return {
    text: cleaned,
    pages: [{ pageNumber: 1, text: cleaned }],
    numPages: 1,
    format
  };
}

/**
 * Parse structured JSON document content.
 * 
 * @param {string|object|Buffer} content - Raw JSON string, buffer, or object
 * @returns {{ text: string, pages: Array<{ pageNumber: number, text: string }>, rawData: any }}
 */
export function parseJsonDocument(content) {
  let parsed;
  if (typeof content === 'object' && !Buffer.isBuffer(content)) {
    parsed = content;
  } else {
    const rawString = Buffer.isBuffer(content) ? content.toString('utf-8') : String(content || '');
    try {
      parsed = JSON.parse(rawString);
    } catch (err) {
      const jsonErr = new Error(`Invalid JSON document: ${err.message}`);
      jsonErr.code = 'INVALID_JSON';
      throw jsonErr;
    }
  }

  // Format JSON into readable key-value paragraphs for text processing
  let text = '';
  if (Array.isArray(parsed)) {
    text = parsed.map((item, idx) => `[Item ${idx + 1}]\n${JSON.stringify(item, null, 2)}`).join('\n\n');
  } else if (typeof parsed === 'object' && parsed !== null) {
    text = Object.entries(parsed)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');
  } else {
    text = String(parsed);
  }

  const cleaned = cleanText(text);
  return {
    text: cleaned,
    pages: [{ pageNumber: 1, text: cleaned }],
    numPages: 1,
    rawData: parsed
  };
}

/**
 * Generic document parser supporting PDF, Markdown, Text, and JSON.
 * 
 * @param {string|Buffer|object} input - Document content
 * @param {object} options
 * @param {string} [options.format] - Explicit format: 'pdf', 'markdown', 'md', 'text', 'json'
 * @param {string} [options.filename] - Original filename to infer format from extension
 * @returns {Promise<{ text: string, pages: Array<{ pageNumber: number, text: string }>, numPages: number, format: string, info?: object }>}
 */
export async function parseDocument(input, options = {}) {
  let format = (options.format || '').toLowerCase();

  if (!format && options.filename) {
    const ext = options.filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') format = 'pdf';
    else if (ext === 'md' || ext === 'markdown') format = 'markdown';
    else if (ext === 'json') format = 'json';
    else if (ext === 'txt') format = 'text';
  }

  // Auto-detect format if still unknown
  if (!format) {
    if (Buffer.isBuffer(input)) {
      if (input.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
        format = 'pdf';
      } else {
        format = 'text';
      }
    } else if (typeof input === 'object' && input !== null) {
      format = 'json';
    } else {
      format = 'text';
    }
  }

  switch (format) {
    case 'pdf': {
      const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
      const res = await parsePdfBuffer(buf);
      return { ...res, format: 'pdf' };
    }
    case 'markdown':
    case 'md': {
      const res = parseTextDocument(input, 'markdown');
      return { ...res, format: 'markdown' };
    }
    case 'text':
    case 'txt': {
      const res = parseTextDocument(input, 'text');
      return { ...res, format: 'text' };
    }
    case 'json': {
      const res = parseJsonDocument(input);
      return { ...res, format: 'json' };
    }
    default: {
      const err = new Error(`Unsupported document format: '${format}'. Supported: pdf, markdown, text, json.`);
      err.code = 'UNSUPPORTED_FORMAT';
      throw err;
    }
  }
}

