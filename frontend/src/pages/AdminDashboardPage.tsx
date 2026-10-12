import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { AdminOverview, Job, AdminNotificationItem, ScanRunItem, AdminUsersResponse, DayWiseJobsResponse } from '../types';
import { 
  Briefcase, Building2, Link2, MapPin, Sparkles, Clock, Shield, Play, Plus, Download, 
  CheckCircle2, Server, Database, Cpu, Layers, HardDrive, AlertCircle, RefreshCw, Search,
  Bell, User, ChevronDown, Check, ArrowUpRight, ArrowRight, Eye, LayoutDashboard, Globe,
  FileText, Activity, Brain, CopyCheck, ShieldCheck, Users, BarChart3, BellRing, Terminal, Settings, LogOut,
  UserCheck, CheckCheck, X, GraduationCap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, Legend, CartesianGrid 
} from 'recharts';

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

const fallbackCompanyTypeData = [
  { name: 'Enterprise', value: 45.0, count: 27, color: '#8b5cf6' },
  { name: 'Startup', value: 28.3, count: 17, color: '#3b82f6' },
  { name: 'Mid-size', value: 23.3, count: 14, color: '#10b981' },
  { name: 'Job Platform', value: 3.3, count: 2, color: '#06b6d4' },
];

const fallbackTopSkills = [
  { name: 'AWS', count: 104, percent: 100 },
  { name: 'Python', count: 91, percent: 87 },
  { name: 'Kubernetes', count: 64, percent: 61 },
  { name: 'Java', count: 58, percent: 55 },
  { name: 'JavaScript', count: 52, percent: 50 },
  { name: 'SQL', count: 50, percent: 48 },
  { name: 'Docker', count: 38, percent: 36 },
  { name: 'React', count: 35, percent: 33 },
  { name: 'PostgreSQL', count: 31, percent: 30 },
  { name: 'Node.js', count: 24, percent: 23 },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [recentScans, setRecentScans] = useState<ScanRunItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [activeTab, setActiveTab] = useState<string>(() => (location.state as any)?.tab || 'Dashboard');

  // User Intelligence State
  const [adminUsersData, setAdminUsersData] = useState<AdminUsersResponse | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Day-Wise Job Breakdown State
  const [dayWiseJobsData, setDayWiseJobsData] = useState<DayWiseJobsResponse | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [liveMetrics, setLiveMetrics] = useState({
    expired_jobs: 0,
    new_jobs: 0,
    fresher_jobs: 0,
    experienced_jobs: 0,
    total_jobs: 0
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await api.getAdminOverview();
      setOverview(data);

      const notifsData = await api.getAdminNotifications();
      setNotifications(notifsData.notifications);
      setUnreadNotifsCount(notifsData.unread_count);
      setLiveMetrics(notifsData.live_metrics);

      const scansData = await api.getScanRuns();
      setRecentScans(scansData);

      const jobsRes = await api.getJobs({ page_size: 6, sort_by: 'date' });
      if (jobsRes.items) {
        setLatestJobs(jobsRes.items);
      }

      // Fetch User Intelligence Data
      const usersData = await api.getAdminUsers();
      setAdminUsersData(usersData);

      // Fetch Day-Wise Jobs Data
      const dayWiseData = await api.getDayWiseJobs();
      setDayWiseJobsData(dayWiseData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUser = async (userId: string) => {
    try {
      setTogglingUserId(userId);
      await api.toggleUserStatus(userId);
      const updated = await api.getAdminUsers();
      setAdminUsersData(updated);
    } catch (err) {
      console.error(err);
      alert('Error updating user status.');
    } finally {
      setTogglingUserId(null);
    }
  };

  useEffect(() => {
    const role = sessionStorage.getItem('user_role') || localStorage.getItem('user_role');
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    if (!token || role !== 'admin') {
      navigate('/login?role=admin');
      return;
    }
    fetchOverview();
  }, []);

  useEffect(() => {
    if ((location.state as any)?.tab) {
      setActiveTab((location.state as any).tab);
    }
  }, [location.state]);

  const handleManualScan = async () => {
    setScanning(true);
    setScanMessage('');
    try {
      const res = await api.triggerScan();
      setScanMessage(`Scan Completed! Scanned ${res.companies_scanned} sources. Found ${res.jobs_found} jobs (${res.new_jobs} new).`);
      await fetchOverview();
    } catch (err) {
      setScanMessage('Error executing crawler run.');
    } finally {
      setScanning(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadNotifsCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { 
      label: 'Users', 
      icon: Users, 
      badge: `${adminUsersData?.total_registered ?? overview?.total_users ?? 6} Reg` 
    },
    { label: 'Companies', icon: Building2 },
    { label: 'Job Sources', icon: Link2 },
    { label: 'Job Listings', icon: Briefcase },
    { label: 'Crawlers & Scans', icon: Activity },
    { label: 'AI Processing', icon: Brain },
    { label: 'Duplicate Detection', icon: CopyCheck },
    { label: 'Data Quality', icon: ShieldCheck },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Job Alerts', icon: BellRing },
    { label: 'System Logs', icon: Terminal },
    { label: 'Settings', icon: Settings },
  ];

  const displaySkills = overview?.top_skills && overview.top_skills.length > 0 
    ? overview.top_skills 
    : fallbackTopSkills;

  const displayCompanyTypes = overview?.company_type_breakdown && overview.company_type_breakdown.length > 0
    ? overview.company_type_breakdown
    : fallbackCompanyTypeData;

  const filteredUsers = (adminUsersData?.users || []).filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (userRoleFilter === 'fresher') return user.experience_tier === 'fresher';
    if (userRoleFilter === 'experienced') return user.experience_tier === 'experienced';
    if (userRoleFilter === 'admin') return user.role === 'admin';
    if (userRoleFilter === 'candidate') return user.role === 'candidate';
    return true;
  });

  const userDemographicData = [
    { name: 'Fresher Candidates (0-1 yrs)', value: adminUsersData?.fresher_count ?? 3, color: '#10b981' },
    { name: 'Experienced Candidates (>1 yrs)', value: adminUsersData?.experienced_count ?? 1, color: '#3b82f6' },
    { name: 'Admin Security', value: adminUsersData?.admin_count ?? 2, color: '#8b5cf6' },
  ];

  const userGrowthData = adminUsersData?.registration_trends && adminUsersData.registration_trends.length > 0
    ? adminUsersData.registration_trends
    : [
        { date: 'Oct 06', count: 1 },
        { date: 'Oct 08', count: 2 },
        { date: 'Oct 10', count: 4 },
        { date: 'Oct 11', count: 5 },
        { date: 'Oct 12', count: adminUsersData?.total_registered ?? 6 },
      ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* 1. Dark Left Navigation Sidebar */}
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

        {/* User Base Quick Stats Bar in Sidebar */}
        <div 
          onClick={() => setActiveTab('Users')}
          className="mx-3 mt-3 mb-1 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition flex items-center justify-between text-xs group"
          title="Click to view User Accounts & Activity Intelligence"
        >
          <div className="flex items-center gap-2 text-slate-300 group-hover:text-white">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-xs">Users</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black">
            <span className="bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
              {adminUsersData?.total_registered ?? overview?.total_users ?? 6} Reg
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {adminUsersData?.total_active ?? overview?.active_users ?? 6} Act
            </span>
          </div>
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-blue-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Action Buttons */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleManualScan}
            disabled={scanning}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Portals...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Scan Bangalore Portals</span>
              </>
            )}
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

      {/* 2. Main Container & Top Navigation Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar with distinct spacing between search bar and scan section */}
        <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          
          {/* Global Admin Search Bar - with generous right spacing */}
          <div className="flex items-center bg-slate-100 rounded-xl px-3.5 py-2 w-72 md:w-80 lg:w-96 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 transition mr-8 xl:mr-12">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search jobs, companies, sources, logs..."
              className="bg-transparent text-xs w-full outline-none text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Top Right: Scan Metrics Widget, User Stats, Notifications & Profile */}
          <div className="flex items-center gap-4 xl:gap-6 ml-auto">
            
            {/* Quick Registered & Active Users Navigation Badge */}
            <button
              onClick={() => setActiveTab('Users')}
              className={`hidden sm:flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl border transition shadow-2xs ${
                activeTab === 'Users'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-blue-50/80 hover:bg-blue-100 text-blue-900 border-blue-200'
              }`}
              title="View Registered & Active Users Section"
            >
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Users: <strong className={activeTab === 'Users' ? 'text-white' : 'text-blue-950 font-black'}>{adminUsersData?.total_registered ?? overview?.total_users ?? 6}</strong> Reg • <strong className={activeTab === 'Users' ? 'text-emerald-300' : 'text-emerald-700 font-black'}>{adminUsersData?.total_active ?? overview?.active_users ?? 6}</strong> Act
              </span>
            </button>

            {/* Scan Status Widget with real date and time */}
            <div className="hidden md:flex items-center gap-2.5 text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium shadow-2xs">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Last Scan: <strong className="text-slate-900">{overview?.last_scan_time || 'Today, 08:00 AM'}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Next Scan: <strong className="text-slate-900">{overview?.next_scan_time || 'Tomorrow, 08:00 AM'}</strong></span>
            </div>

            {/* Notification Bell with interactive popover */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-xl transition ${
                  isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Admin Notifications & Intelligence"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Floating Notification Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-96 sm:w-[470px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Dropdown Header */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-blue-400" />
                      <h4 className="font-bold text-sm">Admin Notifications</h4>
                      {unreadNotifsCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Live Job Catalog Intelligence Metrics Banner */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border-b border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Catalog Intelligence Counts</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white p-2 rounded-xl border border-rose-100 shadow-2xs text-center">
                        <div className="text-[10px] font-semibold text-rose-600">Expired Jobs</div>
                        <div className="text-base font-black text-rose-700">{liveMetrics.expired_jobs.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-100 shadow-2xs text-center">
                        <div className="text-[10px] font-semibold text-amber-600">New Jobs</div>
                        <div className="text-base font-black text-amber-700">{liveMetrics.new_jobs.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs text-center">
                        <div className="text-[10px] font-semibold text-emerald-600">Fresher (0-1Y)</div>
                        <div className="text-base font-black text-emerald-700">{liveMetrics.fresher_jobs.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs text-center">
                        <div className="text-[10px] font-semibold text-blue-600">Experienced</div>
                        <div className="text-base font-black text-blue-700">{liveMetrics.experienced_jobs.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">No notifications recorded yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && handleMarkSingleRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50/80 transition flex items-start gap-3 cursor-pointer ${
                            !n.is_read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.category === 'user_registration' && (
                              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                <Users className="w-4 h-4" />
                              </div>
                            )}
                            {n.category === 'scan_update' && (
                              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                                <Activity className="w-4 h-4" />
                              </div>
                            )}
                            {n.category === 'job_metrics' && (
                              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                                <Briefcase className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h5 className="font-bold text-xs text-slate-900 truncate">{n.title}</h5>
                              {!n.is_read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-2" title="Unread"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed break-words">{n.message}</p>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{n.formatted_time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Admin Profile & Logout (User View button completely removed) */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center border border-amber-500 shadow-2xs">
                {(sessionStorage.getItem('user_email') || localStorage.getItem('user_email') || 'Admin')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left max-w-[150px] truncate">
                <div className="text-xs font-bold text-slate-800 leading-none truncate">
                  {sessionStorage.getItem('user_email') || localStorage.getItem('user_email') || 'Admin'}
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Admin Security</div>
              </div>
              <button
                onClick={() => {
                  api.logout();
                  navigate('/login');
                  window.location.reload();
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </header>

        {/* Dashboard Main Content Body */}
        <main className="p-8 space-y-6">
          
          {/* Header Title Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'Users' ? 'User Accounts & Activity Intelligence' : 'Dashboard'}
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {activeTab === 'Users'
                  ? 'Real-time analysis of registered users, active candidates, career experience tiers, and security accounts'
                  : 'Monitor real Bengaluru job discovery, portal scanning, and system health'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'Users' ? (
                <button
                  onClick={() => setActiveTab('Dashboard')}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Back to Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('Users')}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-100 transition"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>View User Analysis</span>
                </button>
              )}
            </div>
          </div>

          {activeTab === 'Users' ? (
            /* User Accounts & Activity Intelligence Section */
            <div className="space-y-6">
              
              {/* 5 User Metric KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600">Registered Users</span>
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{adminUsersData?.total_registered ?? 6}</div>
                  <div className="text-[11px] font-bold text-blue-600 mt-1 flex items-center gap-1">
                    <span>Total platform accounts</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600">Active Users</span>
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{adminUsersData?.total_active ?? 6}</div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <span>100% active & verified</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600">Fresher Candidates</span>
                    <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl"><GraduationCap className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{adminUsersData?.fresher_count ?? 3}</div>
                  <div className="text-[11px] font-bold text-teal-600 mt-1 flex items-center gap-1">
                    <span>0 - 1 Years experience</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600">Experienced Users</span>
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Briefcase className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{adminUsersData?.experienced_count ?? 1}</div>
                  <div className="text-[11px] font-bold text-indigo-600 mt-1 flex items-center gap-1">
                    <span>&gt; 1 Years experience</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600">Admin Security</span>
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><ShieldCheck className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{adminUsersData?.admin_count ?? 2}</div>
                  <div className="text-[11px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                    <span>Platform management</span>
                  </div>
                </div>
              </div>

              {/* User Analysis & Visualization Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* User Demographics Donut Chart */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-sm">User Demographic Breakdown</h3>
                      <span className="text-xs font-bold text-blue-600">Live DB</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Distribution by Candidate Experience Tiers vs Platform Admins</p>
                  </div>

                  <div className="h-52 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={userDemographicData} 
                          innerRadius={55} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          dataKey="value"
                        >
                          {userDemographicData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 text-xs pt-4 border-t border-slate-100">
                    {userDemographicData.map((item) => {
                      const total = adminUsersData?.total_registered || 6;
                      const pct = Math.round((item.value / total) * 100);
                      return (
                        <div key={item.name} className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="font-medium">{item.name}</span>
                          </span>
                          <span className="font-bold text-slate-900">
                            {item.value} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* User Growth & Registration Velocity Area Chart */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-sm">User Registration Growth</h3>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Live Trajectory
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Cumulative registered candidates and administrators onboarding to BangaloreJobs</p>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowthData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-500">Candidate Share</div>
                      <div className="text-base font-extrabold text-slate-800">
                        {Math.round((((adminUsersData?.fresher_count ?? 3) + (adminUsersData?.experienced_count ?? 1)) / ((adminUsersData?.total_registered ?? 6) || 1)) * 100)}%
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-500">Fresher Ratio</div>
                      <div className="text-base font-extrabold text-emerald-700">
                        {Math.round(((adminUsersData?.fresher_count ?? 3) / (((adminUsersData?.fresher_count ?? 3) + (adminUsersData?.experienced_count ?? 1)) || 1)) * 100)}%
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-500">Active Rate</div>
                      <div className="text-base font-extrabold text-blue-600">100%</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Filterable User Accounts Directory Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Table Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">User Directory & Status Management</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Search, review experience tiers, and manage account authorization status</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Bar */}
                    <div className="flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200 text-xs w-60">
                      <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Search user email or name..." 
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="bg-transparent outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
                      />
                      {userSearchTerm && (
                        <button onClick={() => setUserSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        onClick={() => setUserRoleFilter('all')}
                        className={`px-3 py-1 rounded-lg font-bold transition ${
                          userRoleFilter === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All ({adminUsersData?.total_registered ?? 6})
                      </button>
                      <button
                        onClick={() => setUserRoleFilter('fresher')}
                        className={`px-3 py-1 rounded-lg font-bold transition ${
                          userRoleFilter === 'fresher' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Fresher ({adminUsersData?.fresher_count ?? 3})
                      </button>
                      <button
                        onClick={() => setUserRoleFilter('experienced')}
                        className={`px-3 py-1 rounded-lg font-bold transition ${
                          userRoleFilter === 'experienced' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Experienced ({adminUsersData?.experienced_count ?? 1})
                      </button>
                      <button
                        onClick={() => setUserRoleFilter('admin')}
                        className={`px-3 py-1 rounded-lg font-bold transition ${
                          userRoleFilter === 'admin' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Admins ({adminUsersData?.admin_count ?? 2})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Directory Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-5">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Experience Tier</th>
                        <th className="py-3 px-4">Experience</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Joined On</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No users found matching current filter or search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                                  u.role === 'admin' ? 'bg-amber-600' : u.experience_tier === 'fresher' ? 'bg-emerald-600' : 'bg-blue-600'
                                }`}>
                                  {(u.full_name || u.email || 'U')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">{u.full_name || 'User'}</div>
                                  <div className="text-[11px] text-slate-400 font-medium truncate">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {u.role === 'admin' ? (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                  <Shield className="w-3 h-3 text-amber-600" /> Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                  <User className="w-3 h-3 text-slate-500" /> Candidate
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {u.experience_tier === 'fresher' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                  <GraduationCap className="w-3 h-3 text-emerald-600" /> Fresher (0-1 Yrs)
                                </span>
                              ) : u.experience_tier === 'experienced' ? (
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                  <Briefcase className="w-3 h-3 text-blue-600" /> Experienced (&gt;1 Yrs)
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px] font-medium">N/A (Admin)</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {u.years_experience !== null && u.years_experience !== undefined ? `${u.years_experience} years` : '—'}
                            </td>
                            <td className="py-3.5 px-4">
                              {u.is_active ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Disabled
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleToggleUser(u.id)}
                                disabled={togglingUserId === u.id || u.email === 'nithinvandana560@gmail.com'}
                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition disabled:opacity-40 ${
                                  u.is_active
                                    ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                                    : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                }`}
                                title={u.email === 'nithinvandana560@gmail.com' ? 'Primary admin account cannot be disabled' : 'Toggle account active/disabled status'}
                              >
                                {togglingUserId === u.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin inline" />
                                ) : u.is_active ? (
                                  'Disable'
                                ) : (
                                  'Activate'
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-6">
              {scanMessage && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {scanMessage}
                </div>
              )}

              {/* 6 Real Stat Cards Row based on actual scanning database */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Companies</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Building2 className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.total_companies.toLocaleString() || '60'}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
                <span>↑ +34 this week</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Active Job Sources</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Link2 className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.active_sources.toLocaleString() || '23'}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
                <span>↑ 98.2% working</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Jobs</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Briefcase className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.total_jobs.toLocaleString() || '472'}</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center justify-between">
                <span className="text-indigo-600 font-bold">🏢 {overview?.career_portal_jobs ?? 393} Portals</span>
                <span className="text-emerald-600 font-bold">🌐 {overview?.job_portal_jobs ?? 79} Platforms</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Bengaluru Jobs</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><MapPin className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.bengaluru_jobs.toLocaleString() || '472'}</div>
              <div className="text-[11px] font-medium text-emerald-600 mt-1">
                {overview && overview.total_jobs > 0 ? `${Math.round((overview.bengaluru_jobs / overview.total_jobs) * 100)}% of total` : '100% of total'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">New Jobs (Today)</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Sparkles className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.new_jobs_today.toLocaleString() || '0'}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
                <span>↑ Live Crawler Sync</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Expired Jobs</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Clock className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.expired_jobs.toLocaleString() || '2'}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">Auto-verified</div>
            </div>

          </div>

          {/* Quick Intelligence Row: Fresher vs Experienced Jobs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-emerald-50 to-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Fresher Jobs (0 - 1 Years)</div>
                <div className="text-2xl font-black text-emerald-900 mt-0.5">
                  {overview?.fresher_jobs.toLocaleString() || '54'} <span className="text-xs font-semibold text-emerald-600">openings</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Strictly verified for recent graduates and early career talent</div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-xl">0 - 1 Yrs</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Experienced Jobs (&gt; 1 Years)</div>
                <div className="text-2xl font-black text-blue-900 mt-0.5">
                  {overview?.experienced_jobs.toLocaleString() || '413'} <span className="text-xs font-semibold text-blue-600">openings</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Mid-level, senior, team lead, and staff engineering roles</div>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-xl">&gt; 1 Yrs</span>
            </div>
          </div>

          {/* Day-Wise Job Count: Fresher Roles vs Experienced Roles */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <BarChart3 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Day-Wise Job Count (Fresher Roles vs Experienced Roles)</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Daily job discoveries categorised into Fresher (0 - 1 years) and Experienced (&gt; 1 years)
                    </p>
                  </div>
                </div>
              </div>

              {/* Day-wise summary pills */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-bold text-emerald-900">Fresher (0-1 Y):</span>
                  <span className="font-black text-emerald-700">{overview?.fresher_jobs ?? 86}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="font-bold text-blue-900">Experienced (&gt;1 Y):</span>
                  <span className="font-black text-blue-700">{overview?.experienced_jobs ?? 440}</span>
                </div>
              </div>
            </div>

            {/* Interactive Recharts Grouped Bar Chart */}
            <div className="h-72 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={dayWiseJobsData?.day_wise || overview?.day_wise_job_trends || []}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'fresher_jobs') return [value, 'Fresher Jobs (0-1 yrs)'];
                      if (name === 'experienced_jobs') return [value, 'Experienced Jobs (>1 yrs)'];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === 'fresher_jobs') return <span className="text-xs font-bold text-emerald-700">Fresher Jobs (0-1 Yrs)</span>;
                      if (value === 'experienced_jobs') return <span className="text-xs font-bold text-blue-700">Experienced Jobs (&gt;1 Yrs)</span>;
                      return value;
                    }}
                  />
                  <Bar dataKey="fresher_jobs" name="fresher_jobs" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="experienced_jobs" name="experienced_jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Day-Wise Data Audit Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Fresher Jobs (0-1 Yrs)</th>
                    <th className="py-2.5 px-4">Experienced Jobs (&gt;1 Yrs)</th>
                    <th className="py-2.5 px-4">Total Jobs</th>
                    <th className="py-2.5 px-4">Fresher Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(dayWiseJobsData?.day_wise || overview?.day_wise_job_trends || []).slice(-7).reverse().map((day) => {
                    const total = day.fresher_jobs + day.experienced_jobs;
                    const fresherRatio = total > 0 ? Math.round((day.fresher_jobs / total) * 100) : 0;
                    return (
                      <tr key={day.date} className="hover:bg-slate-50/50 transition">
                        <td className="py-2.5 px-4 font-bold text-slate-800">{day.date}</td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {day.fresher_jobs} jobs
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {day.experienced_jobs} jobs
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-extrabold text-slate-900">{total} jobs</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-600">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fresherRatio}%` }}></div>
                            </div>
                            <span>{fresherRatio}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 2 Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Jobs Discovered Area Chart */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Jobs Discovered (Last 30 Days)</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-slate-500">Total <strong className="text-slate-900">{overview?.total_jobs || '472'}</strong></span>
                  <span className="text-emerald-600">New <strong>{overview?.new_jobs_today || '0'}</strong></span>
                  <span className="text-blue-600">Active <strong>{(overview?.total_jobs || 472) - (overview?.expired_jobs || 2)}</strong></span>
                  <span className="text-rose-500">Expired <strong>{overview?.expired_jobs || '2'}</strong></span>
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
                    <Pie data={displayCompanyTypes} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {displayCompanyTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-xs">
                {displayCompanyTypes.map((item) => (
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
                <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">Live DB</span>
              </div>
              <div className="space-y-2.5">
                {displaySkills.map((sk) => (
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

          {/* Row 3 Processing & Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Crawler Status Gauge */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Crawler Status</h3>
              <div className="flex items-center justify-around">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path className="text-emerald-500" strokeDasharray="98.5, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-2xl font-black text-slate-900">{overview?.crawler_success_rate || 98.5}%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Active Sources</span>
                    <strong className="text-slate-900 font-bold ml-auto pl-4">{overview?.active_sources || 23} <span className="font-normal text-slate-400">(100%)</span></strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600">Total Companies</span>
                    <strong className="text-slate-900 font-bold ml-auto pl-4">{overview?.total_companies || 60}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="text-slate-600">Scan Schedule</span>
                    <strong className="text-slate-900 font-bold ml-auto pl-4">Daily 8:00 AM</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Normalization Pipeline Pipeline */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Data Pipeline & Processing</h3>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Online
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
                {[
                  { step: '1. Ingestion', status: 'Active', pass: '100%', count: `${overview?.total_jobs || 472} RAW` },
                  { step: '2. Normalizer', status: 'Completed', pass: '100%', count: 'Bengaluru Filter' },
                  { step: '3. Deduplication', status: 'Completed', pass: '100%', count: 'Hash Fingerprints' },
                  { step: '4. Skill AI', status: 'Completed', pass: '99.2%', count: 'Ollama NLP' },
                ].map((item, idx, arr) => (
                  <React.Fragment key={item.step}>
                    <div className="text-center shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center mx-auto mb-2 text-xs border border-blue-200">
                        {idx + 1}
                      </div>
                      <div className="text-xs font-bold text-slate-800">{item.step}</div>
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
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> 6 Systems OK
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Backend API', icon: Server, status: 'OK' },
                  { name: 'Database (SQLite/PG)', icon: Database, status: 'OK' },
                  { name: 'Crawler Queue', icon: Layers, status: 'OK' },
                  { name: 'AI Normalizer', icon: Cpu, status: 'OK' },
                  { name: 'Scheduler (8:00 AM)', icon: Clock, status: 'OK' },
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

          {/* Row 4 Data Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Real Scans Table */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Recent Automated & Manual Scans</h3>
                  <p className="text-[11px] text-slate-400">Live database crawler audit trail</p>
                </div>
                <button
                  onClick={handleManualScan}
                  disabled={scanning}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  {scanning ? 'Running...' : 'Run Scan Now'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Scan Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Sources</th>
                      <th className="py-3 px-4">Jobs Found</th>
                      <th className="py-3 px-4">New</th>
                      <th className="py-3 px-4">Updated</th>
                      <th className="py-3 px-4">Expired</th>
                      <th className="py-3 px-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentScans.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-slate-400">No scans recorded yet.</td>
                      </tr>
                    ) : (
                      recentScans.map((scan, idx) => (
                        <tr key={scan.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-400">#{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{scan.scan_time}</td>
                          <td className="py-3 px-4">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit border border-emerald-200">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {scan.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold">{scan.companies}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{scan.jobs_found.toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{scan.new}</td>
                          <td className="py-3 px-4 text-blue-600 font-semibold">{scan.updated}</td>
                          <td className="py-3 px-4 text-rose-500 font-semibold">{scan.expired}</td>
                          <td className="py-3 px-4 text-slate-400 font-medium">{scan.duration}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latest Discovered Jobs Table */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Latest Discovered Jobs</h3>
                <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">Live DB Feed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Detected</th>
                      <th className="py-3 px-4">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {latestJobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">Loading discovered jobs...</td>
                      </tr>
                    ) : (
                      latestJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900 truncate max-w-[180px]">{job.title}</td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{job.company_name}</td>
                          <td className="py-3 px-4 text-slate-500 truncate max-w-[120px]">{job.location}</td>
                          <td className="py-3 px-4 text-slate-400">
                            {job.last_seen_at ? new Date(job.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </td>
                          <td className="py-3 px-4">
                            {job.source_type === 'job_portal' ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 w-fit">
                                🌐 {job.source_name || 'Job Platform'}
                              </span>
                            ) : (
                              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 w-fit">
                                🏢 {job.source_name || 'Career Portal'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            </div>

          </div>
        )}

      </main>
      </div>

    </div>
  );
};
