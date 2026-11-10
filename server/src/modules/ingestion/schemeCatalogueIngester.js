/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Schemes Catalogue Ingester
 * 
 * Transforms the verified Karnataka government schemes catalogue
 * (from client/src/data/schemesCatalogue.js) into structured knowledge base documents
 * in both English and Kannada.
 * 
 * Safety & Accuracy Rules:
 * - Preserves verified dates and official department URLs.
 * - Marks verificationStatus as 'officially_verified' only when supported by source metadata.
 * - Generates distinct English and Kannada knowledge documents with clear section hierarchies.
 * - Never fabricates non-existent deadlines or income thresholds.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chunkDocument } from './chunker.js';
import { saveChunks } from './documentRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Format string or array into clean bullet-pointed text.
 * 
 * @param {string|Array<string>} value
 * @returns {string}
 */
function formatList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${String(item).trim()}`).join('\n');
  }
  return String(value || '').trim();
}

/**
 * Transform a single scheme object into English and Kannada structured document chunks.
 * 
 * @param {object} scheme - Scheme from SCHEMES_CATALOGUE
 * @returns {Array<object>} Array of chunks
 */
export function buildSchemeKnowledgeChunks(scheme) {
  if (!scheme || !scheme.id) return [];

  const chunks = [];
  const verificationStatus = scheme.verifiedDate ? 'officially_verified' : 'provisional_catalogue_entry';
  const lastVerifiedDate = scheme.verifiedDate || null;
  const officialUrl = scheme.officialUrl || null;
  const helpline = scheme.helpline || null;

  // 1. English Knowledge Document
  const enSections = [
    `# Scheme: ${scheme.title}`,
    `Scheme Name: ${scheme.title}`,
    `Department: ${scheme.department}`,
    `Category: ${scheme.category || 'Welfare'}`,
    `Official Portal: ${officialUrl || 'Not available'}`,
    `Department Helpline: ${helpline || 'Janaspandana 1902'}`,
    '',
    `## Overview and Objectives`,
    scheme.description || 'Details unavailable.',
    '',
    `## Benefits and Financial Assistance`,
    formatList(scheme.benefits) || 'Refer to official guidelines.',
    '',
    `## Eligibility Criteria`,
    formatList(scheme.eligibilityCriteria) || 'Subject to departmental verification.',
    '',
    `## Required Documents`,
    formatList(scheme.requiredDocuments) || 'Standard identity documents required.',
    '',
    `## Application Procedure and Official Portals`,
    formatList(scheme.applicationProcedure) || 'Submit online via official portal or nearest Grama One center.'
  ].join('\n');

  const enParsed = {
    text: enSections,
    pages: [{ pageNumber: 1, text: enSections }]
  };

  const enChunks = chunkDocument(enParsed, {
    documentId: `scheme-${scheme.id}-en`,
    documentTitle: scheme.title,
    department: scheme.department,
    schemeId: scheme.id,
    sourceUrl: officialUrl,
    language: 'en',
    verificationStatus,
    lastVerifiedDate
  });
  chunks.push(...enChunks);

  // 2. Kannada Knowledge Document (if Kannada metadata is available)
  if (scheme.titleKn) {
    const knSections = [
      `# ಯೋಜನೆ: ${scheme.titleKn}`,
      `ಯೋಜನೆಯ ಹೆಸರು: ${scheme.titleKn}`,
      `ಇಲಾಖೆ: ${scheme.departmentKn || scheme.department}`,
      `ವರ್ಗ: ${scheme.category || 'Welfare'}`,
      `ಅಧಿಕೃತ ಪೋರ್ಟಲ್: ${officialUrl || 'ಲಭ್ಯವಿಲ್ಲ'}`,
      `ಸಹಾಯವಾಣಿ: ${helpline || 'ಜನಸ್ಪಂದನ 1902'}`,
      '',
      `## ಅವಲೋಕನ ಮತ್ತು ಉದ್ದೇಶಗಳು`,
      scheme.descriptionKn || scheme.description || '',
      '',
      `## ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು`,
      formatList(scheme.benefitsKn || scheme.benefits),
      '',
      `## ಅರ್ಹತಾ ಮಾನದಂಡಗಳು`,
      formatList(scheme.eligibilityCriteriaKn || scheme.eligibilityCriteria),
      '',
      `## ಅಗತ್ಯ ದಾಖಲೆಗಳು`,
      formatList(scheme.requiredDocumentsKn || scheme.requiredDocuments),
      '',
      `## ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ`,
      formatList(scheme.applicationProcedureKn || scheme.applicationProcedure)
    ].join('\n');

    const knParsed = {
      text: knSections,
      pages: [{ pageNumber: 1, text: knSections }]
    };

    const knChunks = chunkDocument(knParsed, {
      documentId: `scheme-${scheme.id}-kn`,
      documentTitle: scheme.titleKn,
      department: scheme.departmentKn || scheme.department,
      schemeId: scheme.id,
      sourceUrl: officialUrl,
      language: 'kn',
      verificationStatus,
      lastVerifiedDate
    });
    chunks.push(...knChunks);
  }

  return chunks;
}

/**
 * Ingest the entire schemes catalogue into the knowledge repository.
 * 
 * @param {Array<object>} [catalogue] - Optional catalogue override. If omitted, dynamically imports client catalogue.
 * @returns {Promise<{ totalSchemes: number, totalChunks: number, insertedChunks: number, skippedChunks: number, storageBackend: string }>}
 */
export async function ingestCatalogue(catalogue = null) {
  let items = catalogue;

  if (!items) {
    const candidates = [
      path.resolve(__dirname, '../../data/schemesCatalogue.js'),
      path.resolve(__dirname, '../../../../client/src/data/schemesCatalogue.js')
    ];
    let cataloguePath = null;
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        cataloguePath = cand;
        break;
      }
    }
    if (!cataloguePath) {
      cataloguePath = candidates[0];
    }
    const imported = await import(`file://${cataloguePath.replace(/\\/g, '/')}`);
    items = imported.SCHEMES_CATALOGUE || [];
  }

  const allChunks = [];
  for (const scheme of items) {
    const schemeChunks = buildSchemeKnowledgeChunks(scheme);
    allChunks.push(...schemeChunks);
  }

  const saveResult = await saveChunks(allChunks);

  return {
    totalSchemes: items.length,
    totalChunks: allChunks.length,
    insertedChunks: saveResult.inserted,
    skippedChunks: saveResult.skipped,
    storageBackend: saveResult.storageBackend
  };
}
