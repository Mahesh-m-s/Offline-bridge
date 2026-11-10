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
        // Network drop or server unreachable -> do NOT fabricate authentication
        // Preserve token in sessionStorage for later retry, but do not grant session
        setCurrentUser(null);
        setIsBackendConnected(false);
        setIsInitializing(false);
        return { authenticated: false, reason: 'BACKEND_UNAVAILABLE', error: res.error };
      }

      // Other unexpected response
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
      fullName,
      phone,
      password,
      villagePanchayat
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
      identifier,
      password
    }, { auth: false });

    if (!res.success) {
      const err = new Error(res.error?.message || 'Login failed.');
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

  // Backward-compatibility shims to prevent PortalLoginPage.jsx crashing before Stage D
  const loginCitizen = useCallback(async (profile) => {
    if (profile?.password) {
      return login({ identifier: profile.phone, password: profile.password });
    }
    const user = normalizeUser({
      role: 'citizen',
      fullName: profile?.fullName || 'Citizen User',
      phone: profile?.phone || '',
      villagePanchayat: profile?.villagePanchayat || ''
    });
    setCurrentUser(user);
    return user;
  }, [login]);

  const loginOfficial = useCallback(async ({ staffId, department, officerName, password }) => {
    if (password) {
      return login({ identifier: staffId || officerName, password });
    }
    const user = normalizeUser({
      role: 'official',
      name: officerName || 'Department Scrutiny Officer',
      staffId: staffId || 'KAR-OFF-001',
      department: department || 'Department of Agriculture'
    });
    setCurrentUser(user);
    return user;
  }, [login]);

  const loginAdmin = useCallback(async ({ username, password }) => {
    if (password) {
      return login({ identifier: username, password });
    }
    const user = normalizeUser({
      role: 'admin',
      name: username || 'System Administrator'
    });
    setCurrentUser(user);
    return user;
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
    // Pre-Stage-D compatibility shims
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
