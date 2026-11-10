/**
 * OfflineBridge — Scheme API Client
 * 
 * Production frontend API client communicating with the OfflineBridge Express backend.
 * Handles:
 * - Server-side pagination, debounced search, category filtering, and sorting
 * - Live PostgreSQL statistics endpoint (/api/schemes/stats)
 * - Safe timeouts, abort signals, and normalized error states
 * - Offline IndexedDB caching layer for seamless disconnected browsing
 */

import { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl, API_BASE_URL } from './apiClient.js';

export { getApiBaseUrl, API_BASE_URL };

const SCHEME_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Fetch schemes with server-side pagination, search, and category filtering.
 * 
 * @param {Object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.search]
 * @param {string} [options.category]
 * @param {string} [options.sort='title']
 * @param {string} [options.order='asc']
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.timeoutMs=8000]
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array<any>,
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     totalRecords: number,
 *     totalPages: number,
 *     hasNextPage: boolean,
 *     hasPreviousPage: boolean
 *   },
 *   count: number,
 *   isEmpty: boolean,
 *   isUnavailable: boolean,
 *   error: { message: string, code: string } | null
 * }>}
 */
export async function fetchSchemes(options = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    category = 'all',
    service_type = 'all',
    serviceType = 'all',
    sort = 'title',
    order = 'asc',
    signal,
    timeoutMs = 8000,
    baseUrl: customUrl
  } = options;

  const baseUrl = getApiBaseUrl(customUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const effectiveType = service_type !== 'all' ? service_type : serviceType;

  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (search && search.trim()) {
    queryParams.set('search', search.trim());
  }
  if (category && category !== 'all') {
    queryParams.set('category', category.trim());
  }
  if (effectiveType && effectiveType !== 'all') {
    queryParams.set('service_type', effectiveType.trim());
  }
  if (sort) {
    queryParams.set('sort', sort);
  }
  if (order) {
    queryParams.set('order', order);
  }

  const url = `${baseUrl}/api/schemes?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
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
      const items = Array.isArray(payload.data) ? payload.data : [];
      const pagination = payload.pagination || {
        page: Number(page),
        limit: Number(limit),
        totalRecords: items.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };

      return {
        success: true,
        data: items,
        pagination,
        count: items.length,
        isEmpty: items.length === 0,
        isUnavailable: false,
        error: null
      };
    }

    if (response.status === 503) {
      return {
        success: false,
        data: [],
        pagination: { page, limit, totalRecords: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
        count: 0,
        isEmpty: false,
        isUnavailable: true,
        error: payload.error || {
          message: 'Database service is currently unavailable. PostgreSQL is not configured or running.',
          code: 'DATABASE_UNAVAILABLE'
        }
      };
    }

    return {
      success: false,
      data: [],
      pagination: { page, limit, totalRecords: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
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
      pagination: { page, limit, totalRecords: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      count: 0,
      isEmpty: false,
      isUnavailable: true,
      error: {
        message: isAborted
          ? 'Scheme API request timed out. The server may be unreachable.'
          : 'Unable to connect to OfflineBridge server. Please check your network connection.',
        code: isAborted ? 'TIMEOUT' : 'NETWORK_ERROR'
      }
    };
  }
}

/**
 * Fetch live scheme statistics from PostgreSQL
 * 
 * @param {Object} [options]
 * @returns {Promise<{
 *   success: boolean,
 *   data: { totalSchemes: number, activeSchemes: number, byCategory: Object } | null,
 *   error: Object | null
 * }>}
 */
export async function fetchSchemeStats(options = {}) {
  const { signal, timeoutMs = 5000, baseUrl: customUrl } = options;
  const baseUrl = getApiBaseUrl(customUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(`${baseUrl}/api/schemes/stats`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const payload = await res.json();
      return { success: true, data: payload.data, error: null };
    }

    return { success: false, data: null, error: { message: `HTTP ${res.status}`, code: `HTTP_${res.status}` } };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, data: null, error: { message: err.message, code: 'NETWORK_ERROR' } };
  }
}

/**
 * Fetch a single scheme by ID from backend
 */
export async function fetchSchemeById(id, options = {}) {
  if (!id || typeof id !== 'string' || !SCHEME_ID_REGEX.test(id)) {
    return {
      success: false,
      data: null,
      notFound: false,
      isInvalidId: true,
      isUnavailable: false,
      error: {
        message: 'Invalid scheme ID format.',
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
      headers: { 'Accept': 'application/json' },
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
        error: payload.error || { message: `Scheme '${id}' not found.`, code: 'SCHEME_NOT_FOUND' }
      };
    }

    return {
      success: false,
      data: null,
      notFound: false,
      isInvalidId: false,
      isUnavailable: response.status >= 500,
      error: payload.error || { message: `HTTP status ${response.status}`, code: `HTTP_${response.status}` }
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      data: null,
      notFound: false,
      isInvalidId: false,
      isUnavailable: true,
      error: { message: 'Unable to connect to OfflineBridge server.', code: 'NETWORK_ERROR' }
    };
  }
}

/**
 * Fetch recent ingestion jobs for admin monitoring dashboard.
 */
export async function fetchIngestionJobs(options = {}) {
  const { limit = 10, signal, baseUrl: customUrl } = options;
  const baseUrl = getApiBaseUrl(customUrl);

  try {
    const res = await fetch(`${baseUrl}/api/schemes/ingestion-jobs?limit=${limit}`, {
      headers: { 'Accept': 'application/json' },
      signal
    });
    const payload = await res.json().catch(() => ({}));
    if (res.ok && payload.success) {
      return { success: true, data: payload.data || [] };
    }
    return { success: false, data: [], error: payload.error };
  } catch (err) {
    return { success: false, data: [], error: { message: err.message } };
  }
}

/**
 * Fetch data health, outdated schemes, and source portals.
 */
export async function fetchAuditHealth(options = {}) {
  const { signal, baseUrl: customUrl } = options;
  const baseUrl = getApiBaseUrl(customUrl);

  try {
    const res = await fetch(`${baseUrl}/api/schemes/audit-health`, {
      headers: { 'Accept': 'application/json' },
      signal
    });
    const payload = await res.json().catch(() => ({}));
    if (res.ok && payload.success) {
      return { success: true, data: payload.data || {} };
    }
    return { success: false, data: {}, error: payload.error };
  } catch (err) {
    return { success: false, data: {}, error: { message: err.message } };
  }
}

/**
 * Trigger administrative incremental ingestion.
 */
export async function triggerIngestionSync(token, options = {}) {
  const { baseUrl: customUrl } = options;
  const baseUrl = getApiBaseUrl(customUrl);

  try {
    const res = await fetch(`${baseUrl}/api/schemes/trigger-ingestion`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const payload = await res.json().catch(() => ({}));
    return { success: res.ok && payload.success, data: payload.data, error: payload.error };
  } catch (err) {
    return { success: false, error: { message: err.message } };
  }
}
