import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchFilters } from '../components/SearchFilters';
import { JobCard } from '../components/JobCard';
import { Job } from '../types';
import { api } from '../api/client';
import { 
  Briefcase, Building2, Rocket, Building, CheckCircle2, ArrowRight, Sparkles, MapPin, 
  Search, ShieldCheck, ChevronDown, Check, Clock, TrendingUp, BarChart2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import bengaluruBanner from '../assets/bengaluru_landmark.webp';

const topSkillsList = [
  { name: 'Python', count: 1842, percent: 95 },
  { name: 'SQL', count: 1621, percent: 85 },
  { name: 'Java', count: 1203, percent: 70 },
  { name: 'AWS', count: 1102, percent: 65 },
  { name: 'JavaScript', count: 986, percent: 55 },
  { name: 'React', count: 842, percent: 48 },
  { name: 'Docker', count: 791, percent: 44 },
  { name: 'Kubernetes', count: 642, percent: 36 },
];

const expDonutData = [
  { name: 'Fresher', value: 17, color: '#3b82f6' },
  { name: '1-3 years', value: 40, color: '#10b981' },
  { name: '3-5 years', value: 25, color: '#f59e0b' },
  { name: '5-10 years', value: 14, color: '#8b5cf6' },
  { name: '10+ years', value: 4, color: '#ef4444' },
];

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(24842);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 4; // Display jobs up to the recent scan section

  const [filters, setFilters] = useState<{ [key: string]: string }>({
    source_type: '',
    work_mode: '',
    company_type: '',
    employment_type: '',
    experience_level: '',
  });

  const queryQ = searchParams.get('q') || '';

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs({
        q: queryQ,
        location: 'Bengaluru',
        source_type: filters.source_type || undefined,
        work_mode: filters.work_mode,
        company_type: filters.company_type,
        employment_type: filters.employment_type,
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
  }, [searchParams, filters]);

  useEffect(() => {
    fetchJobs();
  }, [searchParams, filters, page]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
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
      
      {/* Hero Banner with Realistic Bengaluru Landmark (Vidhana Soudha) Background */}
      <div className="relative overflow-hidden rounded-3xl text-white p-8 md:p-12 shadow-2xl min-h-[300px]">
        
        {/* Realistic Vidhana Soudha Background Image - Enhanced Brightness & Clarity */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-110 contrast-105"
          style={{ backgroundImage: `url(${bengaluruBanner})` }}
        ></div>

        {/* Soft, Transparent Gradient Overlay: Keeps Vidhana Soudha bright, sunlit and clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-slate-950/15"></div>

        {/* Flex container cleanly separating Left Content and Right Stats Card */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">

          {/* Left Text Content */}
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-600/30 backdrop-blur-md text-blue-200 border border-blue-400/40 text-xs font-bold px-3 py-1 rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>AI Powered Job Discovery</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-lg text-white">
              Discover <span className="text-blue-400">Bengaluru</span> Jobs
            </h1>

            <p className="text-slate-100 text-sm md:text-base leading-relaxed drop-shadow-md font-medium">
              AI-powered job discovery from 1000+ companies. Updated daily. Direct application links. No middlemen.
            </p>

            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-100 flex-wrap pt-2">
              <span className="bg-slate-900/40 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">🏢 Startups</span>
              <span className="bg-slate-900/40 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">🏢 Mid-size</span>
              <span className="bg-slate-900/40 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">🏢 Large Companies</span>
              <span className="bg-slate-900/40 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">🔗 Direct Apply Links</span>
              <span className="bg-slate-900/40 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">⚡ No Middlemen</span>
            </div>
          </div>

          {/* Hero Stats Card - Compact 320px width on the right with frosted glass blur */}
          <div className="w-full sm:w-[320px] lg:w-[320px] shrink-0 bg-slate-900/40 backdrop-blur-xl border border-white/25 p-5 rounded-2xl space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 drop-shadow-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span> Latest Scan Completed
              </span>
              <span className="text-xs text-slate-200 font-medium">Today, 06:00 AM</span>
            </div>
            <div className="space-y-2 text-xs text-slate-100 font-medium">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Companies Scanned:</span>
                <strong className="text-white font-black text-sm">1,248</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Jobs Found:</span>
                <strong className="text-white font-black text-sm">3,842</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> New Jobs Today:</span>
                <strong className="text-emerald-300 font-black text-sm">1,926</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Direct Application Links:</span>
                <span className="text-emerald-400 font-bold text-xs">100% Direct</span>
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
            <div className="text-xl font-black text-slate-900">472</div>
            <div className="text-[10px] font-bold text-emerald-600">Active in BLR</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Building2 className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Companies</div>
            <div className="text-xl font-black text-slate-900">60</div>
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
            <div className="text-xl font-black text-slate-900">111</div>
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
            <div className="text-xl font-black text-slate-900">52</div>
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
            <div className="text-xl font-black text-slate-900">309</div>
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
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Center Column: Job Listings Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Feed Header with Previous and Next Arrows */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Jobs in Bengaluru</h2>
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

              {/* Top Navigation Arrows: Left (<-) and Right (->) */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700 shadow-xs flex items-center justify-center"
                  title="Previous Jobs (<-)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 min-w-10 text-center">
                  {page} / {totalPages || 1}
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

          {/* Company Category Buttons: Startups & Scale-ups, Mid-Market Enterprises, Enterprise & MNCs */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', '')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  !filters.company_type
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                All Companies
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', filters.company_type === 'Startup' ? '' : 'Startup')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filters.company_type === 'Startup'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Filter to venture-backed startups and high-growth scaleups"
              >
                <Rocket className="w-3.5 h-3.5 text-amber-500" /> Startups & Scale-ups
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', filters.company_type === 'Mid-size' ? '' : 'Mid-size')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filters.company_type === 'Mid-size'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Filter to mid-market and mature tech enterprises"
              >
                <Building className="w-3.5 h-3.5 text-teal-600" /> Mid-Market Enterprises
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', filters.company_type === 'Enterprise' ? '' : 'Enterprise')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filters.company_type === 'Enterprise' || filters.company_type === 'Large'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Filter to Fortune 500, global multinationals & public tech giants"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Enterprise & MNCs
              </button>
            </div>

            {filters.company_type && (
              <button
                type="button"
                onClick={() => handleFilterChange('company_type', '')}
                className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
              >
                Clear filter
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
              {topSkillsList.map((sk) => (
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
                  <Pie data={expDonutData} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                    {expDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {expDonutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-800">{item.value}%</span>
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

              {[
                { time: 'Today, 06:00 AM', count: '3,842 jobs found' },
                { time: 'Yesterday, 06:00 AM', count: '3,120 jobs found' },
                { time: 'Oct 14, 06:00 AM', count: '2,984 jobs found' },
                { time: 'Oct 13, 06:00 AM', count: '3,421 jobs found' },
              ].map((sc, idx) => (
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
