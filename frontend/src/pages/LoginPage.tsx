import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronLeft,
  Shield,
  User,
  AlertCircle
} from 'lucide-react';
import { api, isUserAuthenticated } from '../api/client';
import { TopLoadingBar } from '../components/TopLoadingBar';
import { useAlertModal } from '../components/Modals/AlertModal';
import { Compass } from 'lucide-react';
import vidhanaSoudhaBg from '../assets/vidhana_soudha_bg.jpg';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showComingSoonPlacesToVisitModal } = useAlertModal();

  useEffect(() => {
    // Reliably show Places to Visit in Bengaluru popup modal whenever Login Page loads
    const timer = setTimeout(() => {
      showComingSoonPlacesToVisitModal('guest');
    }, 350);
    return () => clearTimeout(timer);
  }, [showComingSoonPlacesToVisitModal]);

  useEffect(() => {
    if (isUserAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Role: Candidate vs Admin Portal
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'candidate';
  const [portalRole, setPortalRole] = useState<'candidate' | 'admin'>(initialRole);

  // Auth Method: Password vs Email OTP vs Two-Factor (Password + OTP)
  const [authMethod, setAuthMethod] = useState<'password' | 'otp' | 'two_factor'>('password');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow states
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // When changing portal role, reset input fields
  const handleRoleChange = (newRole: 'candidate' | 'admin') => {
    setPortalRole(newRole);
    setError(null);
    setSuccessMsg(null);
    setOtpStep('request');
    setOtpDigits(['', '', '', '', '', '']);
    setEmail('');
    setPassword('');
    if (newRole !== 'admin' && authMethod === 'two_factor') {
      setAuthMethod('password');
    }
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email.trim(), password);
      if (data.role === 'admin') {
        sessionStorage.setItem('trigger_admin_places_popup', 'true');
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Requesting OTP (Email OTP flow)
  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Please enter your email address to receive a verification code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.sendOTP(email.trim(), 'login');
      setOtpStep('verify');
      setCountdown(60);
      setSuccessMsg(res.message);
      if (res.dev_otp) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email.trim(), otp: res.dev_otp })
          });
        } catch (e) {
          console.error('Email dispatch error:', e);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please ensure this email is registered.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Two-Factor Step 1: Validate Password, then send OTP
  const handleTwoFactorValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your admin email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Step 1: Check password credentials
      await api.login(email.trim(), password);
      // Step 2: Request real OTP for second factor
      const res = await api.sendOTP(email.trim(), 'login');
      setOtpStep('verify');
      setCountdown(60);
      setSuccessMsg('Step 1 verified! 6-digit OTP has been dispatched to ' + email.trim());
      if (res.dev_otp) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email.trim(), otp: res.dev_otp })
          });
        } catch (e) {
          console.error('Email dispatch error:', e);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      const nextInput = document.getElementById(`otp-input-${nextIdx}`);
      nextInput?.focus();
      return;
    }

    const digit = value.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle Verify OTP Login
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyOTPLogin(email.trim(), code);
      if (data.role === 'admin') {
        sessionStorage.setItem('trigger_admin_places_popup', 'true');
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick One-Click Demo Logins
  const handleQuickLogin = async (targetRole: 'candidate' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      if (targetRole === 'admin') {
        sessionStorage.setItem('trigger_admin_places_popup', 'true');
        await api.quickLoginAsAdmin();
        navigate('/admin', { replace: true });
      } else {
        await api.quickLoginAsCandidate();
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError('Quick login failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1 min-h-[calc(100vh-64px)] w-full flex items-center justify-center py-6 sm:py-10 px-3 sm:px-6 overflow-x-hidden">
      <TopLoadingBar isLoading={loading} />
      {/* Original Crisp Landmark Background Image (Sharp & Clear, No Blur on Image) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${vidhanaSoudhaBg})`,
        }}
      />

      {/* Subtle atmospheric tint overlay to preserve true daylight brightness */}
      <div className="absolute inset-0 bg-slate-900/15" />

      {/* Login Card with Frosted Glass Blur Background */}
      <div className="relative z-10 max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition">
            <ChevronLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <button
            type="button"
            onClick={() => showComingSoonPlacesToVisitModal(portalRole)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition shadow-2xs cursor-pointer group"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
            <span>Weekend Escapes</span>
            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-black uppercase">Soon</span>
          </button>
        </div>

        {/* Role Portal Selector */}
        <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-bold">
          <button
            type="button"
            onClick={() => handleRoleChange('candidate')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              portalRole === 'candidate'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>User</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              portalRole === 'admin'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-200" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          {portalRole === 'admin' ? (
            <>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>JobNexa Security Command Center</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Sign-In</h1>
              <p className="text-xs text-slate-500 font-medium">
                Log in via Email OTP, Password, or Two-Factor Authentication
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>JobNexa Intelligence</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-xs text-slate-500 font-medium">
                Sign in to access verified Bengaluru tech opportunities
              </p>
            </>
          )}
        </div>

        {/* Method Toggle: Password vs OTP vs 2FA for Admin */}
        <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMethod('password'); setError(null); setOtpStep('request'); }}
            className={`flex-1 py-2 rounded-xl transition ${authMethod === 'password' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('otp'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition ${authMethod === 'otp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Email OTP
          </button>
          {portalRole === 'admin' && (
            <button
              type="button"
              onClick={() => { setAuthMethod('two_factor'); setError(null); setOtpStep('request'); }}
              className={`flex-1 py-2 rounded-xl transition ${authMethod === 'two_factor' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Verify with Password and OTP"
            >
              Password + OTP
            </button>
          )}
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}



        {/* METHOD 1: Password Login */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {portalRole === 'admin' ? 'Admin Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  autoComplete="off"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 ${
                portalRole === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {loading ? 'Authenticating...' : portalRole === 'admin' ? 'Sign In as Admin' : 'Sign In as User'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* METHOD 2: Email OTP Login */}
        {authMethod === 'otp' && (
          <div className="space-y-4">
            {otpStep === 'request' ? (
              <form onSubmit={handleRequestOTP} autoComplete="off" className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {portalRole === 'admin' ? 'Admin Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      autoComplete="off"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    A real 6-digit verification code will be sent to this email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className={`w-full py-3 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 ${
                    portalRole === 'admin'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  }`}
                >
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                  <KeyRound className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-600">
                    Enter the 6-digit verification code sent to:
                  </p>
                  <p className="text-xs font-bold text-slate-800">{email}</p>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-12 text-center text-xl font-bold bg-slate-50 border rounded-xl outline-none transition focus:bg-white ${
                        portalRole === 'admin'
                          ? 'border-slate-200 focus:border-amber-600'
                          : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Resend Timer */}
                <div className="text-center text-xs text-slate-500">
                  {countdown > 0 ? (
                    <span>Resend code in <strong className="text-slate-700 font-bold">{countdown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestOTP()}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className={`w-full py-3 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 ${
                    portalRole === 'admin'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  }`}
                >
                  {loading ? 'Verifying...' : portalRole === 'admin' ? 'Verify & Enter Admin Console' : 'Verify & Log In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* METHOD 3: Two-Factor (Password + OTP) for Admin */}
        {portalRole === 'admin' && authMethod === 'two_factor' && (
          <div className="space-y-4">
            {otpStep === 'request' ? (
              <form onSubmit={handleTwoFactorValidate} autoComplete="off" className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <strong>High-Security 2FA Mode:</strong> Enter your administrator credentials. Upon validation, a real 6-digit OTP will be dispatched to your email for final authentication.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      autoComplete="off"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-amber-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="off"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-amber-600 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-amber-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Validating Password...' : 'Verify Password & Send OTP'}
                  <KeyRound className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Password Verified</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Enter the 6-digit verification code sent to:
                  </p>
                  <p className="text-xs font-bold text-slate-800">{email}</p>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-xl font-bold bg-slate-50 border border-slate-200 focus:border-amber-600 rounded-xl outline-none transition focus:bg-white"
                    />
                  ))}
                </div>

                {/* Resend Timer */}
                <div className="text-center text-xs text-slate-500">
                  {countdown > 0 ? (
                    <span>Resend code in <strong className="text-slate-700 font-bold">{countdown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestOTP()}
                      className="text-amber-700 font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-amber-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Finalize 2FA & Enter Admin'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quick Demo Logins Box */}
        <div className="border-t border-slate-100 pt-5 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Fast Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('candidate')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
            >
              User Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 transition flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              1-Click Admin
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};
