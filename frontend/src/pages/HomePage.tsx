import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { SearchFilters } from '../components/SearchFilters';
import { JobCard } from '../components/JobCard';
import { Job, MarketInsights } from '../types';
import { api } from '../api/client';
import { 
  Briefcase, Building2, Rocket, Building, CheckCircle2, ArrowRight, Sparkles, MapPin, 
  Search, ShieldCheck, ChevronDown, Check, Clock, TrendingUp, BarChart2, ChevronLeft, ChevronRight,
  GraduationCap, RefreshCw, Globe, Compass, ArrowLeft
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import bengaluruBanner from '../assets/bengaluru_landmark.webp';

const defaultTopSkillsList = [
  { name: 'AWS', count: 103, percent: 100 },
  { name: 'Python', count: 89, percent: 86 },
  { name: 'Kubernetes', count: 64, percent: 62 },
  { name: 'Java', count: 58, percent: 56 },
  { name: 'JavaScript', count: 52, percent: 50 },
  { name: 'SQL', count: 49, percent: 48 },
  { name: 'Docker', count: 38, percent: 37 },
  { name: 'React', count: 35, percent: 34 },
];

const defaultExpDonutData = [
  { name: 'Fresher', value: 11, count: 54, color: '#3b82f6' },
  { name: '1-3 years', value: 8, count: 39, color: '#10b981' },
  { name: '3-5 years', value: 11, count: 53, color: '#f59e0b' },
  { name: '5-10 years', value: 57, count: 264, color: '#8b5cf6' },
  { name: '10+ years', value: 12, count: 59, color: '#ef4444' },
];

const defaultRecentScans = [
  { time: 'Today, 07:26 AM', count: '618 jobs found' },
  { time: 'Today, 04:53 AM', count: '497 jobs found' },
  { time: 'Today, 04:31 AM', count: '372 jobs found' },
  { time: 'Today, 04:29 AM', count: '372 jobs found' },
];

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(618);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 4; // Display jobs up to the recent scan section

  // Live real-time scan state (across all career websites & job portals)
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [scanBannerText, setScanBannerText] = useState<string | null>(null);
  const [liveScanInfo, setLiveScanInfo] = useState<any>(null);

  // User's experience tier (auto-initialized from registered user profile or toggleable)
  const [activeExpTab, setActiveExpTab] = useState<'all' | 'fresher' | 'experienced'>(() => {
    const savedTier = sessionStorage.getItem('user_experience_tier') || localStorage.getItem('user_experience_tier');
    if (savedTier === 'fresher') return 'fresher';
    if (savedTier === 'experienced') return 'experienced';
    return 'all';
  });

  const isCandidateUser = Boolean(
    (sessionStorage.getItem('access_token') || localStorage.getItem('access_token')) &&
    (sessionStorage.getItem('user_role') || localStorage.getItem('user_role')) === 'candidate'
  );

  const isAdmin = Boolean(
    (sessionStorage.getItem('access_token') || localStorage.getItem('access_token')) &&
    (sessionStorage.getItem('user_role') || localStorage.getItem('user_role')) === 'admin'
  );

  const [isReloadingFresher, setIsReloadingFresher] = useState(false);
  const [fresherReloadFeedback, setFresherReloadFeedback] = useState<string | null>(null);
  const [isReloadingExperienced, setIsReloadingExperienced] = useState(false);
  const [experiencedReloadFeedback, setExperiencedReloadFeedback] = useState<string | null>(null);

  const [roleType, setRoleType] = useState<string>('all');
  const [activeLocation, setActiveLocation] = useState<string>('all');

  const [filters, setFilters] = useState<{ [key: string]: string }>({
    source_type: '',
    work_mode: '',
    company_type: '',
    employment_type: '',
    experience_level: '',
  });

  const queryQ = searchParams.get('q') || '';

  // Load real market insights
  const loadInsights = async () => {
    try {
      const data = await api.getMarketInsights();
      setInsights(data);
      if (data.total_jobs) {
        setTotalJobs(data.total_jobs);
      }
    } catch (err) {
      console.error('Failed to load market insights:', err);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  // Auto-scan verification when website opens: ensures career websites & job portals are fresh
  useEffect(() => {
    let pollInterval: any = null;

    const checkAndTriggerScan = async () => {
      try {
        const res = await api.autoScanCheck(false);
        if (res.scan_info) {
          setLiveScanInfo(res.scan_info);
        }
        if (res.started || res.status === 'scanning' || res.scan_info?.is_running) {
          setIsLiveScanning(true);
          setScanBannerText('⚡ Scanning 120+ verified Bengaluru company career portals & ATS feeds in real-time...');

          pollInterval = setInterval(async () => {
            try {
              const status = await api.getScanStatus();
              setLiveScanInfo(status);
              if (!status.is_running) {
                clearInterval(pollInterval);
                setIsLiveScanning(false);
                setScanBannerText(`✅ Scan Complete: Verified ${status.totals?.jobs_found || totalJobs} live jobs across 120+ Bengaluru company career portals.`);
                fetchJobs();
                loadInsights();
                setTimeout(() => setScanBannerText(null), 8000);
              }
            } catch (err) {
              clearInterval(pollInterval);
              setIsLiveScanning(false);
            }
          }, 3500);
        } else {
          setIsLiveScanning(false);
        }
      } catch (err) {
        console.error('Auto scan check error:', err);
      }
    };

    checkAndTriggerScan();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleTriggerLiveScan = async () => {
    if (!isAdmin) {
      alert('Scanning career portals is restricted to administrator accounts.');
      return;
    }
    if (isLiveScanning) return;
    setIsLiveScanning(true);
    setScanBannerText('⚡ Initiating live scan across 120+ verified Bengaluru company career portals & ATS feeds...');
    try {
      const res = await api.autoScanCheck(true);
      if (res.scan_info) {
        setLiveScanInfo(res.scan_info);
      }
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.getScanStatus();
          setLiveScanInfo(status);
          if (!status.is_running) {
            clearInterval(pollInterval);
            setIsLiveScanning(false);
            setScanBannerText(`✅ Live scan completed: Verified ${status.totals?.jobs_found || totalJobs} live jobs across all Career Websites & Job Portals.`);
            fetchJobs();
            loadInsights();
            setTimeout(() => setScanBannerText(null), 8000);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setIsLiveScanning(false);
        }
      }, 3500);
    } catch (err) {
      setIsLiveScanning(false);
      setScanBannerText('Failed to start scan.');
    }
  };

  const handleReloadFresherJobs = async () => {
    setIsReloadingFresher(true);
    try {
      setPage(1);
      await Promise.all([fetchJobs(), loadInsights()]);
      setFresherReloadFeedback('Fresh jobs & recommendations updated!');
      setTimeout(() => setFresherReloadFeedback(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReloadingFresher(false);
    }
  };

  const handleReloadExperiencedJobs = async () => {
    setIsReloadingExperienced(true);
    try {
      setPage(1);
      await Promise.all([fetchJobs(), loadInsights()]);
      setExperiencedReloadFeedback('Fresh openings & recommendations updated!');
      setTimeout(() => setExperiencedReloadFeedback(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReloadingExperienced(false);
    }
  };

  // Synchronize candidate experience tier directly from profile database on mount
  useEffect(() => {
    const syncProfileTier = async () => {
      const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
      const role = sessionStorage.getItem('user_role') || localStorage.getItem('user_role');
      if (token && role === 'candidate') {
        try {
          const prof = await api.getProfile();
          if (prof && typeof prof.years_experience === 'number') {
            const resolvedTier: 'fresher' | 'experienced' = prof.years_experience <= 1 ? 'fresher' : 'experienced';
            sessionStorage.setItem('user_experience_tier', resolvedTier);
            localStorage.setItem('user_experience_tier', resolvedTier);
            sessionStorage.setItem('years_experience', String(prof.years_experience));
            localStorage.setItem('years_experience', String(prof.years_experience));
            setActiveExpTab((prev) => (prev !== resolvedTier ? resolvedTier : prev));
          }
        } catch (e) {
          // Keep storage fallback if offline
        }
      }
    };
    syncProfileTier();

    const handleTierChange = (e: any) => {
      if (e?.detail?.tier) {
        setActiveExpTab(e.detail.tier);
      }
    };
    window.addEventListener('userTierChanged', handleTierChange);
    return () => window.removeEventListener('userTierChanged', handleTierChange);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let exp_min: number | undefined = undefined;
      let exp_max: number | undefined = undefined;
      let exp_tier: string | undefined = undefined;

      if (activeExpTab === 'fresher') {
        exp_tier = 'fresher';
        exp_min = 0;
        exp_max = 1;
      } else if (activeExpTab === 'experienced') {
        exp_tier = 'experienced';
      }

      if (filters.experience_level === '0' || filters.experience_level === '0-1') {
        exp_min = 0;
        exp_max = 1;
        exp_tier = 'fresher';
      } else if (filters.experience_level === '1-3') {
        exp_min = 1;
        exp_max = 3;
      } else if (filters.experience_level === '3-5') {
        exp_min = 3;
        exp_max = 5;
      } else if (filters.experience_level === '5-10') {
        exp_min = 5;
        exp_max = 10;
      } else if (filters.experience_level === '10+') {
        exp_min = 10;
        exp_max = 30;
      }

      const data = await api.getJobs({
        q: queryQ,
        location: activeLocation !== 'all' ? activeLocation : undefined,
        source_type: filters.source_type || undefined,
        work_mode: filters.work_mode || undefined,
        company_type: filters.company_type || undefined,
        employment_type: filters.employment_type || undefined,
        exp_min: exp_min,
        exp_max: exp_max,
        exp_tier: exp_tier,
        role_type: roleType !== 'all' ? roleType : undefined,
        page: page,
        page_size: pageSize,
      });
      setJobs(data.items);
      if (data.total !== undefined) {
        setTotalJobs(data.total);
        setTotalPages(Math.ceil(data.total / pageSize));
      }
      if (data.total_pages !== undefined) {
        setTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchParams, filters, activeExpTab, roleType, activeLocation]);

  useEffect(() => {
    fetchJobs();
  }, [searchParams, filters, page, activeExpTab, roleType, activeLocation]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'experience_level') {
      if (value === '0') {
        setActiveExpTab('fresher');
      } else if (value) {
        setActiveExpTab('experienced');
      } else {
        setActiveExpTab('all');
      }
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTabChange = (tab: 'all' | 'fresher' | 'experienced') => {
    setActiveExpTab(tab);
    setPage(1);
    if (tab === 'fresher') {
      setFilters((prev) => ({ ...prev, experience_level: '0' }));
    } else if (tab === 'experienced') {
      setFilters((prev) => ({ ...prev, experience_level: '' }));
    } else {
      setFilters((prev) => ({ ...prev, experience_level: '' }));
    }
  };

  const handleClearFilters = () => {
    setActiveExpTab('all');
    setActiveLocation('all');
    setRoleType('all');
    setFilters({ source_type: '', work_mode: '', company_type: '', employment_type: '', experience_level: '' });
  };

  const handleToggleSave = async (jobId: string) => {
    try {
      await api.toggleSaveJob(jobId);
      fetchJobs();
    } catch (err) {
      alert('Please log in to save jobs.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Back to Home Navigation Banner when browsing /jobs */}
      {location.pathname === '/jobs' && (
        <div className="flex items-center justify-between bg-white p-3.5 px-5 rounded-2xl border border-slate-200 shadow-2xs">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition group"
            title="Return to Home"
          >
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition shadow-2xs">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Bengaluru IT & Engineering Jobs Catalog
          </span>
        </div>
      )}
      
      {/* Real-time Live Scanner Alert Banner */}
      {isLiveScanning ? (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-cyan-400/50 rounded-2xl p-4 text-white flex items-center justify-between shadow-xl backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-3.5">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
            </span>
            <div>
              <div className="text-sm font-black text-cyan-200 flex items-center gap-2">
                <span>Real-Time Live Scanner Active</span>
                <span className="bg-cyan-500/30 text-cyan-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-cyan-400/40">27+ Live Sources</span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Scanning live company career ATS boards (Databricks, Okta, Stripe, Razorpay, Meesho...) and job portals (Arbeitnow, Remotive, Jobicy) for real tech openings in Bengaluru & India. Feed will refresh automatically.
              </div>
            </div>
          </div>
          <div className="shrink-0 pl-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold bg-cyan-500/25 text-cyan-200 px-3.5 py-1.5 rounded-xl border border-cyan-400/40 shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
              <span>Scanning...</span>
            </span>
          </div>
        </div>
      ) : scanBannerText ? (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-3.5 px-4 text-white flex items-center justify-between shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-200">
              {scanBannerText}
            </span>
          </div>
          <button 
            onClick={handleTriggerLiveScan}
            disabled={isLiveScanning}
            className="text-xs font-bold text-emerald-300 hover:text-white bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-500/40 px-3 py-1 rounded-xl transition shrink-0 ml-3 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Re-scan Portals</span>
          </button>
        </div>
      ) : null}

      {/* Sleek, Compact Hero Banner with Realistic Bengaluru Landmark (Vidhana Soudha) Background */}
      <div className="relative overflow-hidden rounded-2xl text-white p-5 md:p-6 shadow-md border border-slate-800/10">
        
        {/* Realistic Vidhana Soudha Background Image - Bright, crisp & atmospheric */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-110 contrast-105"
          style={{ backgroundImage: `url(${bengaluruBanner})` }}
        ></div>

        {/* Soft, Transparent Gradient Overlay: Keeps Vidhana Soudha bright, sunlit and clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/20"></div>

        {/* Compact Layout */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 bg-blue-600/40 backdrop-blur-md text-blue-200 border border-blue-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-300" />
              <span>JobNexa • Bengaluru IT Discovery & Engineering Intelligence</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight drop-shadow-md text-white">
              Bengaluru <span className="text-blue-400">IT & Engineering</span> Discovery
            </h1>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <Link
                to="/strategy"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-400/40 shadow-sm flex items-center gap-1.5 transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>📘 Read Discovery Blueprint</span>
              </Link>
              <span className="bg-slate-900/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 text-[11px] font-semibold text-slate-200 shadow-2xs">📍 Koramangala & HSR</span>
              <span className="bg-slate-900/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 text-[11px] font-semibold text-slate-200 shadow-2xs">📍 Whitefield & Bellandur</span>
              <span className="bg-slate-900/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 text-[11px] font-semibold text-slate-200 shadow-2xs">⚡ 100% Direct Apply</span>
            </div>
          </div>

          {/* Compact Scan Status Widget on the Right */}
          <div className="w-full sm:w-[280px] md:w-[280px] shrink-0 bg-slate-900/60 backdrop-blur-xl border border-white/25 p-3.5 rounded-xl space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/20 pb-2 text-[11px]">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isLiveScanning ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                {isLiveScanning ? 'Scanning Live...' : 'Daily Verified (06:00 IST)'}
              </span>
              <span className="text-slate-200 font-medium text-[11px]">
                {liveScanInfo?.formatted_time || liveScanInfo?.last_scan_time || insights?.latest_scan?.time || 'Today, 06:00 AM'}
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Active IT Jobs:</span>
                <strong className="text-white font-black text-sm">{(insights?.total_jobs ?? totalJobs).toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Verified Tech Units:</span>
                <strong className="text-emerald-300 font-black text-xs">{(insights?.total_companies ?? 108).toLocaleString()}</strong>
              </div>
            </div>
            {isAdmin ? (
              <button
                onClick={handleTriggerLiveScan}
                disabled={isLiveScanning}
                className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg border border-blue-400/40 flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                title="Run real-time scan across company career websites and job portals"
              >
                {isLiveScanning ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Scanning Career Portals...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ Scan All Career Portals Now</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-1.5 px-2 bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold rounded-lg border border-emerald-400/30 flex items-center justify-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Automated 24/7 Verified Sync Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Stat Cards Row matching real database counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div 
          onClick={() => handleFilterChange('company_type', '')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Briefcase className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Jobs</div>
            <div className="text-xl font-black text-slate-900">{insights?.total_jobs ?? totalJobs}</div>
            <div className="text-[10px] font-bold text-emerald-600">Active & Verified</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Building2 className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Companies</div>
            <div className="text-xl font-black text-slate-900">{insights?.total_companies ?? 108}</div>
            <div className="text-[10px] font-medium text-slate-400">Tech Companies</div>
          </div>
        </div>

        <div 
          onClick={() => handleFilterChange('company_type', filters.company_type === 'Startup' ? '' : 'Startup')}
          className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 cursor-pointer hover:shadow-md transition ${
            filters.company_type === 'Startup' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-amber-400'
          }`}
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Rocket className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Startups & Scale-ups</div>
            <div className="text-xl font-black text-slate-900">{insights?.company_tiers?.['Startup'] ?? 111}</div>
            <div className="text-[10px] font-medium text-slate-400">Active hiring</div>
          </div>
        </div>

        <div 
          onClick={() => handleFilterChange('company_type', filters.company_type === 'Mid-size' ? '' : 'Mid-size')}
          className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 cursor-pointer hover:shadow-md transition ${
            filters.company_type === 'Mid-size' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-teal-400'
          }`}
        >
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0"><Building className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Mid-Market</div>
            <div className="text-xl font-black text-slate-900">{insights?.company_tiers?.['Mid-size'] ?? 52}</div>
            <div className="text-[10px] font-medium text-slate-400">Active hiring</div>
          </div>
        </div>

        <div 
          onClick={() => handleFilterChange('company_type', filters.company_type === 'Enterprise' ? '' : 'Enterprise')}
          className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 cursor-pointer hover:shadow-md transition ${
            filters.company_type === 'Enterprise' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-purple-400'
          }`}
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0"><Building2 className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Enterprise & MNCs</div>
            <div className="text-xl font-black text-slate-900">{insights?.company_tiers?.['Enterprise'] ?? 309}</div>
            <div className="text-[10px] font-medium text-slate-400">Active hiring</div>
          </div>
        </div>

      </div>

      {/* Main 3-Column Layout Grid matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filters Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <SearchFilters
            filters={filters}
            insights={insights}
            activeTier={activeExpTab}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>


        {/* Center Column: Job Listings Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Bangalore Tech Hubs & Neighborhoods Selector Bar */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Tech Hubs:
              </span>
              {[
                { id: 'all', label: 'All Bengaluru & Karnataka', icon: '🏢' },
                { id: 'koramangala', label: 'Koramangala & HSR', icon: '📍' },
                { id: 'whitefield', label: 'Whitefield & Bellandur', icon: '📍' },
                { id: 'electronic_city', label: 'Electronic City', icon: '📍' },
                { id: 'manyata', label: 'Manyata & North BLR', icon: '📍' },
                { id: 'indiranagar', label: 'Indiranagar & Central', icon: '📍' },
                { id: 'remote', label: 'Remote / Hybrid (BLR)', icon: '🏠' },
              ].map((loc) => {
                const isActive = activeLocation === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setActiveLocation(loc.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    <span>{loc.icon}</span>
                    <span>{loc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Feed Headers: Strict Account-Level Personalization */}
          {isCandidateUser && activeExpTab === 'fresher' ? (
            /* Dedicated Header for Fresher Candidate Account */
            <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">Fresher Opportunities (0 - 1 Years)</h2>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                      Fresher Account
                    </span>
                    {fresherReloadFeedback && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full animate-fade-in flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {fresherReloadFeedback}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Curated exclusively for entry-level and fresh graduate candidates across Bengaluru and Karnataka
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Role Type Filter Dropdown for Freshers */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500">Role:</span>
                  <select
                    value={roleType}
                    onChange={(e) => {
                      setRoleType(e.target.value);
                      setPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500 shadow-2xs cursor-pointer transition hover:border-slate-300"
                  >
                    <option value="all">All IT Roles</option>
                    <option value="software_engineering">Software & Product Eng</option>
                    <option value="infrastructure_reliability">Cloud, SRE & DevOps</option>
                    <option value="security">Cybersecurity & InfoSec</option>
                    <option value="data_ai">Data & AI / ML</option>
                    <option value="quality_release">QA & SDET</option>
                    <option value="hardware_embedded">Hardware & Embedded</option>
                    <option value="technical_product">Tech Product & Arch</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                  <span className="text-xs font-medium text-slate-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500 shadow-2xs cursor-pointer transition hover:border-slate-300"
                  >
                    <option value="Relevance">Relevance</option>
                    <option value="Recent">Most Recent</option>
                    <option value="Match">Highest Match Score</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer"
                    title="Previous Jobs (<-)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-1">
                    {page} / {Math.max(totalPages, 1)}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer"
                    title="Next Jobs (->)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReloadFresherJobs}
                    disabled={isReloadingFresher}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer ml-1"
                    title="Reload fresh jobs applications & recommendations"
                  >
                    <RefreshCw className={`w-4 h-4 ${isReloadingFresher ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ) : isCandidateUser && activeExpTab === 'experienced' ? (
            /* Dedicated Header for Experienced Candidate Account */
            <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">Experienced Career Openings (1+ Years)</h2>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                      Experienced Account
                    </span>
                    {experiencedReloadFeedback && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full animate-fade-in flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {experiencedReloadFeedback}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Curated exclusively for experienced software engineers and industry specialists across Bengaluru and Karnataka
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Role Type Filter Dropdown for Experienced */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500">Role:</span>
                  <select
                    value={roleType}
                    onChange={(e) => {
                      setRoleType(e.target.value);
                      setPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 shadow-2xs cursor-pointer transition hover:border-slate-300"
                  >
                    <option value="all">All IT Roles</option>
                    <option value="software_engineering">Software & Product Eng</option>
                    <option value="infrastructure_reliability">Cloud, SRE & DevOps</option>
                    <option value="security">Cybersecurity & InfoSec</option>
                    <option value="data_ai">Data & AI / ML</option>
                    <option value="quality_release">QA & SDET</option>
                    <option value="hardware_embedded">Hardware & Embedded</option>
                    <option value="technical_product">Tech Product & Arch</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                  <span className="text-xs font-medium text-slate-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 shadow-2xs cursor-pointer transition hover:border-slate-300"
                  >
                    <option value="Relevance">Relevance</option>
                    <option value="Recent">Most Recent</option>
                    <option value="Match">Highest Match Score</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer"
                    title="Previous Jobs (<-)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-1">
                    {page} / {Math.max(totalPages, 1)}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer"
                    title="Next Jobs (->)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReloadExperiencedJobs}
                    disabled={isReloadingExperienced}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition text-slate-700 shadow-2xs flex items-center justify-center cursor-pointer ml-1"
                    title="Reload fresh openings & recommendations"
                  >
                    <RefreshCw className={`w-4 h-4 ${isReloadingExperienced ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Guest / Public Mode with 3 Exploration Tabs */
            <>
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => handleTabChange('fresher')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeExpTab === 'fresher'
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Fresher Jobs (0 - 1 Yrs)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeExpTab === 'fresher' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    54
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('experienced')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeExpTab === 'experienced'
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>Experienced Jobs (1+ Yrs)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeExpTab === 'experienced' ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    418
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeExpTab === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>All Jobs</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeExpTab === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    472
                  </span>
                </button>
              </div>

              {/* Feed Header with Previous and Next Arrows */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {activeExpTab === 'fresher' 
                      ? '🎓 Fresher Openings in Bengaluru (0 - 1 Years)' 
                      : activeExpTab === 'experienced' 
                      ? '💼 Experienced Openings in Bengaluru (1+ Years)' 
                      : activeLocation === 'koramangala'
                      ? '📍 Tech Jobs in Koramangala & HSR Layout'
                      : activeLocation === 'whitefield'
                      ? '📍 Tech Jobs in Whitefield & Bellandur (ORR)'
                      : activeLocation === 'electronic_city'
                      ? '📍 Tech Jobs in Electronic City Tech Parks'
                      : activeLocation === 'manyata'
                      ? '📍 Tech Jobs in Manyata & North Bengaluru'
                      : activeLocation === 'indiranagar'
                      ? '📍 Tech Jobs in Indiranagar & Central Bengaluru'
                      : activeLocation === 'remote'
                      ? '🏠 Remote & Hybrid Tech Jobs in Karnataka'
                      : '🏢 Verified Jobs in Bengaluru & Karnataka'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Showing {totalJobs === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalJobs)} of {totalJobs.toLocaleString()} jobs
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500">IT Role:</span>
                    <select
                      value={roleType}
                      onChange={(e) => {
                        setRoleType(e.target.value);
                        setPage(1);
                      }}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500 shadow-2xs cursor-pointer transition hover:border-slate-300"
                    >
                      <option value="all">All IT Roles</option>
                      <option value="software_engineering">Software & Product Eng</option>
                      <option value="infrastructure_reliability">Cloud, SRE & DevOps</option>
                      <option value="security">Cybersecurity & InfoSec</option>
                      <option value="data_ai">Data & AI / ML</option>
                      <option value="quality_release">QA & SDET</option>
                      <option value="hardware_embedded">Hardware & Embedded</option>
                      <option value="technical_product">Tech Product & Arch</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                    <span className="text-xs font-medium text-slate-500">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500 shadow-2xs cursor-pointer transition hover:border-slate-300"
                    >
                      <option value="Relevance">Relevance</option>
                      <option value="Recent">Most Recent</option>
                      <option value="Match">Highest Match Score</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page <= 1}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-xs flex items-center justify-center"
                      title="Previous Jobs (<-)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-1">
                      {page} / {Math.max(totalPages, 1)}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page >= totalPages}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-xs flex items-center justify-center"
                      title="Next Jobs (->)"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Exactly 3 Company Category Buttons: Startups & Scale-ups, Mid-Market Enterprises, Enterprise & MNCs */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', filters.company_type === 'Startup' ? '' : 'Startup')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  filters.company_type === 'Startup'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Filter to venture-backed startups and high-growth scaleups (click again to deselect)"
              >
                <Rocket className="w-3.5 h-3.5 text-amber-500" /> Startups & Scale-ups
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', filters.company_type === 'Mid-size' ? '' : 'Mid-size')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  filters.company_type === 'Mid-size'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Filter to mid-market and mature tech enterprises (click again to deselect)"
              >
                <Building className="w-3.5 h-3.5 text-teal-600" /> Mid-Market Enterprises
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', filters.company_type === 'Enterprise' ? '' : 'Enterprise')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  filters.company_type === 'Enterprise' || filters.company_type === 'Large'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Filter to Fortune 500, global multinationals & public tech giants (click again to deselect)"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Enterprise & MNCs
              </button>
            </div>

            {filters.company_type && (
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', '')}
                className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1 ml-auto"
                title="Reset to show all companies"
              >
                Show All
              </button>
            )}
          </div>

          {/* Job Feed Cards */}
          {loading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 font-medium">
              Loading verified tech jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <div className="font-bold text-slate-800 text-base">No jobs matching selected filters.</div>
              <p className="text-xs text-slate-400">Try clearing filters or searching for different keywords.</p>
              <button onClick={handleClearFilters} className="mt-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onToggleSave={handleToggleSave} />
              ))}
            </div>
          )}

        </div>

        {/* Right Column: AI Job Insights Sidebar (3 cols) matching Image 2 */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Top Hiring Skills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">AI Job Insights</h3>
                <div className="text-[10px] text-slate-400 font-medium">Global & Bengaluru • Last 30 Days</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-800">Top Hiring Skills</div>
              {(insights?.top_skills || defaultTopSkillsList).map((sk) => (
                <div key={sk.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{sk.name}</span>
                    <span className="text-slate-500 font-bold">{sk.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sk.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Jobs by Experience Level */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Jobs by Experience Level</h3>
            
            <div className="h-40 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={insights?.experience_breakdown || defaultExpDonutData} 
                    innerRadius={40} 
                    outerRadius={60} 
                    paddingAngle={4} 
                    dataKey="value"
                  >
                    {(insights?.experience_breakdown || defaultExpDonutData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {(insights?.experience_breakdown || defaultExpDonutData).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">({item.count})</span>
                    <span className="font-bold text-slate-800">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Recent Scans Timeline matching Image 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Recent Scans</h3>
              <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Everything automated</span>
              </div>

              {(insights?.recent_scans || defaultRecentScans).map((sc, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-600 py-1 border-b border-slate-50 last:border-0">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full border border-emerald-500 bg-emerald-50"></span>
                    <span>{sc.time}</span>
                  </span>
                  <span className="font-bold text-slate-800">{sc.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
