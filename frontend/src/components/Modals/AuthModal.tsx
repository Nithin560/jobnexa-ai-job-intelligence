import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, KeyRound, Smartphone, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [role, setRole] = useState<'candidate' | 'admin'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['2', '6', '4', '9', '1', '7']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const loginEmail = email.trim() || (role === 'admin' ? 'nithinvandana26@gmail.com' : 'nithin@example.com');
        const loginPassword = password.trim() || (role === 'admin' ? '22H71A0560pandu@' : 'NithinPass123!');
        await api.login(loginEmail, loginPassword);
        onClose();
        if (role === 'admin') {
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
        await api.verifyRegister({ email: email.trim(), otp: code, password, role });
        onClose();
        window.location.reload();
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
    if (selectedRole === 'candidate') {
      setEmail('nithin@example.com');
      setPassword('NithinPass123!');
    } else {
      setEmail('nithinvandana26@gmail.com');
      setPassword('22H71A0560pandu@');
    }
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
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Verify Your Account</h3>
              <p className="text-xs text-slate-500 mt-1">We've sent a 6-digit OTP code to <strong className="text-slate-800">{email || 'your email'}</strong></p>
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

            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  className="w-11 h-12 text-center font-bold text-lg border-2 border-slate-200 rounded-xl bg-slate-50 focus:border-blue-600 focus:bg-white outline-none transition"
                />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Continue'}
            </button>
          </div>

        ) : (
          /* Login / Signup Form */
          <div>
            <div className="text-center mb-5">
              <h3 className="text-2xl font-bold text-slate-900">
                {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login' ? 'Select your role or click 1-Click login below' : 'Join thousands of job seekers in Bengaluru'}
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
                  <User className="w-4 h-4" /> 1-Click Candidate
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
                <User className="w-3.5 h-3.5" /> Job Seeker
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${role === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin Panel
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4 font-medium border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-600 focus-within:bg-white transition">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    placeholder={role === 'admin' ? 'nithinvandana26@gmail.com' : 'nithin@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-sm w-full outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-200 transition mt-2"
              >
                {loading ? 'Processing...' : (mode === 'login' ? `Login as ${role === 'admin' ? 'Admin' : 'Job Seeker'}` : 'Send OTP')}
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
