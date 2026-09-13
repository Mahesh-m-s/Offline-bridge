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

  useEffect(() => {
    const storedUser = localStorage.getItem('offlinebridge_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('offlinebridge_token');
    localStorage.removeItem('offlinebridge_user');
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/services', label: 'Services', icon: FileText },
    { path: '/eligibility', label: 'Eligibility', icon: Sparkles },
    { path: '/tracker', label: 'My Applications', icon: ClipboardList },
    { path: '/grievance', label: 'Lodge Grievance', icon: AlertTriangle },
    { path: '/grievances/track', label: 'Track Grievance', icon: Compass }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-0.5 shadow-lg shadow-teal-900/30 group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                    OB
                  </span>
                </div>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Offline<span className="text-teal-400">Bridge</span>
                </span>
                <span className="hidden sm:block text-[10px] tracking-wider uppercase text-emerald-400/90 font-medium">
                  Rural Digital Services
                </span>
              </div>
            </Link>

            {/* Badges (Online/Offline + Sync Status) */}
            <div className="hidden md:flex items-center gap-3">
              <ConnectivityBadge />
              <SyncStatusBadge />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth section */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="w-7 h-7 rounded-full bg-teal-900/60 border border-teal-700/50 flex items-center justify-center text-teal-300 font-semibold">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="font-medium max-w-[120px] truncate">{user.name || user.phone}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-400" />
                  <span>Citizen Login</span>
                </Link>
              )}
            </div>

            {/* Mobile menu hamburger button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ConnectivityBadge />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile sub-header with SyncStatusBadge */}
          <div className="flex md:hidden items-center justify-between pb-3 pt-1 border-t border-slate-900">
            <SyncStatusBadge />
            {user ? (
              <span className="text-xs text-teal-300 font-medium">Hello, {user.name}</span>
            ) : (
              <Link to="/login" className="text-xs text-teal-400 underline">Login</Link>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 border-b border-slate-800 px-4 py-4 space-y-2 backdrop-blur-lg">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-950/90 text-teal-300 border border-teal-800/60'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user.name})</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 text-white"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Citizen Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 pb-20 lg:pb-12">
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar for Rural Smartphone Usability */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 lg:hidden px-2 py-1.5 flex justify-around items-center">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-lg transition-colors ${
                isActive ? 'text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight">{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-semibold text-slate-400">OfflineBridge — Rural Digital Government Services (PWA)</p>
            <p className="mt-0.5">The National Institute of Engineering, Mysuru | Dept. of Information Science & Engineering</p>
            <p className="mt-0.5 text-slate-500">Academic Year 2026–27 | Batch D4</p>
          </div>
          <div className="text-slate-400">
            <p><span className="text-slate-500">Guide:</span> Dr. S Kuzhalvaimozhi</p>
            <p className="mt-0.5 text-slate-500">
              Team: Abhishek G.P, Mahesh M.S, Rajesh N, S M Shrivathsa Nonavinakere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
