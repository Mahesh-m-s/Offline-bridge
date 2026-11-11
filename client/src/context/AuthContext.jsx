import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, getAuthToken, setAuthToken, clearAuthToken } from '../api/apiClient';
import { normalizeUser } from './userNormalizer';

const AuthContext = createContext(null);

export { AuthContext, normalizeUser };

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Guard against duplicate initialization under React StrictMode
  const hasInitializedRef = useRef(false);

  /**
   * Session Restoration Engine
   * Validates stored JWT against GET /api/auth/me on startup or reconnect
   */
  const restoreSession = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setCurrentUser(null);
      setIsInitializing(false);
      return { authenticated: false, reason: 'NO_TOKEN' };
    }

    try {
      const res = await apiClient.get('/api/auth/me', { token });

      if (res.success && res.data) {
        const normalized = normalizeUser(res.data);
        setCurrentUser(normalized);
        setIsBackendConnected(true);
        setIsInitializing(false);
        return { authenticated: true, user: normalized };
      }

      if (res.isAuthError || res.status === 401) {
        // Token has expired or signature is invalid -> purge cleanly
        clearAuthToken();
        setCurrentUser(null);
        setIsBackendConnected(true);
        setIsInitializing(false);
        return { authenticated: false, reason: 'TOKEN_INVALID' };
      }

      if (res.isNetworkError || res.isUnavailable) {
        // Network drop or server unreachable -> do NOT grant unauthenticated access
        setCurrentUser(null);
        setIsBackendConnected(false);
        setIsInitializing(false);
        return { authenticated: false, reason: 'BACKEND_UNAVAILABLE', error: res.error };
      }

      setCurrentUser(null);
      setIsInitializing(false);
      return { authenticated: false, reason: 'VERIFICATION_FAILED' };
    } catch (err) {
      setCurrentUser(null);
      setIsBackendConnected(false);
      setIsInitializing(false);
      return { authenticated: false, reason: 'EXCEPTION', error: err };
    }
  }, []);

  // Execute session restoration on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      restoreSession();
    }
  }, [restoreSession]);

  /**
   * Register Citizen User via POST /api/auth/register
   */
  const registerCitizen = useCallback(async ({ fullName, phone, password, villagePanchayat }) => {
    const res = await apiClient.post('/api/auth/register', {
      fullName: fullName?.trim(),
      phone: phone?.trim(),
      password,
      villagePanchayat: villagePanchayat?.trim() || null
    }, { auth: false });

    if (!res.success) {
      const err = new Error(res.error?.message || 'Registration failed.');
      err.code = res.error?.code || `HTTP_${res.status}`;
      err.status = res.status;
      err.details = res.error?.details || null;
      throw err;
    }

    if (res.raw?.token) {
      setAuthToken(res.raw.token);
    }

    const normalized = normalizeUser(res.data);
    setCurrentUser(normalized);
    setIsBackendConnected(true);
    return normalized;
  }, []);

  /**
   * Authenticate User via POST /api/auth/login
   * Supports Citizen, Official, and Admin credentials
   */
  const login = useCallback(async ({ identifier, password }) => {
    const res = await apiClient.post('/api/auth/login', {
      identifier: String(identifier).trim(),
      password
    }, { auth: false });

    if (!res.success) {
      const err = new Error(res.error?.message || 'Login failed. Please check your credentials.');
      err.code = res.error?.code || `HTTP_${res.status}`;
      err.status = res.status;
      throw err;
    }

    if (res.raw?.token) {
      setAuthToken(res.raw.token);
    }

    const normalized = normalizeUser(res.data);
    setCurrentUser(normalized);
    setIsBackendConnected(true);
    return normalized;
  }, []);

  /**
   * Logout User and purge JWT token from sessionStorage
   */
  const logout = useCallback(() => {
    clearAuthToken();
    setCurrentUser(null);
  }, []);

  // Role login helpers with verified fallback credentials
  const loginCitizen = useCallback(async (profile) => {
    const identifier = profile?.phone || profile?.identifier || '9845100003';
    const password = profile?.password || 'Citizen@123';
    return login({ identifier, password });
  }, [login]);

  const loginOfficial = useCallback(async ({ staffId, officerName, phone, password }) => {
    const identifier = phone || staffId || '9845100001';
    const pass = password || 'Official@123';
    return login({ identifier, password: pass });
  }, [login]);

  const loginAdmin = useCallback(async ({ username, phone, password }) => {
    const identifier = phone || username || '9845100000';
    const pass = password || 'Admin@123';
    return login({ identifier, password: pass });
  }, [login]);

  const value = {
    currentUser,
    userRole: currentUser?.role || null,
    isAuthenticated: Boolean(currentUser),
    isInitializing,
    isBackendConnected,
    registerCitizen,
    login,
    logout,
    restoreSession,
    isCitizen: currentUser?.role === 'citizen',
    isOfficial: currentUser?.role === 'official',
    isAdmin: currentUser?.role === 'admin',
    loginCitizen,
    loginOfficial,
    loginAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
