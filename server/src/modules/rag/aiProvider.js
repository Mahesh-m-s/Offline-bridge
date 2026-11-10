/**
 * ArivuNet (ಅರಿವುನೆಟ್) — AI Provider Abstraction
 * 
 * Provides seamless integration with Google Gemini:
 * - Embedding generation via text-embedding-004.
 * - Grounded bilingual generation via gemini-1.5-flash.
 * 
 * Safety & Reliability Rules:
 * - API keys live strictly on the server in environment variables.
 * - If API key is missing: reports isConfigured: false without throwing uncaught exceptions.
 * - Provides deterministic fallback embeddings for offline vector testing.
 * - Treats network failures and rate limits gracefully with standard error codes.
 */

import crypto from 'crypto';
import { env } from '../../config/env.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Generate a deterministic normalized 64-dimensional vector from text tokens.
 * Used for offline semantic testing when no API key is present.
 * 
 * @param {string} text
 * @returns {Array<number>} 64-element normalized vector
 */
export function generateDeterministicVector(text) {
  const dim = 64;
  const vec = new Float64Array(dim);
  if (!text || typeof text !== 'string') return Array.from(vec);

  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  for (const word of words) {
    const hash = crypto.createHash('sha256').update(word).digest();
    for (let i = 0; i < dim; i++) {
      // Map hash byte to float in range [-1.0, 1.0]
      const val = (hash[i % hash.length] - 128) / 128;
      vec[i] += val;
    }
  }

  // Calculate L2 norm
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] /= norm;
    }
  }

  return Array.from(vec);
}

/**
 * Check if real Gemini API key is configured.
 * 
 * @returns {boolean}
 */
export function isAiConfigured() {
  const key = env.gemini.apiKey;
  return Boolean(key && key.trim() !== '' && !key.includes('your_gemini_api_key'));
}

/**
 * Generate vector embedding for a given text.
 * 
 * @param {string} text - Input text string
 * @param {object} [options]
 * @returns {Promise<{ embedding: Array<number>, isMock: boolean, model: string }>}
 */
export async function embedText(text, options = {}) {
  const sanitized = String(text || '').trim();
  if (!sanitized) {
    const err = new Error('Cannot generate embedding for empty text.');
    err.code = 'EMPTY_TEXT_EMBEDDING';
    throw err;
  }

  if (!isAiConfigured()) {
    // Return deterministic vector for offline testing
    return {
      embedding: generateDeterministicVector(sanitized),
      isMock: true,
      model: 'deterministic-token-vector'
    };
  }

  const modelName = env.gemini.embeddingModel || 'text-embedding-004';
  const url = `${GEMINI_API_BASE}/models/${modelName}:embedContent?key=${env.gemini.apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${modelName}`,
        content: { parts: [{ text: sanitized }] }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const err = new Error(errBody.error?.message || `Gemini embedding request failed with HTTP ${res.status}`);
      err.status = res.status;
      err.code = res.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'EMBEDDING_API_ERROR';
      throw err;
    }

    const data = await res.json();
    const values = data.embedding?.values;

    if (!values || !Array.isArray(values)) {
      const err = new Error('Gemini API returned malformed embedding response.');
      err.code = 'MALFORMED_EMBEDDING_RESPONSE';
      throw err;
    }

    return {
      embedding: values,
      isMock: false,
      model: modelName
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Gemini embedding request timed out.');
      timeoutErr.code = 'EMBEDDING_TIMEOUT';
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Generate grounded answer using Gemini LLM.
 * 
 * @param {object} params
 * @param {string} params.prompt - Formatted prompt containing XML-delimited reference context
 * @param {string} [params.systemInstruction] - System instructions for groundedness & language
 * @param {number} [params.timeoutMs=15000] - Request timeout in milliseconds
 * @returns {Promise<{ text: string, model: string, finishReason: string }>}
 */
export async function generateGroundedAnswer({ prompt, systemInstruction = '', timeoutMs = 15000 }) {
  if (!isAiConfigured()) {
    const err = new Error('Gemini AI credentials are not configured on the server. Please set GEMINI_API_KEY in server/.env.');
    err.code = 'AI_PROVIDER_NOT_CONFIGURED';
    err.status = 503;
    throw err;
  }

  const modelName = env.gemini.model || 'gemini-1.5-flash';
  const url = `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${env.gemini.apiKey}`;

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1, // Low temperature for high factual precision
      maxOutputTokens: 1024,
      topP: 0.8
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const err = new Error(errBody.error?.message || `Gemini generation request failed with HTTP ${res.status}`);
      err.status = res.status;
      err.code = res.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'GENERATION_API_ERROR';
      throw err;
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      const err = new Error('Gemini generation returned empty text or was blocked by safety filters.');
      err.code = 'EMPTY_GENERATION_RESPONSE';
      throw err;
    }

    return {
      text: text.trim(),
      model: modelName,
      finishReason: candidate.finishReason || 'STOP'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Gemini answer generation timed out.');
      timeoutErr.code = 'GENERATION_TIMEOUT';
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

