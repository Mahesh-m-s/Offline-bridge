/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Scheme API Client
 * 
 * Reusable frontend API client for communicating with the backend Scheme endpoints.
 * Handles:
 * - Configurable backend URL via Vite environment variable (VITE_API_BASE_URL)
 * - Loading, network-offline, database-unavailable (503), not-found (404), and empty states
 * - Safe timeouts and error formatting
 * - Zero regression to offline capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl, API_BASE_URL } from './apiClient.js';

export { getApiBaseUrl, API_BASE_URL };

// Scheme ID validation regex (alphanumeric, hyphens, underscores, 1-64 chars)
const SCHEME_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Fetch all available schemes from the backend
 * 
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional AbortSignal
 * @param {number} [options.timeoutMs=5000] - Request timeout in milliseconds
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array<any>,
 *   count: number,
 *   isEmpty: boolean,
 *   isUnavailable: boolean,
 *   error: { message: string, code: string } | null
 * }>}
 */
export async function fetchSchemes(options = {}) {
  const { signal, timeoutMs = 5000, baseUrl: customUrl } = options;
  const baseUrl = getApiBaseUrl(customUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link external signal if provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`${baseUrl}/api/schemes`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let payload = {};
    if (contentType.includes('application/json')) {
      payload = await response.json().catch(() => ({}));
    }

    // 1. Success response (200 OK)
    if (response.status === 200 && payload.success) {
      const items = Array.isArray(payload.data) ? payload.data : [];
      return {
        success: true,
        data: items,
        count: items.length,
        isEmpty: items.length === 0,
        isUnavailable: false,
        error: null
      };
    }

    // 2. Database service unavailable (503)
    if (response.status === 503) {
      return {
        success: false,
        data: [],
        count: 0,
        isEmpty: false,
        isUnavailable: true,
        error: payload.error || {
          message: 'Database service is currently unavailable. PostgreSQL is not configured or running.',
          code: 'DATABASE_UNAVAILABLE'
        }
      };
    }

    // 3. Other unexpected HTTP errors
    return {
      success: false,
      data: [],
      count: 0,
      isEmpty: false,
      isUnavailable: response.status >= 500,
      error: payload.error || {
        message: `Scheme API returned HTTP status ${response.status}`,
        code: `HTTP_${response.status}`
      }
    };
  } catch (err) {
    clearTimeout(timeoutId);

    const isAborted = controller.signal.aborted;
    return {
      success: false,
      data: [],
      count: 0,
      isEmpty: false,
      isUnavailable: true,
      error: {
        message: isAborted
          ? 'Scheme API request timed out. The server may be offline.'
          : 'Unable to connect to the ArivuNet server. Device may be offline.',
        code: isAborted ? 'TIMEOUT' : 'NETWORK_ERROR'
      }
    };
  }
}

/**
 * Fetch a single scheme by its ID from the backend
 * 
 * @param {string} id - Scheme ID
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.timeoutMs=5000]
 * @returns {Promise<{
 *   success: boolean,
 *   data: Object | null,
 *   notFound: boolean,
 *   isInvalidId: boolean,
 *   isUnavailable: boolean,
 *   error: { message: string, code: string } | null
 * }>}
 */
export async function fetchSchemeById(id, options = {}) {
  // Client-side validation to avoid unnecessary network calls
  if (!id || typeof id !== 'string' || !SCHEME_ID_REGEX.test(id)) {
    return {
      success: false,
      data: null,
      notFound: false,
      isInvalidId: true,
      isUnavailable: false,
      error: {
        message: 'Invalid scheme ID format. Scheme ID must be between 1 and 64 alphanumeric characters, hyphens, or underscores.',
        code: 'INVALID_SCHEME_ID'
      }
    };
  }

  const { signal, timeoutMs = 5000, baseUrl: customUrl } = options;
  const baseUrl = getApiBaseUrl(customUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`${baseUrl}/api/schemes/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let payload = {};
    if (contentType.includes('application/json')) {
      payload = await response.json().catch(() => ({}));
    }

    if (response.status === 200 && payload.success) {
      return {
        success: true,
        data: payload.data,
        notFound: false,
        isInvalidId: false,
        isUnavailable: false,
        error: null
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        data: null,
        notFound: true,
        isInvalidId: false,
        isUnavailable: false,
        error: payload.error || {
          message: `Scheme '${id}' was not found.`,
          code: 'SCHEME_NOT_FOUND'
        }
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        data: null,
        notFound: false,
        isInvalidId: true,
        isUnavailable: false,
        error: payload.error || {
          message: 'Invalid scheme ID format.',
          code: 'INVALID_SCHEME_ID'
        }
      };
    }

    if (response.status === 503) {
      return {
        success: false,
        data: null,
        notFound: false,
        isInvalidId: false,
        isUnavailable: true,
        error: payload.error || {
          message: 'Database service is currently unavailable.',
          code: 'DATABASE_UNAVAILABLE'
        }
      };
    }

    return {
      success: false,
      data: null,
      notFound: false,
      isInvalidId: false,
      isUnavailable: response.status >= 500,
      error: payload.error || {
        message: `Scheme API returned HTTP status ${response.status}`,
        code: `HTTP_${response.status}`
      }
    };
  } catch (err) {
    clearTimeout(timeoutId);

    const isAborted = controller.signal.aborted;
    return {
      success: false,
      data: null,
      notFound: false,
      isInvalidId: false,
      isUnavailable: true,
      error: {
        message: isAborted
          ? 'Scheme API request timed out. The server may be offline.'
          : 'Unable to connect to the ArivuNet server. Device may be offline.',
        code: isAborted ? 'TIMEOUT' : 'NETWORK_ERROR'
      }
    };
  }
}

/**
 * React hook for consuming schemes data with complete state handling
 * 
 * @param {Object} [options]
 * @param {boolean} [options.autoFetch=true]
 * @returns {{
 *   schemes: Array<any>,
 *   loading: boolean,
 *   isUnavailable: boolean,
 *   isEmpty: boolean,
 *   error: Object | null,
 *   reload: () => Promise<void>
 * }}
 */
export function useSchemes(options = { autoFetch: true }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(Boolean(options.autoFetch));
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsUnavailable(false);
    setIsEmpty(false);

    const result = await fetchSchemes();

    if (result.success) {
      setSchemes(result.data);
      setIsEmpty(result.isEmpty);
    } else {
      setSchemes([]);
      setIsUnavailable(result.isUnavailable);
      setError(result.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (options.autoFetch) {
      load();
    }
  }, [load, options.autoFetch]);

  return {
    schemes,
    loading,
    isUnavailable,
    isEmpty,
    error,
    reload: load
  };
}
