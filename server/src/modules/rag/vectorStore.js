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
import { BILINGUAL_CONCEPTS, textMatchesTerm } from './bilingualDetector.js';

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
 * Supports English, Kannada script, and Kanglish transliterations
 * with semantic concept mapping across welfare schemes and intents.
 * 
 * @param {string} query
 * @param {object} chunk
 * @returns {number} Score in range [0.0, 1.0]
 */
export function calculateLexicalScore(query, chunk) {
  if (!query || !chunk || !chunk.content) return 0;

  const qLower = query.toLowerCase();
  const chunkText = `${chunk.documentTitle} ${chunk.department || ''} ${chunk.section || ''} ${chunk.content}`.toLowerCase();

  // 1. Direct word token matching
  const queryTerms = (qLower.match(/[\p{L}\p{N}]+/gu) || [])
    .filter((w) => w.length > 2);

  let directMatched = 0;
  if (queryTerms.length > 0) {
    for (const term of queryTerms) {
      const stem = term.length > 4 ? term.replace(/s$/, '').replace(/ing$/, '').replace(/es$/, '') : term;
      if (textMatchesTerm(chunkText, term) || textMatchesTerm(chunkText, stem)) {
        directMatched++;
      }
    }
  }

  const baseScore = queryTerms.length > 0 ? (directMatched / queryTerms.length) : 0;

  // 2. Cross-Lingual Concept Mapping Overlap
  let conceptScore = 0;
  for (const concept of BILINGUAL_CONCEPTS) {
    const queryHasConcept = concept.terms.some((t) => textMatchesTerm(qLower, t));
    if (queryHasConcept) {
      const chunkHasConcept = concept.terms.some((t) => textMatchesTerm(chunkText, t));
      if (chunkHasConcept) {
        conceptScore += concept.isCoreScheme ? 0.60 : 0.25;
      }
    }
  }

  // Combine direct word matching with bilingual concept bonus, capped at 1.0
  return Math.min(1.0, (baseScore * 0.40) + conceptScore);
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
 * Supports cross-lingual semantic matching (English queries matching Kannada documents
 * and Kannada queries matching English documents) with hybrid scoring.
 * 
 * @param {string} query - Citizen question
 * @param {object} [options]
 * @param {number} [options.topK=4] - Number of chunks to return
 * @param {number} [options.minSimilarity=0.25] - Minimum combined similarity threshold
 * @param {string} [options.language] - Optional preferred language ('en' | 'kn')
 * @param {boolean} [options.strictLanguage=false] - When true, strictly exclude documents in other languages
 * @returns {Promise<Array<object>>} Ranked relevant chunks
 */
export async function retrieveRelevantChunks(query, options = {}) {
  const sanitizedQuery = String(query || '').trim();
  if (!sanitizedQuery) return [];

  const topK = options.topK || 4;
  const minSimilarity = options.minSimilarity !== undefined ? options.minSimilarity : 0.25;
  const preferredLanguage = options.language || null;
  const strictLanguage = options.strictLanguage === true;

  // 1. Ensure chunk embeddings exist
  await ensureChunkEmbeddings();
  const cache = loadEmbeddingsCache();

  // 2. Embed user question
  const { embedding: queryEmbedding } = await embedText(sanitizedQuery);

  // 3. Score all chunks
  const chunks = await getAllChunks();
  const scoredChunks = [];

  for (const chunk of chunks) {
    // Only apply strict exclusion if caller explicitly enabled strictLanguage mode
    if (strictLanguage && preferredLanguage && chunk.language && chunk.language !== preferredLanguage) {
      continue;
    }

    const chunkEmbedding = cache.get(chunk.contentHash);
    const vectorScore = chunkEmbedding ? Math.max(0, cosineSimilarity(queryEmbedding, chunkEmbedding)) : 0;
    const lexicalScore = calculateLexicalScore(sanitizedQuery, chunk);

    // Hybrid score calculation:
    // When both vector and lexical scores are present, blend 50/50.
    // In cross-script matching where deterministic token vector is 0,
    // derive score directly from the bilingual concept-lexical engine (85% scaling).
    let hybridScore;
    if (vectorScore > 0 && lexicalScore > 0) {
      hybridScore = (vectorScore * 0.50) + (lexicalScore * 0.50);
    } else if (lexicalScore > 0) {
      hybridScore = lexicalScore * 0.85;
    } else {
      hybridScore = vectorScore * 0.55;
    }

    // Language preference: if chunk language matches preferred response language,
    // apply a small 5% tie-breaker boost, but never drop the opposite language.
    if (preferredLanguage && chunk.language === preferredLanguage) {
      hybridScore = Math.min(1.0, hybridScore * 1.05);
    }

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
