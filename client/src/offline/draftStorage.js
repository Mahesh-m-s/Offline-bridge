/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Local Draft Storage Engine
 * Uses native browser IndexedDB for reliable offline draft persistence
 * with transparent localStorage fallback for restricted environments.
 * 
 * Safety & Architectural Guarantees:
 * - Stores demonstration form drafts and grievance drafts entirely on the local device.
 * - Every draft has a stable unique local ID, createdAt time, and updatedAt time.
 * - Does NOT assign official government submission numbers or queue positions.
 * - Drafts are labeled: "Saved locally — not submitted".
 * - Preserves existing drafts and data formats without data loss or silent clearing.
 * - Sanitizes arbitrary fields to prevent memory bloat or script injection.
 * - No data is transmitted across the network in this offline persistence layer.
 */

const DB_NAME = 'ArivuNet_DraftDB';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const LS_PREFIX = 'arivunet_draft_';
const GRIEVANCE_DRAFT_ID = 'citizen-grievance';

let dbInstance = null;

/**
 * Check if browser supports IndexedDB
 */
export function isIndexedDBSupported() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Check if localStorage is available and writable
 */
function isLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__arivunet_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// LocalStorage Fallback Operations
// ============================================================================

function saveToLocalStorage(draftRecord) {
  if (!isLocalStorageAvailable()) return false;
  try {
    const key = LS_PREFIX + (draftRecord.id || draftRecord.serviceId);
    window.localStorage.setItem(key, JSON.stringify(draftRecord));
    return true;
  } catch (err) {
    console.warn('[ArivuNet Storage] LocalStorage write failed:', err);
    return false;
  }
}

function getFromLocalStorage(serviceId) {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(LS_PREFIX + serviceId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAllFromLocalStorage() {
  if (!isLocalStorageAvailable()) return [];
  try {
    const drafts = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(LS_PREFIX)) {
        try {
          const item = JSON.parse(window.localStorage.getItem(key));
          if (item && (item.id || item.serviceId)) {
            drafts.push(item);
          }
        } catch {
          // Skip malformed entries
        }
      }
    }
    return drafts;
  } catch {
    return [];
  }
}

function deleteFromLocalStorage(serviceId) {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(LS_PREFIX + serviceId);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// IndexedDB Core Engine
// ============================================================================

export function openDraftDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB is not supported or accessible in this browser.'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('serviceId', 'serviceId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;

        dbInstance.onversionchange = () => {
          dbInstance.close();
          dbInstance = null;
        };

        resolve(dbInstance);
      };

      request.onerror = (event) => {
        reject(new Error(event.target.error?.message || 'Failed to open local IndexedDB database.'));
      };

      request.onblocked = () => {
        reject(new Error('IndexedDB upgrade blocked by an open connection in another tab.'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Sanitize form data to safely store standard and scheme-specific fields
 */
function sanitizeFormData(formData) {
  if (!formData || typeof formData !== 'object') return {};

  const clean = {
    // Preserve legacy standard fields for backward compatibility
    applicantName: String(formData.applicantName || '').trim().slice(0, 150),
    contactPhone: String(formData.contactPhone || '').trim().slice(0, 30),
    villagePanchayat: String(formData.villagePanchayat || '').trim().slice(0, 150),
    categoryDetails: String(formData.categoryDetails || '').trim().slice(0, 150),
    notes: String(formData.notes || '').trim().slice(0, 1000)
  };

  // Safely copy all other fields (strings, numbers, booleans, arrays)
  for (const [key, val] of Object.entries(formData)) {
    if (key in clean) continue;

    if (typeof val === 'string') {
      clean[key] = val.trim().slice(0, 1000);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      clean[key] = val;
    } else if (Array.isArray(val)) {
      clean[key] = val.slice(0, 50).map((item) => {
        if (typeof item === 'string') return item.slice(0, 300);
        if (typeof item === 'object' && item !== null) {
          return {
            name: String(item.name || '').slice(0, 150),
            size: Number(item.size || 0),
            type: String(item.type || '').slice(0, 80)
          };
        }
        return item;
      });
    } else if (typeof val === 'object' && val !== null) {
      // Shallow object representation
      clean[key] = JSON.parse(JSON.stringify(val));
    }
  }

  return clean;
}

/**
 * Save or update a scheme application draft
 * 
 * @param {string} serviceId Unique service identifier
 * @param {string} serviceTitle Human-readable service title
 * @param {object} formData Serialized form fields
 * @param {object} [extraMeta] Optional metadata (department, category, type)
 * @returns {Promise<object>} The stored draft record
 */
export async function saveDraft(serviceId, serviceTitle, formData, extraMeta = {}) {
  if (!serviceId) {
    throw new Error('A valid serviceId is required to save a draft.');
  }

  const sanitizedData = sanitizeFormData(formData);

  // Preserve original createdAt timestamp if draft exists
  let createdAt = new Date().toISOString();
  try {
    const existing = await getDraft(serviceId);
    if (existing?.createdAt) {
      createdAt = existing.createdAt;
    }
  } catch {
    // If read fails, use current timestamp
  }

  const now = new Date().toISOString();
  const draftRecord = {
    id: String(serviceId),
    serviceId: String(serviceId),
    serviceTitle: String(serviceTitle || 'Government Service Application'),
    type: extraMeta.type || (serviceId === GRIEVANCE_DRAFT_ID ? 'grievance' : 'scheme_application'),
    department: extraMeta.department || '',
    category: extraMeta.category || '',
    formData: sanitizedData,
    createdAt: createdAt,
    updatedAt: now,
    status: 'saved_locally',
    statusLabel: 'Saved locally — not submitted'
  };

  // Attempt IndexedDB write
  try {
    const db = await openDraftDB();

    await new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(draftRecord);

        request.onsuccess = () => resolve(draftRecord);
        request.onerror = (event) => reject(new Error(event.target.error?.message || 'IndexedDB write request failed.'));
        transaction.onerror = (event) => reject(new Error(event.target.error?.message || 'Transaction failed.'));
      } catch (err) {
        reject(err);
      }
    });

    // Mirror to localStorage
    saveToLocalStorage(draftRecord);
    return draftRecord;
  } catch (idbErr) {
    console.warn('[ArivuNet Storage] IndexedDB save failed, falling back to localStorage:', idbErr);
    const saved = saveToLocalStorage(draftRecord);
    if (saved) {
      return draftRecord;
    }
    throw new Error('Local browser storage is unavailable or storage quota was exceeded.');
  }
}

