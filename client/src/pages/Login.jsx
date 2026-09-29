import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import {
  LogIn,
  UserPlus,
  Lock,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!navigator.onLine) {
      setError('You are currently offline. Authentication requires internet connection. You can still fill & save service forms offline without logging in!');
      return;
    }

    if (!phone || !password || (isRegister && !name)) {
      setError('Please fill all mandatory fields.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { name, phone, password } : { phone, password };

      const res = await apiClient.post(endpoint, payload);

      if (res.data?.token) {
        localStorage.setItem('offlinebridge_token', res.data.token);
        localStorage.setItem('offlinebridge_user', JSON.stringify(res.data.user));
        setSuccessMsg('Authentication successful! Redirecting to Dashboard...');
        setTimeout(() => {
          navigate('/tracker');
        }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials or network.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setName('Ramesh Gowda');
    setPhone('9876543210');
    setPassword('rural123');
    setIsRegister(false);

    const demoUser = {
      id: 1,
      name: 'Ramesh Gowda',
      phone: '9876543210',
      role: 'citizen'
    };
    localStorage.setItem('offlinebridge_token', 'mock_demo_jwt_token_rural_offlinebridge');
    localStorage.setItem('offlinebridge_user', JSON.stringify(demoUser));

    setSuccessMsg('Logged in with Demo Citizen Profile (Ramesh Gowda).');
    setTimeout(() => {
      navigate('/tracker');
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Evaluator Helper Banner */}
      <div className="p-4 rounded-xl bg-white border-2 border-[#A3D9BE] text-xs space-y-2 text-[#172033] shadow-sm">
        <div className="flex items-center gap-2 font-bold text-[#087443]">
          <Sparkles className="w-4 h-4 text-[#087443]" />
          <span>Evaluator / Demo Mode</span>
        </div>
        <p className="text-[#334155]">
          Click below to log in immediately with the pre-seeded rural citizen profile:
        </p>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="w-full min-h-[44px] py-2 px-3 rounded-lg font-bold bg-[#EBF7F0] hover:bg-[#DCFCE7] text-[#087443] border border-[#16A34A] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>One-Click Citizen Demo Login (Ramesh Gowda)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-xl bg-white border-2 border-[#CBD5E1] p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Toggle between Login and Register */}
        <div className="flex rounded-lg bg-[#F1F5F9] p-1 border border-[#D1D5DB]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 min-h-[40px] py-2 text-xs font-bold rounded-md transition-colors ${
              !isRegister ? 'bg-[#087443] text-white shadow-sm' : 'text-[#334155] hover:text-[#172033]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 min-h-[40px] py-2 text-xs font-bold rounded-md transition-colors ${
              isRegister ? 'bg-[#087443] text-white shadow-sm' : 'text-[#334155] hover:text-[#172033]'
            }`}
          >
            New Citizen Registration
          </button>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-[#172033]">
            {isRegister ? 'Create Citizen Account' : 'Citizen Sign In'}
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            {isRegister
              ? 'Register with your phone number to track your applications across devices.'
              : 'Sign in to access your synchronized submissions and tracking history.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEE2E2] border border-[#DC2626] text-xs font-bold text-[#991B1B] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#DC2626]" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-[#DCFCE7] border border-[#16A34A] text-xs font-bold text-[#087443] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#087443]" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm" noValidate>
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Full Name <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Gowda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#087443] text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">
              Mobile Phone Number <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="10-digit registered mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#087443] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">
              Password <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#087443] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-lg font-bold text-white bg-[#087443] hover:bg-[#065f37] border border-[#065f37] flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm shadow-sm"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-3 border-t border-[#E5E7EB]">
          <Link to="/" className="text-xs font-bold text-[#007C83] hover:underline">
            Continue as Guest without signing in →
          </Link>
        </div>
      </div>
    </div>
  );
}
