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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await api.login(email || (role === 'admin' ? 'admin@bangalorejobs.ai' : 'nithin@example.com'), password || (role === 'admin' ? 'AdminPass123!' : 'NithinPass123!'));
        onClose();
        window.location.reload();
      } else if (mode === 'signup') {
        await api.register(email, password, role);
        setMode('otp');
      } else if (mode === 'otp') {
        await api.login(email, password);
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
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
              <p className="text-xs text-slate-500 mt-1">We've sent a 6-digit OTP code to <strong className="text-slate-700">+91 98765 43210</strong></p>
            </div>

            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  readOnly
                  className="w-11 h-12 text-center font-bold text-lg border border-slate-300 rounded-xl bg-slate-50 focus:border-blue-600 outline-none"
                />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition"
            >
              Verify OTP & Continue
            </button>
          </div>
        ) : (
          /* Login / Signup Form */
          <div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login' ? 'Login to your account to continue' : 'Join thousands of job seekers in Bengaluru'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-6">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${role === 'candidate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${role === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Admin Panel
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4 font-medium border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-600 focus-within:bg-white transition">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    placeholder={role === 'admin' ? 'admin@bangalorejobs.ai' : 'nithin@example.com'}
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
                {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Send OTP')}
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
