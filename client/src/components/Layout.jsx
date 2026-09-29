import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConnectivityBadge from './ConnectivityBadge';
import SyncStatusBadge from './SyncStatusBadge';
import {
  Home as HomeIcon,
  FileText,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Compass
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('offlinebridge_user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch (e) { setUser(null); }
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('offlinebridge_token');
    localStorage.removeItem('offlinebridge_user');
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { path: '/',                label: 'Home',            icon: HomeIcon },
    { path: '/services',        label: 'Services',         icon: FileText },
    { path: '/eligibility',     label: 'Eligibility',      icon: Sparkles },
    { path: '/tracker',         label: 'My Applications',  icon: ClipboardList },
    { path: '/grievance',       label: 'Lodge Grievance',  icon: AlertTriangle },
    { path: '/grievances/track',label: 'Track Grievance',  icon: Compass },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)', color: 'var(--navy-900)' }}>
      {/* ── Premium Sticky Header ─────────────────────── */}
      <header className="ob-header" style={{ boxShadow: scrolled ? '0 4px 20px rgba(16,42,67,0.08)' : undefined }}>
        <div className="ob-header__inner">

          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}>
            {/* C3 Logo Mark */}
            <div className="ob-logo-mark">
              <div className="ob-logo-mark__bar" style={{ background: 'var(--cyan-500)' }} />
              <div className="ob-logo-mark__bar" style={{ background: 'var(--cyan-400)', width: '65%', alignSelf: 'flex-start' }} />
              <div className="ob-logo-mark__bar" style={{ background: 'var(--cyan-700)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1875rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em' }}>
                Offline&nbsp;<span style={{ color: 'var(--cyan-500)' }}>Bridge</span>
              </span>
              <span style={{ fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--navy-300)', textTransform: 'uppercase', marginTop: '3px' }}>
                Rural Digital Services
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '0.125rem' }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`ob-nav-link ${isActive ? 'ob-nav-link--active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Status + Auth */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
            <ConnectivityBadge />

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-default)' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'var(--cyan-50)', border: '2px solid var(--border-cyan)',
                  color: 'var(--cyan-700)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem',
                  flexShrink: 0
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy-900)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.phone}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  style={{
                    padding: '0.375rem', borderRadius: '8px', color: 'var(--navy-300)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', transition: 'color 0.12s ease, background 0.12s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--red-500)'; e.currentTarget.style.background = 'var(--red-50)'; }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--navy-300)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="ob-btn-login">
                <User style={{ width: '15px', height: '15px' }} />
                <span>Citizen Login</span>
              </Link>
            )}
          </div>

          {/* Mobile: Status + Hamburger */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <ConnectivityBadge compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                padding: '0.5rem', borderRadius: '10px', background: mobileMenuOpen ? 'var(--cyan-50)' : 'transparent',
                border: '1.5px solid var(--border-default)', color: 'var(--navy-900)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.12s ease'
              }}
            >
              {mobileMenuOpen
                ? <X style={{ width: '22px', height: '22px' }} />
                : <Menu style={{ width: '22px', height: '22px' }} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden animate-slide-down" style={{
            background: '#FFFFFF', borderTop: '1px solid var(--border-default)',
            padding: '0.75rem 1rem 1rem', boxShadow: '0 8px 24px rgba(16,42,67,0.1)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '10px', textDecoration: 'none',
                      fontSize: '0.9rem', fontWeight: isActive ? 700 : 600,
                      color: isActive ? 'var(--cyan-700)' : 'var(--navy-700)',
                      background: isActive ? 'var(--cyan-50)' : 'transparent',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <Icon style={{ width: '17px', height: '17px', flexShrink: 0, color: isActive ? 'var(--cyan-500)' : 'var(--navy-300)' }} />
                    <span>{link.label}</span>
                    {isActive && (
                      <span style={{
                        marginLeft: 'auto', width: '6px', height: '6px',
                        borderRadius: '50%', background: 'var(--cyan-500)', flexShrink: 0
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '0.75rem', borderRadius: '10px',
                    background: 'var(--red-50)', color: 'var(--red-500)',
                    border: '1.5px solid #FCA5A5', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer'
                  }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  <span>Sign Out ({user.name})</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '0.75rem', borderRadius: '10px',
                    background: 'var(--cyan-500)', color: '#FFFFFF',
                    textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
                    boxShadow: '0 2px 8px rgba(0,175,193,0.25)'
                  }}
                >
                  <User style={{ width: '16px', height: '16px' }} />
                  <span>Citizen Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ──────────────────────────────── */}
      <main style={{ flex: 1, paddingBottom: '5rem' }}>
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ──────────────────── */}
      <nav className="ob-bottom-nav lg:hidden">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`ob-bottom-nav__item ${isActive ? 'ob-bottom-nav__item--active' : ''}`}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span>{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="ob-footer" style={{ paddingBottom: '1.5rem' }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          alignItems: 'center', textAlign: 'center'
        }} className="md:flex-row md:items-center md:text-left" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy-900)', fontSize: '0.875rem' }}>
                Offline<span style={{ color: 'var(--cyan-500)' }}>Bridge</span>
              </span>
              <span style={{ color: 'var(--navy-200)', fontSize: '0.875rem' }}>·</span>
              <span style={{ fontWeight: 600, color: 'var(--cyan-700)', fontSize: '0.8125rem' }}>
                Rural Digital Services Platform
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--navy-300)' }}>
              The National Institute of Engineering, Mysuru · Department of ISE · Batch D4
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--navy-400)', textAlign: 'right' }}>
            <p><strong style={{ color: 'var(--navy-700)' }}>Guide:</strong> Dr. S Kuzhalvaimozhi</p>
            <p style={{ marginTop: '2px', color: 'var(--navy-300)' }}>
              Abhishek G.P · Mahesh M.S · Rajesh N · S M Shrivathsa Nonavinakere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
