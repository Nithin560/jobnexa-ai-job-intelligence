import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, KeyRound, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [role, setRole] = useState<'candidate' | 'admin'>('candidate');
  const [adminAuthType, setAdminAuthType] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const loginEmail = email.trim() || (role === 'admin' ? 'jobnexaaiplatform@gmail.com' : 'nithin@example.com');
        
        if (role === 'admin' && adminAuthType === 'otp') {
          // Admin OTP Login flow
          const res = await api.sendOTP(loginEmail, 'login');
          if (res.dev_otp) setDevOtpHint(res.dev_otp);
          setEmail(loginEmail);
          setMode('otp');
          return;
        }

        // Standard Password Login
        const loginPassword = password.trim();
        const data = await api.login(loginEmail, loginPassword);
        onClose();
        if (data.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      } else if (mode === 'signup') {
        const res = await api.sendOTP(email.trim(), 'register');
        if (res.dev_otp) setDevOtpHint(res.dev_otp);
        setMode('otp');
      } else if (mode === 'otp') {
        const code = otp.join('');
        if (role === 'admin' && adminAuthType === 'otp') {
          // Verify Admin OTP Login
          const data = await api.verifyOTPLogin(email.trim(), code);
          onClose();
          if (data.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.reload();
          }
        } else {
          // Verify Registration OTP
          await api.verifyRegister({ email: email.trim(), otp: code, password, role });
          onClose();
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (idx: number, val: string) => {
    const digit = val.slice(-1).replace(/\D/g, '');
    const nextOtp = [...otp];
    nextOtp[idx] = digit;
    setOtp(nextOtp);
  };

  const handleSelectRole = (selectedRole: 'candidate' | 'admin') => {
    setRole(selectedRole);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleQuickLogin = async (targetRole: 'candidate' | 'admin') => {
    setLoading(true);
    setError('');
    try {
      if (targetRole === 'admin') {
        await api.quickLoginAsAdmin();
        onClose();
        window.location.href = '/admin';
      } else {
        await api.quickLoginAsCandidate();
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      setError('Quick login failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition">
          <X className="w-5 h-5" />
        </button>

        {mode === 'otp' ? (
          /* OTP Verification Form */
          <div className="text-center space-y-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
              role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {role === 'admin' ? 'Verify Admin Security Code' : 'Verify Your Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">We've dispatched a 6-digit OTP code to <strong className="text-slate-800">{email || 'your email'}</strong></p>
            </div>

            {devOtpHint && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                <span>Test OTP Code: <strong>{devOtpHint}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(devOtpHint.split(''))}
                  className="font-bold text-blue-600 underline text-xs"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-medium border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    className="w-11 h-12 text-center text-xl font-bold bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl outline-none transition focus:bg-white"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className={`w-full py-3.5 text-white font-bold rounded-2xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                  role === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {loading ? 'Verifying...' : role === 'admin' ? 'Verify & Enter Admin Console' : 'Verify & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
                role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                <span>{role === 'admin' ? 'Administrator Security Portal' : 'Email OTP Authentication'}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {mode === 'login' ? (role === 'admin' ? 'Admin Sign In' : 'Welcome to JobNexa') : 'Create Your Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {role === 'admin' ? 'Sign in using Password or Email OTP' : 'Discover genuine verified jobs across Bengaluru'}
              </p>
            </div>

            {/* Quick 1-Click Login Shortcuts */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleQuickLogin('candidate')}
                className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                  <User className="w-4 h-4" /> 1-Click User
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Explore jobs & matching</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Shield className="w-4 h-4" /> 1-Click Admin
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Live scanner & metrics</div>
              </button>
            </div>

            <div className="flex items-center my-4 text-xs text-slate-400">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 font-semibold uppercase text-[10px]">Or sign in with role</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-4">
              <button
                type="button"
                onClick={() => handleSelectRole('candidate')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${role === 'candidate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <User className="w-3.5 h-3.5" /> User
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${role === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin Panel
              </button>
            </div>

            {/* If Admin Role: Toggle between Password and OTP */}
            {role === 'admin' && mode === 'login' && (
              <div className="bg-amber-50/70 border border-amber-200/60 p-1 rounded-xl flex gap-1 mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAdminAuthType('password')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    adminAuthType === 'password'
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  Password Sign-In
                </button>
                <button
                  type="button"
                  onClick={() => setAdminAuthType('otp')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    adminAuthType === 'otp'
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  Email OTP Sign-In
                </button>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4 font-medium border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {role === 'admin' ? 'Administrator Email' : 'Email Address'}
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-600 focus-within:bg-white transition">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    placeholder={role === 'admin' ? 'jobnexaaiplatform@gmail.com' : 'nithin@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-sm w-full outline-none text-slate-800"
                  />
                </div>
              </div>

              {!(role === 'admin' && adminAuthType === 'otp') && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-600 focus-within:bg-white transition">
                    <Lock className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent text-sm w-full outline-none text-slate-800"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold rounded-2xl shadow-md transition mt-2 ${
                  role === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {loading
                  ? 'Processing...'
                  : role === 'admin'
                  ? adminAuthType === 'otp'
                    ? 'Send Admin OTP to Email'
                    : 'Login as Admin'
                  : mode === 'login'
                  ? 'Login as User'
                  : 'Send OTP'}
              </button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-500">
              {mode === 'login' ? (
                <>Don't have an account? <button onClick={() => setMode('signup')} className="font-bold text-blue-600 hover:underline">Sign Up</button></>
              ) : (
                <>Already have an account? <button onClick={() => setMode('login')} className="font-bold text-blue-600 hover:underline">Login</button></>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
