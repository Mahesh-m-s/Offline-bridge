/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Shared Resilient API Client
 * 
 * Reusable HTTP client for communicating with the ArivuNet Express backend.
 * 
 * Architectural & Security Principles:
 * - Reads base URL from VITE_API_BASE_URL (defaults to http://localhost:5000).
 * - Reads Bearer JWT exclusively from sessionStorage ('arivunet_auth_token').
 * - Attaches Bearer token to authenticated requests automatically.
 * - Handles JSON and non-JSON (HTML 502/504 error pages) responses safely.
 * - Normalizes HTTP errors (400, 401, 403, 404, 409, 422, 429, 500, 503).
 * - Gracefully flags network disconnects and timeouts without throwing uncaught exceptions.
 * - Never logs passwords, tokens, or personal citizen information to the console.
 * - Supports custom timeouts and external AbortSignal cancellation.
 */

export const AUTH_TOKEN_KEY = 'arivunet_auth_token';

/**
 * Base URL resolution with trailing slash normalization
 * 
 * @param {string} [customUrl] - Explicit URL override
 * @returns {string} Normalized base URL
 */
export const getApiBaseUrl = (customUrl) => {
  if (customUrl) return customUrl.replace(/\/+$/, '');

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Retrieve active JWT token from sessionStorage
 * 
 * @returns {string|null}
 */
export function getAuthToken() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(AUTH_TOKEN_KEY) || null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Store JWT token in sessionStorage
 * 
 * @param {string|null} token
 */
export function setAuthToken(token) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (token && typeof token === 'string') {
        window.sessionStorage.setItem(AUTH_TOKEN_KEY, token.trim());
      } else {
        window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  } catch {
    // Handle storage quota or restriction gracefully
  }
}

/**
 * Clear JWT token from sessionStorage on logout or session expiration
 */
export function clearAuthToken() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Handle restriction gracefully
  }
}

