import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft, Eye, EyeOff, Briefcase, Building2, GraduationCap } from 'lucide-react';
import { api, isUserAuthenticated } from '../api/client';
import { TopLoadingBar } from '../components/TopLoadingBar';
import { useAlertModal } from '../components/Modals/AlertModal';
import { Compass } from 'lucide-react';
import vidhanaSoudhaBg from '../assets/vidhana_soudha_bg.jpg';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const { showComingSoonPlacesToVisitModal } = useAlertModal();

  React.useEffect(() => {
    if (!sessionStorage.getItem('seen_places_notice_register')) {
      sessionStorage.setItem('seen_places_notice_register', 'true');
      const timer = setTimeout(() => {
        showComingSoonPlacesToVisitModal('guest');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showComingSoonPlacesToVisitModal]);

  React.useEffect(() => {
    if (isUserAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Form Fields
  const [role, setRole] = useState<'candidate' | 'admin'>('candidate');
  const [experienceTier, setExperienceTier] = useState<'fresher' | 'experienced'>('fresher');
  const [yearsExperience, setYearsExperience] = useState<number>(2);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Fields
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Submit details and send OTP
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.sendOTP(email.trim(), 'register');
      setStep('otp');
      setCountdown(60);
      setSuccessMsg(res.message);
      if (res.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to dispatch verification code. Please check email address.');
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
      const nextInput = document.getElementById(`reg-otp-${nextIdx}`);
      nextInput?.focus();
      return;
    }

    const digit = value.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 2: Verify OTP and finalize registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyRegister({
        email: email.trim(),
        otp: code,
        password: password,
        full_name: fullName.trim() || undefined,
        role: role,
        experience_tier: role === 'candidate' ? experienceTier : undefined,
        years_experience: role === 'candidate' ? (experienceTier === 'fresher' ? 0 : yearsExperience) : undefined,
      });
      if (role === 'candidate') {
        sessionStorage.setItem('user_experience_tier', experienceTier);
        localStorage.setItem('user_experience_tier', experienceTier);
      }
      if (data.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed. Please ensure the code is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.sendOTP(email.trim(), 'register');
      setCountdown(60);
      setSuccessMsg('A new verification code has been dispatched.');
      if (res.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1 min-h-[calc(100vh-64px)] w-full flex items-center justify-center py-10 px-4 sm:px-6 overflow-hidden">
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

      {/* Registration Card with Frosted Glass Blur Background */}
      <div className="relative z-10 max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition">
            <ChevronLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <button
            type="button"
            onClick={() => showComingSoonPlacesToVisitModal('guest')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition shadow-2xs cursor-pointer group"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Weekend Escapes</span>
            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-black uppercase">Soon</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>JobNexa Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 'details' ? 'Create Your Account' : 'Verify Email Address'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {step === 'details' 
              ? 'Join Bengaluru’s real-time AI job intelligence network' 
              : `We sent a 6-digit verification code to ${email}`}
          </p>
        </div>

        {/* 2-Step Progress Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold">
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <span>1</span> Account Details
          </span>
          <span className="text-slate-300">→</span>
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${step === 'otp' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <span>2</span> Email OTP Verification
          </span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dev OTP Helper Notification */}
        {devOtpHint && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-2xl text-xs flex items-center justify-between">
            <div>
              <span className="font-bold">Test OTP Code: </span>
              <strong className="font-mono text-sm tracking-widest text-blue-900">{devOtpHint}</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                const digits = devOtpHint.split('');
                setOtpDigits(digits);
              }}
              className="text-xs font-bold text-blue-600 hover:underline px-2 py-1 bg-white rounded-lg border border-blue-200"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Step 1: Details Form */}
        {step === 'details' && (
          <form onSubmit={handleProceedToOTP} className="space-y-4">
            
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">I am registering as:</label>
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => setRole('candidate')}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${
                    role === 'candidate' ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">User</div>
                    <div className="text-[10px] text-slate-400 font-medium">Professional / Candidate</div>
                  </div>
                </div>

                <div
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${
                    role === 'admin' ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-800 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Admin</div>
                    <div className="text-[10px] text-slate-400 font-medium">Recruiter / Employer</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Level Selector for Normal User */}
            {role === 'candidate' && (
              <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Experience Level:
                  </label>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {experienceTier === 'fresher' ? '0 - 1 Years' : `${yearsExperience}+ Years`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setExperienceTier('fresher')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      experienceTier === 'fresher'
                        ? 'border-blue-600 bg-white text-blue-900 ring-2 ring-blue-100 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="text-xs font-bold">Fresher</div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">
                      0 - 1 Years (Entry-level & fresh graduates)
                    </div>
                  </div>

                  <div
                    onClick={() => setExperienceTier('experienced')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      experienceTier === 'experienced'
                        ? 'border-indigo-600 bg-white text-indigo-900 ring-2 ring-indigo-100 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="text-xs font-bold">Experienced</div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">
                      1+ Years (Industry professionals)
                    </div>
                  </div>
                </div>

                {experienceTier === 'experienced' && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 mt-2 text-xs">
                    <span className="text-slate-600 font-medium">Years of Experience:</span>
                    <select
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-xs outline-none"
                    >
                      <option value={1}>1 - 2 Years</option>
                      <option value={3}>3 - 5 Years</option>
                      <option value={5}>5 - 8 Years</option>
                      <option value={8}>8 - 10 Years</option>
                      <option value={10}>10+ Years</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nithin Kumar"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending Code...' : 'Continue to OTP Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Enter 6-Digit Code</h3>
              <p className="text-xs text-slate-500">
                Sent to <strong className="text-slate-800">{email}</strong>{' '}
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-blue-600 hover:underline font-bold text-[11px] ml-1"
                >
                  (Change Email)
                </button>
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex justify-between gap-2 max-w-xs mx-auto">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`reg-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-lg font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition"
                />
              ))}
            </div>

            <div className="text-center text-xs text-slate-400">
              {countdown > 0 ? (
                <span>Didn't receive? Resend in <strong className="text-slate-700 font-bold">{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Resend Verification Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Activating Account...' : 'Verify Code & Complete Sign Up'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Sign In Link */}
        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};
