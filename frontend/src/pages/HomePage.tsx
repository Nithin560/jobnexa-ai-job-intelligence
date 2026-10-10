import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchFilters } from '../components/SearchFilters';
import { JobCard } from '../components/JobCard';
import { Job } from '../types';
import { api } from '../api/client';
import { 
  Briefcase, Building2, Rocket, Building, CheckCircle2, ArrowRight, Sparkles, MapPin, 
  Search, ShieldCheck, ChevronDown, Check, Clock, TrendingUp, BarChart2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  const [filters, setFilters] = useState<{ [key: string]: string }>({
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
        work_mode: filters.work_mode,
        company_type: filters.company_type,
        employment_type: filters.employment_type,
      });
      setJobs(data.items);
      if (data.total) setTotalJobs(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ work_mode: '', company_type: '', employment_type: '', experience_level: '' });
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
      
      {/* Hero Banner matching Image 2 (Bengaluru Skyline Background) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
        
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1600&auto=format&fit=crop')` }}
        ></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Powered Job Discovery</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            Discover <span className="text-blue-400">Bengaluru</span> Jobs
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            AI-powered job discovery from 1000+ companies. Updated daily. Direct application links. No middlemen.
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 flex-wrap pt-2">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">🏢 Startups</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">🏢 Mid-size</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">🏢 Large Companies</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">🔗 Direct Apply Links</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">⚡ No Middlemen</span>
          </div>
        </div>

        {/* Hero Floating Stats Box matching Image 2 */}
        <div className="mt-8 md:mt-0 md:absolute md:top-8 md:right-8 bg-white/15 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-80 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span> Latest Scan Completed
            </span>
            <span className="text-[11px] text-slate-300 font-medium">Today, 06:00 AM</span>
          </div>
          <div className="space-y-2 text-xs text-slate-200 font-medium">
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
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Direct Application Links</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5 Stat Cards Row matching Image 2 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Briefcase className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Jobs</div>
            <div className="text-xl font-black text-slate-900">24,842</div>
            <div className="text-[10px] font-bold text-emerald-600">+1,926 new today</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Building2 className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Companies</div>
            <div className="text-xl font-black text-slate-900">1,248</div>
            <div className="text-[10px] font-medium text-slate-400">in Bengaluru</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Rocket className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Startups</div>
            <div className="text-xl font-black text-slate-900">642</div>
            <div className="text-[10px] font-medium text-slate-400">Active hiring</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0"><Building className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Mid-size</div>
            <div className="text-xl font-black text-slate-900">403</div>
            <div className="text-[10px] font-medium text-slate-400">Active hiring</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0"><Building2 className="w-5 h-5" /></div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Large Companies</div>
            <div className="text-xl font-black text-slate-900">203</div>
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
          
          {/* Feed Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Jobs in Bengaluru</h2>
              <p className="text-xs text-slate-500 font-medium">
                Showing 1-{jobs.length} of {totalJobs.toLocaleString()} jobs
              </p>
            </div>

            <div className="flex items-center gap-2">
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
