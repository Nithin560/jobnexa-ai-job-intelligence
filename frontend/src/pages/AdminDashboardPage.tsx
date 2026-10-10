import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { AdminOverview } from '../types';
import { 
  Briefcase, Building2, Link2, MapPin, Sparkles, Clock, Shield, Play, Plus, Download, 
  CheckCircle2, Server, Database, Cpu, Layers, HardDrive, AlertCircle, RefreshCw, Search,
  Bell, User, ChevronDown, Check, ArrowUpRight, ArrowRight, Eye, LayoutDashboard, Globe,
  FileText, Activity, Brain, CopyCheck, ShieldCheck, Users, BarChart3, BellRing, Terminal, Settings
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const jobsTrend = [
  { date: 'Sep 27', count: 210 },
  { date: 'Sep 30', count: 320 },
  { date: 'Oct 03', count: 280 },
  { date: 'Oct 06', count: 410 },
  { date: 'Oct 09', count: 390 },
  { date: 'Oct 12', count: 520 },
  { date: 'Oct 15', count: 480 },
  { date: 'Oct 18', count: 610 },
  { date: 'Oct 21', count: 540 },
  { date: 'Oct 24', count: 690 },
  { date: 'Oct 27', count: 740 },
];

const companyTypeData = [
  { name: 'Startups', value: 38.2, count: 9491, color: '#3b82f6' },
  { name: 'Mid-size', value: 29.4, count: 7301, color: '#10b981' },
  { name: 'Large', value: 20.3, count: 5042, color: '#f59e0b' },
  { name: 'Enterprise', value: 7.1, count: 1762, color: '#8b5cf6' },
  { name: 'Other', value: 5.0, count: 1246, color: '#64748b' },
];

const topSkills = [
  { name: 'Python', count: 4321, percent: 95 },
  { name: 'SQL', count: 3842, percent: 85 },
  { name: 'Java', count: 3215, percent: 70 },
  { name: 'AWS', count: 2984, percent: 65 },
  { name: 'JavaScript', count: 2761, percent: 60 },
  { name: 'React', count: 2431, percent: 52 },
  { name: 'Docker', count: 2208, percent: 48 },
  { name: 'Kubernetes', count: 1984, percent: 42 },
  { name: 'DevOps', count: 1762, percent: 38 },
  { name: 'Machine Learning', count: 1521, percent: 32 },
];

const recentScansData = [
  { id: 1, time: 'Today, 06:00 AM', status: 'Completed', companies: 842, found: 3842, newJobs: 427, updated: 691, expired: 214, duration: '48m' },
  { id: 2, time: 'Yesterday, 06:00 AM', status: 'Completed', companies: 823, found: 3120, newJobs: 389, updated: 612, expired: 198, duration: '42m' },
  { id: 3, time: 'Oct 25, 06:00 AM', status: 'Completed', companies: 821, found: 2984, newJobs: 352, updated: 608, expired: 176, duration: '45m' },
  { id: 4, time: 'Oct 24, 06:00 AM', status: 'Completed', companies: 810, found: 3421, newJobs: 401, updated: 655, expired: 193, duration: '47m' },
  { id: 5, time: 'Oct 23, 06:00 AM', status: 'Completed', companies: 805, found: 3201, newJobs: 378, updated: 642, expired: 181, duration: '46m' },
];

const latestJobsData = [
  { title: 'Backend Engineer', company: 'Razorpay', location: 'Bengaluru', detected: '2 hours ago', source: 'Careers' },
  { title: 'Data Scientist', company: 'Flipkart', location: 'Bengaluru', detected: '3 hours ago', source: 'Naukri' },
  { title: 'DevOps Engineer', company: 'Swiggy', location: 'Bengaluru', detected: '4 hours ago', source: 'Careers' },
  { title: 'Frontend Developer', company: 'PhonePe', location: 'Bengaluru', detected: '5 hours ago', source: 'LinkedIn' },
  { title: 'ML Engineer', company: 'Zepto', location: 'Bengaluru', detected: '6 hours ago', source: 'Careers' },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');

  const fetchOverview = async () => {
    try {
      const data = await api.getAdminOverview();
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleManualScan = async () => {
    setScanning(true);
    setScanMessage('');
    try {
      const res = await api.triggerScan();
      setScanMessage(`Scan Completed! Discovered ${res.jobs_found} jobs (${res.new_jobs} new).`);
      fetchOverview();
    } catch (err) {
      setScanMessage('Error executing crawler run.');
    } finally {
      setScanning(false);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Companies', icon: Building2 },
    { label: 'Job Sources', icon: Link2 },
    { label: 'Job Listings', icon: Briefcase },
    { label: 'Crawlers & Scans', icon: Activity },
    { label: 'AI Processing', icon: Brain },
    { label: 'Duplicate Detection', icon: CopyCheck },
    { label: 'Data Quality', icon: ShieldCheck },
    { label: 'Users', icon: Users },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Job Alerts', icon: BellRing },
    { label: 'System Logs', icon: Terminal },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* 1. Dark Left Navigation Sidebar matching Image 1 */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base text-white leading-tight">BangaloreJobs</div>
              <div className="text-[11px] font-semibold text-slate-400">Admin Panel</div>
            </div>
          </Link>
          <span className="bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions Panel at bottom of sidebar matching Image 1 */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</div>
          
          <button
            onClick={handleManualScan}
            disabled={scanning}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Running...' : 'Run Manual Scan'}</span>
          </button>

          <button className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition flex items-center gap-2 border border-slate-700">
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Company</span>
          </button>

          <button className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition flex items-center gap-2 border border-slate-700">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Job Source</span>
          </button>

          <button className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition flex items-center gap-2 border border-slate-700">
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Data</span>
          </button>
        </div>

      </aside>

      {/* 2. Main Container & Top Navigation Header matching Image 1 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          
          {/* Global Admin Search Bar */}
          <div className="flex items-center bg-slate-100 rounded-xl px-3.5 py-2 w-96 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 transition">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search jobs, companies, sources, logs..."
              className="bg-transparent text-xs w-full outline-none text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Top Right System Metrics & Profile */}
          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Last Scan: <strong className="text-slate-900">Today, 06:00 AM</strong></span>
              <span className="text-slate-300">•</span>
              <span>Next Scan: <strong className="text-slate-900">Tomorrow, 06:00 AM</strong></span>
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">5</span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
                A
              </div>
              <span className="text-xs font-bold text-slate-800">Admin</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

        </header>

        {/* Dashboard Main Content Body */}
        <main className="p-8 space-y-6">
          
          {/* Header Title Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Monitor job discovery, data processing, and system health</p>
            </div>

            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last 30 Days</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {scanMessage && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {scanMessage}
            </div>
          )}

          {/* 6 Stat Cards Row matching Image 1 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Companies</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Building2 className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.total_companies.toLocaleString() || '1,248'}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
                <span>↑ +34 this week</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Active Job Sources</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Link2 className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.active_sources.toLocaleString() || '1,126'}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
                <span>↑ 98.2% working</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Jobs</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Briefcase className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.total_jobs.toLocaleString() || '24,842'}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
                <span>↑ +3,842 this week</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Bengaluru Jobs</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><MapPin className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.bengaluru_jobs.toLocaleString() || '12,436'}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">50.1% of total</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">New Jobs (Today)</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Sparkles className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.new_jobs_today.toLocaleString() || '427'}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
                <span>↑ +12% vs yesterday</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Expired Jobs</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Clock className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">2,134</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">Auto-verified</div>
            </div>

          </div>

          {/* Row 2 Charts Grid matching Image 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Jobs Discovered Area Chart */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Jobs Discovered (Last 30 Days)</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-slate-500">Total <strong className="text-slate-900">24,842</strong></span>
                  <span className="text-emerald-600">New <strong>8,926</strong></span>
                  <span className="text-blue-600">Updated <strong>11,284</strong></span>
                  <span className="text-rose-500">Expired <strong>4,632</strong></span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={jobsTrend}>
                    <defs>
                      <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorJobs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Jobs by Company Type Donut Chart */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-900 text-sm mb-2">Jobs by Company Type</h3>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={companyTypeData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {companyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-xs">
                {companyTypeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span>{item.name}</span>
                    </span>
                    <span className="font-bold text-slate-800">{item.value}% <span className="font-normal text-slate-400">({item.count.toLocaleString()})</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Hiring Skills Bar Chart */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">Top Hiring Skills (Bengaluru)</h3>
                <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View All</span>
              </div>
              <div className="space-y-2.5">
                {topSkills.map((sk) => (
                  <div key={sk.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{sk.name}</span>
                      <span className="text-slate-400 font-bold">{sk.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sk.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Row 3 Processing & Status Grid matching Image 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Crawler Status Donut Gauge */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Crawler Status</h3>
              <div className="flex items-center justify-around">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path className="text-emerald-500" strokeDasharray="94, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-2xl font-black text-slate-900">94%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Overall Success Rate</div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Successful</span>
                    <strong className="text-slate-900 font-bold ml-auto pl-4">1,056 <span className="font-normal text-slate-400">(94.0%)</span></strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">Partial</span>
                    <strong className="text-slate-900 font-bold ml-auto pl-4">58 <span className="font-normal text-slate-400">(5.2%)</span></strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-600">Failed</span>
                    <strong className="text-slate-900 font-bold ml-auto pl-4">12 <span className="font-normal text-slate-400">(0.8%)</span></strong>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 border border-blue-200 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>View Crawler Logs</span>
              </button>
            </div>

            {/* Job Processing Pipeline Horizontal Flowchart */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Job Processing Pipeline</h3>
              
              <div className="flex items-center justify-between gap-2 py-4">
                {[
                  { step: 'Crawling', pass: '100%', count: '3,842 jobs', color: 'emerald' },
                  { step: 'Parsing', pass: '100%', count: '3,842 jobs', color: 'emerald' },
                  { step: 'AI Analysis', pass: '98%', count: '3,765 jobs', color: 'blue' },
                  { step: 'Deduplication', pass: '100%', count: '3,842 jobs', color: 'emerald' },
                  { step: 'Database', pass: '100%', count: '3,842 jobs', color: 'emerald' },
                ].map((item, idx, arr) => (
                  <React.Fragment key={item.step}>
                    <div className="text-center space-y-1">
                      <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center font-bold text-xs ${
                        item.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="text-[11px] font-bold text-slate-800">{item.step}</div>
                      <div className="text-[10px] font-bold text-emerald-600">{item.pass}</div>
                      <div className="text-[9px] text-slate-400">{item.count}</div>
                    </div>
                    {idx < arr.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mb-4" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* System Health Status */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">System Health</h3>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> 1 Systems Operational
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Backend API', icon: Server, status: 'OK' },
                  { name: 'Database (PostgreSQL)', icon: Database, status: 'OK' },
                  { name: 'Redis Queue', icon: Layers, status: 'OK' },
                  { name: 'AI Service (Ollama)', icon: Cpu, status: 'OK' },
                  { name: 'Scheduler (Cron)', icon: Clock, status: 'OK' },
                  { name: 'Disk Storage', icon: HardDrive, status: 'OK' },
                ].map((sys) => {
                  const Icon = sys.icon;
                  return (
                    <div key={sys.name} className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sys.name}</span>
                      </span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> OK
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Row 4 Data Tables Grid matching Image 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Scans Table */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Recent Scans</h3>
                <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View All</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Scan Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Companies</th>
                      <th className="py-3 px-4">Jobs Found</th>
                      <th className="py-3 px-4">New</th>
                      <th className="py-3 px-4">Updated</th>
                      <th className="py-3 px-4">Expired</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentScansData.map((scan) => (
                      <tr key={scan.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-400">{scan.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{scan.time}</td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit border border-emerald-200">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {scan.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{scan.companies}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{scan.found.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{scan.newJobs}</td>
                        <td className="py-3 px-4 text-blue-600 font-semibold">{scan.updated}</td>
                        <td className="py-3 px-4 text-rose-500 font-semibold">{scan.expired}</td>
                        <td className="py-3 px-4 text-slate-400 font-medium">{scan.duration}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latest Discovered Jobs Table */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Latest Discovered Jobs</h3>
                <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View All</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Detected At</th>
                      <th className="py-3 px-4">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {latestJobsData.map((job, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{job.title}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{job.company}</td>
                        <td className="py-3 px-4 text-slate-500">{job.location}</td>
                        <td className="py-3 px-4 text-slate-400">{job.detected}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                            {job.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
};
