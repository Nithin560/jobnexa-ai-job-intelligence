import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchFilters } from '../components/SearchFilters';
import { JobCard } from '../components/JobCard';
import { Job, MarketInsights } from '../types';
import { api } from '../api/client';
import { 
  Briefcase, Building2, Rocket, Building, CheckCircle2, ArrowRight, Sparkles, MapPin, 
  Search, ShieldCheck, ChevronDown, Check, Clock, TrendingUp, BarChart2, ChevronLeft, ChevronRight,
  GraduationCap
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
  { time: 'Today, 04:53 AM', count: '497 jobs found' },
  { time: 'Today, 04:53 AM', count: '80 jobs found' },
  { time: 'Today, 04:31 AM', count: '372 jobs found' },
  { time: 'Today, 04:29 AM', count: '372 jobs found' },
];

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(472);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 4; // Display jobs up to the recent scan section

  // User's experience tier (auto-initialized from registered user profile or toggleable)
  const [activeExpTab, setActiveExpTab] = useState<'all' | 'fresher' | 'experienced'>(() => {
    const savedTier = sessionStorage.getItem('user_experience_tier') || localStorage.getItem('user_experience_tier');
    if (savedTier === 'fresher') return 'fresher';
    if (savedTier === 'experienced') return 'experienced';
    return 'all';
  });

  const [filters, setFilters] = useState<{ [key: string]: string }>({
    source_type: '',
    work_mode: '',
    company_type: '',
    employment_type: '',
    experience_level: '',
  });

  const queryQ = searchParams.get('q') || '';

  // Load real market insights once on mount
  useEffect(() => {
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
    loadInsights();
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
        location: 'Bengaluru',
        source_type: filters.source_type || undefined,
        work_mode: filters.work_mode || undefined,
        company_type: filters.company_type || undefined,
        employment_type: filters.employment_type || undefined,
        exp_min: exp_min,
        exp_max: exp_max,
        exp_tier: exp_tier,
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
  }, [searchParams, filters, activeExpTab]);

  useEffect(() => {
    fetchJobs();
  }, [searchParams, filters, page, activeExpTab]);

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
    <div className="space-y-8 pb-16">
      
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
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-600/35 backdrop-blur-md text-blue-200 border border-blue-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-300" />
              <span>AI Powered Bengaluru Job Discovery</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight drop-shadow-md text-white">
              Discover <span className="text-blue-400">Bengaluru</span> Jobs
            </h1>

            <p className="text-slate-100 text-xs md:text-sm leading-relaxed drop-shadow-sm font-medium">
              Verified tech opportunities from 60+ companies across Bengaluru. 100% direct application links with no middlemen.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-200 flex-wrap pt-1">
              <span className="bg-slate-900/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-2xs">🏢 Startups</span>
              <span className="bg-slate-900/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-2xs">🏢 Mid-size</span>
              <span className="bg-slate-900/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-2xs">🏢 Enterprise & MNCs</span>
              <span className="bg-slate-900/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-2xs">⚡ Direct Apply</span>
            </div>
          </div>

          {/* Compact Scan Status Widget on the Right */}
          <div className="w-full sm:w-[260px] md:w-[260px] shrink-0 bg-slate-900/45 backdrop-blur-xl border border-white/25 p-3.5 rounded-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/20 pb-2 text-[11px]">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span> Live Scan
              </span>
              <span className="text-slate-200 font-medium">
                {insights?.latest_scan?.time || 'Today, 08:00 AM'}
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Openings:</span>
                <strong className="text-white font-black text-sm">{(insights?.total_jobs ?? 472).toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Companies Active:</span>
                <strong className="text-emerald-300 font-black text-xs">{(insights?.total_companies ?? 60).toLocaleString()}</strong>
              </div>
            </div>
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
            <div className="text-xl font-black text-slate-900">{insights?.total_jobs ?? 472}</div>
            <div className="text-[10px] font-bold text-emerald-600">Active in BLR</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Building2 className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Companies</div>
            <div className="text-xl font-black text-slate-900">{insights?.total_companies ?? 60}</div>
            <div className="text-[10px] font-medium text-slate-400">in Bengaluru</div>
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
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>


        {/* Center Column: Job Listings Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Conditional Feed Headers: Strict Account-Level Personalization */}
          {sessionStorage.getItem('user_experience_tier') === 'fresher' ? (
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
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Curated exclusively for entry-level and fresh graduate candidates in Bengaluru
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="Relevance">Relevance</option>
                  <option value="Recent">Most Recent</option>
                  <option value="Match">Highest Match Score</option>
                </select>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center"
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
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center"
                    title="Next Jobs (->)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : sessionStorage.getItem('user_experience_tier') === 'experienced' ? (
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
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Curated exclusively for experienced software engineers and industry specialists in Bengaluru
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="Relevance">Relevance</option>
                  <option value="Recent">Most Recent</option>
                  <option value="Match">Highest Match Score</option>
                </select>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center"
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
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-2xs flex items-center justify-center"
                    title="Next Jobs (->)"
                  >
                    <ChevronRight className="w-4 h-4" />
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
                      ? '🎓 Fresher Jobs (0 - 1 Years)' 
                      : activeExpTab === 'experienced' 
                      ? '💼 Experienced Jobs (> 1 Years)' 
                      : 'Jobs in Bengaluru'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Showing {totalJobs === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalJobs)} of {totalJobs.toLocaleString()} jobs
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
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
              Loading Bengaluru jobs...
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
          
          {/* Card 1: Top Hiring Skills (Bengaluru) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">AI Job Insights</h3>
                <div className="text-[10px] text-slate-400 font-medium">Bengaluru • Last 30 Days</div>
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
