import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

/**
 * ProtectedRoute: Enforces client-side role guards for portal routes.
 * 
 * Note: As documented in ArivuNet security architecture, client-side route guards
 * provide navigation structure, not a cryptographic security boundary. Full data
 * confidentiality and privilege separation will be enforced by server-side JWT session
 * validation once backend authentication endpoints are deployed.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Determine suggested login path based on target
    let targetLogin = '/login';
    if (allowedRoles.includes('official')) {
      targetLogin = '/login/official';
    } else if (allowedRoles.includes('admin')) {
      targetLogin = '/login/admin';
    } else if (allowedRoles.includes('citizen')) {
      targetLogin = '/login/user';
    }

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // If user role is not in the allowed roles list, display an explicit 403 Access Denied view
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return (
      <div style={{
        maxWidth: '680px',
        margin: '60px auto',
        padding: '32px 24px',
        background: '#ffffff',
        border: '1px solid #fee2e2',
        borderLeft: '5px solid #dc2626',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <ShieldAlert size={36} color="#dc2626" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
              Access Restricted — Role Boundary
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Your current active session does not have authorization for this portal area.
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '0.88rem',
          lineHeight: 1.6,
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Active Session Role:</strong> <span style={{ textTransform: 'capitalize', color: '#1e293b' }}>{currentUser.role}</span> ({currentUser.name})
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Required Role(s):</strong> {allowedRoles.map(r => r.toUpperCase()).join(' or ')}
          </p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
            Under ArivuNet role governance, Department Scrutiny and Administrative consoles are strictly partitioned from Citizen access.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to={currentUser.role === 'citizen' ? '/portal/citizen' : currentUser.role === 'official' ? '/portal/official' : '/portal/admin'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: 'var(--gov-blue-primary, #0284c7)',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Return to Your Portal
          </Link>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: '1px solid #cbd5e1'
            }}
          >
            <LogIn size={16} /> Switch Account / Role
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