/**
 * Reusable HTTP Request Engine
 * 
 * @param {string} endpoint - Relative API endpoint path (e.g. '/api/auth/login' or 'schemes')
 * @param {Object} [options]
 * @param {string} [options.method='GET'] - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {any} [options.body] - Request body (object will be JSON stringified)
 * @param {Object} [options.headers] - Additional custom headers
 * @param {boolean} [options.auth=true] - Whether to automatically attach Bearer token if available
 * @param {string} [options.token] - Explicit token override
 * @param {number} [options.timeoutMs=8000] - Timeout in milliseconds (default 8s)
 * @param {AbortSignal} [options.signal] - Optional external AbortSignal
 * @param {string} [options.baseUrl] - Optional custom base URL
 * @returns {Promise<{
 *   success: boolean,
 *   status: number,
 *   data: any,
 *   error: { message: string, code: string, details?: any } | null,
 *   isUnavailable: boolean,
 *   isNetworkError: boolean,
 *   isTimeout: boolean,
 *   isAuthError: boolean,
 *   isForbidden: boolean,
 *   raw?: any
 * }>}
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    token: customToken,
    timeoutMs = 8000,
    signal: externalSignal,
    baseUrl: customBaseUrl
  } = options;

  const baseUrl = getApiBaseUrl(customBaseUrl);
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${baseUrl}${normalizedEndpoint}`;

  // Build Headers safely
  const requestHeaders = {
    Accept: 'application/json',
    ...headers
  };

  // Attach Bearer token if enabled and available
  if (auth) {
    const activeToken = customToken || getAuthToken();
    if (activeToken) {
      requestHeaders.Authorization = `Bearer ${activeToken}`;
    }
  }

  // Handle request body
  let serializedBody = undefined;
  if (body !== undefined && body !== null) {
    if (typeof body === 'object' && !(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
      serializedBody = JSON.stringify(body);
    } else {
      serializedBody = body;
    }
  }

  // Setup Timeout Controller and link external signal
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: method.toUpperCase(),
      headers: requestHeaders,
      body: serializedBody,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Parse Response safely (handling JSON, empty, or HTML error pages)
    const contentType = response.headers.get('content-type') || '';
    let parsedPayload = null;

    if (contentType.includes('application/json')) {
      parsedPayload = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      if (text) {
        parsedPayload = { message: text };
      }
    }

    const status = response.status;
    const isOk = response.ok; // 200 - 299

    // 1. Success response (2xx)
    if (isOk) {
      const isPayloadSuccess = parsedPayload && typeof parsedPayload === 'object' && 'success' in parsedPayload
        ? Boolean(parsedPayload.success)
        : true;

      const responseData = parsedPayload && typeof parsedPayload === 'object' && 'data' in parsedPayload
        ? parsedPayload.data
        : parsedPayload;

      return {
        success: isPayloadSuccess,
        status,
        data: responseData,
        error: null,
        isUnavailable: false,
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
        isForbidden: false,
        raw: parsedPayload
      };
    }

    // 2. Authentication Error (401)
    if (status === 401) {
      // Clear expired or invalid token automatically
      if (auth && !customToken) {
        clearAuthToken();
      }

      return {
        success: false,
        status,
        data: null,
        error: parsedPayload?.error || {
          message: parsedPayload?.message || 'Authentication required or token has expired.',
          code: 'UNAUTHENTICATED'
        },
        isUnavailable: false,
        isNetworkError: false,
        isTimeout: false,
        isAuthError: true,
        isForbidden: false,
        raw: parsedPayload
      };
    }

    // 3. Authorization / Forbidden Error (403)
    if (status === 403) {
      return {
        success: false,
        status,
        data: null,
        error: parsedPayload?.error || {
          message: parsedPayload?.message || 'Access forbidden: insufficient role permissions.',
          code: 'FORBIDDEN'
        },
        isUnavailable: false,
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
        isForbidden: true,
        raw: parsedPayload
      };
    }

    // 4. Rate Limiting (429)
    if (status === 429) {
      return {
        success: false,
        status,
        data: null,
        error: parsedPayload?.error || {
          message: parsedPayload?.message || 'Too many requests. Please wait a few moments before trying again.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        isUnavailable: false,
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
        isForbidden: false,
        raw: parsedPayload
      };
    }

    // 5. Database Service Unavailable (503)
    if (status === 503) {
      return {
        success: false,
        status,
        data: null,
        error: parsedPayload?.error || {
          message: parsedPayload?.message || 'Database service is currently unavailable. PostgreSQL is not configured or running.',
          code: 'DATABASE_UNAVAILABLE'
        },
        isUnavailable: true,
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
        isForbidden: false,
        raw: parsedPayload
      };
    }

    // 6. Generic Client or Server Errors (400, 404, 409, 422, 500, 502, etc.)
    return {
      success: false,
      status,
      data: null,
      error: parsedPayload?.error || {
        message: parsedPayload?.message || `API request failed with HTTP ${status}.`,
        code: parsedPayload?.code || `HTTP_${status}`
      },
      isUnavailable: status >= 500,
      isNetworkError: false,
      isTimeout: false,
      isAuthError: false,
      isForbidden: false,
      raw: parsedPayload
    };

  } catch (err) {
    clearTimeout(timeoutId);

    const isAborted = controller.signal.aborted;

    return {
      success: false,
      status: 0,
      data: null,
      error: {
        message: isAborted
          ? 'API request timed out. The server may be unreachable.'
          : 'Unable to connect to the ArivuNet server. Device may be offline.',
        code: isAborted ? 'TIMEOUT' : 'NETWORK_ERROR'
      },
      isUnavailable: true,
      isNetworkError: true,
      isTimeout: isAborted,
      isAuthError: false,
      isForbidden: false
    };
  }
}

/**
 * Convenience methods for REST verbs
 */
export const apiClient = {
  request: apiRequest,
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;

