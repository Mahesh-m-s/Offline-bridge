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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#172033]">
      {/* Top Accessible Government Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-[#087443] shadow-sm">
        {/* National / State Portal Top Bar */}
        <div className="bg-[#087443] text-white text-[11px] font-semibold py-1 px-4 sm:px-8 flex justify-between items-center">
          <span>Rural Digital Government Services Platform</span>
          <span className="hidden sm:inline">Offline-First Citizen Portal</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Government Logo & Title */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#087443] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                OB
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#172033] block leading-tight">
                  Offline<span className="text-[#087443]">Bridge</span>
                </span>
                <span className="text-xs font-semibold text-[#007C83] uppercase tracking-wider block">
                  Citizen Services
                </span>
              </div>
            </Link>

            {/* Badges: Connectivity & Sync Status */}
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
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-[#087443] text-white'
                        : 'text-[#172033] hover:bg-[#EBF7F0] hover:text-[#087443]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-[#D1D5DB]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#172033]">
                    <div className="w-8 h-8 rounded-full bg-[#EBF7F0] border border-[#087443] text-[#087443] flex items-center justify-center font-bold">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name || user.phone}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-[#475569] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#087443] text-white hover:bg-[#065f37] min-h-[40px] transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Citizen Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Header Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <ConnectivityBadge />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg text-[#172033] hover:bg-[#EBF7F0] border border-[#D1D5DB] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile sub-bar with sync badge */}
          <div className="flex md:hidden items-center justify-between py-2 border-t border-[#E5E7EB]">
            <SyncStatusBadge />
            {user ? (
              <span className="text-xs font-bold text-[#087443]">{user.name}</span>
            ) : (
              <Link to="/login" className="text-xs font-bold text-[#007C83] underline">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b-2 border-[#087443] px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-bold min-h-[48px] transition-colors ${
                    isActive
                      ? 'bg-[#087443] text-white'
                      : 'text-[#172033] hover:bg-[#EBF7F0]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-[#E5E7EB]">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626] min-h-[48px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user.name})</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold bg-[#087443] text-white min-h-[48px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Citizen Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (High contrast, large targets) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t-2 border-[#CBD5E1] lg:hidden px-2 py-1 flex justify-around items-center shadow-md">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#087443] font-extrabold'
                  : 'text-[#475569] hover:text-[#172033]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] mt-0.5 font-bold">{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Accessible Government Style Footer */}
      <footer className="border-t border-[#D1D5DB] bg-[#F1F5F9] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#475569]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-[#172033] text-sm">
              OfflineBridge — Rural Digital Government Services
            </p>
            <p className="mt-1 text-[#334155]">
              The National Institute of Engineering, Mysuru | Dept. of Information Science & Engineering
            </p>
            <p className="mt-0.5 text-[#64748B]">Batch D4 | Academic Year 2026–27</p>
          </div>
          <div className="text-[#334155]">
            <p><strong className="text-[#172033]">Guide:</strong> Dr. S Kuzhalvaimozhi</p>
            <p className="mt-1 text-[#475569]">
              Team: Abhishek G.P, Mahesh M.S, Rajesh N, S M Shrivathsa Nonavinakere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
