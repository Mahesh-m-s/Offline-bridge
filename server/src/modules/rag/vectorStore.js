/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Vector Search & Retrieval Engine
 * 
 * Provides hybrid semantic retrieval across Karnataka government knowledge chunks:
 * 1. Vector cosine similarity using Float64/Float32 embeddings.
 * 2. Lexical phrase & keyword scoring with bilingual term boosting (English & Kannada).
 * 3. Fast in-memory caching with file-backed persistence at server/data/embeddings_cache.json.
 * 
 * Zero-DDL Compliance:
 * - Operates entirely in memory and persistent JSON cache without database schema changes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllChunks } from '../ingestion/documentRepository.js';
import { embedText, isAiConfigured } from './aiProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');
const EMBEDDINGS_CACHE_FILE = path.join(DATA_DIR, 'embeddings_cache.json');

// In-memory embeddings cache: Map<contentHash, Array<number>>
let embeddingsCache = null;

/**
 * Compute cosine similarity between two numeric vectors.
 * 
 * @param {Array<number>} a
 * @param {Array<number>} b
 * @returns {number} Value in range [-1.0, 1.0]
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Load persistent embeddings cache from disk.
 * 
 * @returns {Map<string, Array<number>>}
 */
export function loadEmbeddingsCache() {
  if (embeddingsCache !== null) return embeddingsCache;

  embeddingsCache = new Map();

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(EMBEDDINGS_CACHE_FILE)) {
      const raw = fs.readFileSync(EMBEDDINGS_CACHE_FILE, 'utf-8');
      const obj = JSON.parse(raw);
      for (const [hash, vec] of Object.entries(obj)) {
        embeddingsCache.set(hash, vec);
      }
    }
  } catch (err) {
    console.warn('[VectorStore] Error loading embeddings cache:', err.message);
  }

  return embeddingsCache;
}

/**
 * Save in-memory embeddings cache to disk.
 */
export function saveEmbeddingsCache() {
  if (!embeddingsCache) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj = Object.fromEntries(embeddingsCache.entries());
    fs.writeFileSync(EMBEDDINGS_CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('[VectorStore] Error saving embeddings cache:', err.message);
  }
}

/**
 * Calculate lexical term overlap between query and chunk.
 * Supports both English and Kannada terms with acronym & entity matching.
 * 
 * @param {string} query
 * @param {object} chunk
 * @returns {number} Score in range [0.0, 1.0]
 */
export function calculateLexicalScore(query, chunk) {
  if (!query || !chunk || !chunk.content) return 0;

  const queryTerms = (query.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
    .filter((w) => w.length > 2);

  if (queryTerms.length === 0) return 0;

  const chunkText = `${chunk.documentTitle} ${chunk.department || ''} ${chunk.section || ''} ${chunk.content}`.toLowerCase();

  let matched = 0;
  for (const term of queryTerms) {
    const stem = term.length > 4 ? term.replace(/s$/, '').replace(/ing$/, '').replace(/es$/, '') : term;
    if (chunkText.includes(term) || chunkText.includes(stem)) {
      matched++;
    }
  }

  const baseScore = matched / queryTerms.length;

  // Key Karnataka scheme acronym & keyword boost
  const keywords = [
    'ssp', 'scholarship', 'ವಿದ್ಯಾರ್ಥಿವೇತನ',
    'yuva', 'nidhi', 'ಯುವ ನಿಧಿ',
    'raitha', 'siri', 'seed', 'ಬೀಜ', 'ರೈತ',
    'sandhya', 'suraksha', 'pension', 'ಪಿಂಚಣಿ', 'ಹಿರಿಯ',
    'gruha', 'lakshmi', 'ಗೃಹ ಲಕ್ಷ್ಮಿ',
    'ration', 'ahara', 'bpl', 'ಪಡಿತರ', 'ಆಹಾರ',
    'nadakacheri', 'caste', 'income', 'ಜಾತಿ', 'ಆದಾಯ',
    'kaveri', 'encumbrance', 'ec', 'ಕಾವೇರಿ',
    'basava', 'vasathi', 'housing', 'ವಸತಿ'
  ];

  let keywordBonus = 0;
  for (const kw of keywords) {
    if (query.toLowerCase().includes(kw) && chunkText.includes(kw)) {
      keywordBonus += 0.25;
    }
  }

  return Math.min(1.0, baseScore * 0.7 + keywordBonus);
}

/**
 * Ensure all stored knowledge chunks have embeddings.
 * 
 * @returns {Promise<{ totalChunks: number, embeddedChunks: number, isAiConfigured: boolean }>}
 */
export async function ensureChunkEmbeddings() {
  const cache = loadEmbeddingsCache();
  const chunks = await getAllChunks();

  let newlyEmbedded = 0;

  for (const chunk of chunks) {
    if (!cache.has(chunk.contentHash)) {
      const textToEmbed = `${chunk.documentTitle} - ${chunk.section}\n${chunk.content}`;
      const { embedding } = await embedText(textToEmbed);
      cache.set(chunk.contentHash, embedding);
      newlyEmbedded++;
    }
  }

  if (newlyEmbedded > 0) {
    saveEmbeddingsCache();
  }

  return {
    totalChunks: chunks.length,
    embeddedChunks: cache.size,
    isAiConfigured: isAiConfigured()
  };
}

/**
 * Retrieve the most relevant knowledge chunks for a citizen's query.
 * 
 * @param {string} query - Citizen question
 * @param {object} [options]
 * @param {number} [options.topK=4] - Number of chunks to return
 * @param {number} [options.minSimilarity=0.35] - Minimum combined similarity threshold
 * @param {string} [options.language] - Filter by language ('en' | 'kn') if specified
 * @returns {Promise<Array<object>>} Ranked relevant chunks
 */
export async function retrieveRelevantChunks(query, options = {}) {
  const sanitizedQuery = String(query || '').trim();
  if (!sanitizedQuery) return [];

  const topK = options.topK || 4;
  const minSimilarity = options.minSimilarity !== undefined ? options.minSimilarity : 0.25;
  const targetLanguage = options.language || null;

  // 1. Ensure chunk embeddings exist
  await ensureChunkEmbeddings();
  const cache = loadEmbeddingsCache();

  // 2. Embed user question
  const { embedding: queryEmbedding } = await embedText(sanitizedQuery);

  // 3. Score all chunks
  const chunks = await getAllChunks();
  const scoredChunks = [];

  for (const chunk of chunks) {
    // Optional language filtering
    if (targetLanguage && chunk.language && chunk.language !== targetLanguage) {
      continue;
    }

    const chunkEmbedding = cache.get(chunk.contentHash);
    const vectorScore = chunkEmbedding ? Math.max(0, cosineSimilarity(queryEmbedding, chunkEmbedding)) : 0;
    const lexicalScore = calculateLexicalScore(sanitizedQuery, chunk);

    // Hybrid score: 60% semantic vector, 40% lexical/keyword
    const hybridScore = (vectorScore * 0.6) + (lexicalScore * 0.4);

    if (hybridScore >= minSimilarity) {
      scoredChunks.push({
        ...chunk,
        vectorScore,
        lexicalScore,
        similarity: hybridScore
      });
    }
  }

  // 4. Sort descending by similarity
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  return scoredChunks.slice(0, topK);
}