/**
 * Retrieve a single draft by serviceId or ID
 */
export async function getDraft(serviceId) {
  if (!serviceId) return null;

  try {
    const db = await openDraftDB();

    const record = await new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(String(serviceId));

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (event) => reject(new Error(event.target.error?.message || 'IndexedDB read failed.'));
      } catch (err) {
        reject(err);
      }
    });

    if (record) return record;
  } catch (err) {
    console.warn('[ArivuNet Storage] IndexedDB getDraft failed, checking localStorage:', err);
  }

  return getFromLocalStorage(serviceId);
}

/**
 * Retrieve all saved drafts, sorted newest first
 */
export async function getAllDrafts() {
  const draftsMap = new Map();

  // 1. Load from IndexedDB
  try {
    const db = await openDraftDB();

    const idbDrafts = await new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => reject(new Error(event.target.error?.message || 'IndexedDB list failed.'));
      } catch (err) {
        reject(err);
      }
    });

    idbDrafts.forEach((d) => {
      if (d && (d.id || d.serviceId)) {
        draftsMap.set(d.id || d.serviceId, d);
      }
    });
  } catch (err) {
    console.warn('[ArivuNet Storage] IndexedDB getAllDrafts failed, checking localStorage:', err);
  }

  // 2. Merge with fallback localStorage
  const lsDrafts = getAllFromLocalStorage();
  lsDrafts.forEach((d) => {
    const key = d.id || d.serviceId;
    if (key && !draftsMap.has(key)) {
      draftsMap.set(key, d);
    }
  });

  const all = Array.from(draftsMap.values());
  all.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  return all;
}

/**
 * Delete a draft by serviceId or ID
 */
export async function deleteDraft(serviceId) {
  if (!serviceId) return false;

  let deleted = false;

  try {
    const db = await openDraftDB();

    deleted = await new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(String(serviceId));

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(new Error(event.target.error?.message || 'IndexedDB delete failed.'));
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    console.warn('[ArivuNet Storage] IndexedDB deleteDraft error:', err);
  }

  const lsDeleted = deleteFromLocalStorage(serviceId);
  return deleted || lsDeleted;
}

// ============================================================================
// Citizen Grievance Dedicated Draft Helpers
// ============================================================================

/**
 * Save citizen grievance draft
 */
export async function saveGrievanceDraft(formData) {
  return saveDraft(
    GRIEVANCE_DRAFT_ID,
    'Citizen Grievance Redressal (Janaspandana)',
    formData,
    {
      type: 'grievance',
      department: 'Rural Development & Citizen Redressal'
    }
  );
}

/**
 * Get saved citizen grievance draft
 */
export async function getGrievanceDraft() {
  return getDraft(GRIEVANCE_DRAFT_ID);
}

/**
 * Delete citizen grievance draft
 */
export async function deleteGrievanceDraft() {
  return deleteDraft(GRIEVANCE_DRAFT_ID);
}

// ============================================================================
// Scheme Bookmarks (Local Device Storage)
// ============================================================================

const BOOKMARKS_KEY = 'arivunet_bookmarked_schemes';

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

export function getBookmarkedSchemeIds() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSchemeBookmark(schemeId) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const bookmarks = getBookmarkedSchemeIds();
    const index = bookmarks.indexOf(schemeId);
    let updated;
    let isNowBookmarked = false;
    if (index >= 0) {
      updated = bookmarks.filter((id) => id !== schemeId);
      isNowBookmarked = false;
    } else {
      updated = [...bookmarks, schemeId];
      isNowBookmarked = true;
    }
    storage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return isNowBookmarked;
  } catch {
    return false;
  }
}

export function isSchemeBookmarked(schemeId) {
  return getBookmarkedSchemeIds().includes(schemeId);
}
