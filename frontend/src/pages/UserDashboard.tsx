import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { JobCard } from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeletons/JobCardSkeleton';
import { TopLoadingBar, useLoadingBar } from '../components/TopLoadingBar';
import { Job } from '../types';
import { 
  LayoutDashboard, User, FileText, Compass, Bookmark, CheckCircle, Bell, Building2, 
  Target, Settings, Edit3, ArrowUpRight, ArrowLeft, Shield, Loader2
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { triggerLoading } = useLoadingBar();
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [saved, setSaved] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved'>('recommended');
  const [loading, setLoading] = useState(true);
  const isAdmin = (sessionStorage.getItem('user_role') || localStorage.getItem('user_role')) === 'admin';

  // Ensure that pressing browser Back button reliably returns directly to Home
  useEffect(() => {
    const handlePopState = () => {
      navigate('/', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const userEmail = sessionStorage.getItem('user_email') || localStorage.getItem('user_email') || 'nithin@example.com';
  const userName = userEmail.split('@')[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const matchesData = await api.getMatches();
        setRecommended(matchesData);
        const savedData = await api.getSavedJobs();
        setSaved(savedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userNavItems = [
    { label: 'Recommended Jobs', icon: Compass, tab: 'recommended' },
    { label: 'Saved Positions', icon: Bookmark, tab: 'saved' },
    { label: 'Candidate Profile & Skills', icon: User, path: '/profile' },
    { label: 'Discovery Blueprint', icon: Target, path: '/strategy' },
  ];

  return (
    <div className="space-y-4 pb-16">
      <TopLoadingBar isLoading={loading} />
      
      {/* Top Back to Home Button */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition group"
          title="Return to Home"
        >
          <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition shadow-2xs">
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
          </div>
          <span>Back to Home</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Switch to Admin Console</span>
          </Link>
        )}
      </div>

      {/* Admin Mode Informational Banner */}
      {isAdmin && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900 shadow-2xs gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Admin Mode Active:</strong> You have full access to explore the Candidate User Dashboard, AI matches, and profile management. (Job applications are disabled for admin accounts).
            </span>
          </div>
          <Link
            to="/admin"
            className="font-bold text-amber-800 hover:text-amber-950 underline shrink-0 whitespace-nowrap"
          >
            Open Admin Panel →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Navigation Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80 mb-2 shadow-2xs group"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Home</span>
          </Link>
          {userNavItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.tab ? activeTab === item.tab : false;

            return (
              <button
                key={item.label}
                onClick={() => {
                  triggerLoading(350);
                  if (item.path) {
                    navigate(item.path);
                  } else if (item.tab) {
                    setActiveTab(item.tab as any);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isItemActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Content Area matching Image 3 */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Welcome Back Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Welcome Back, <span className="capitalize">{userName}</span>!
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Here are the latest job opportunities for you in Bengaluru.
            </p>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition border border-blue-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* 4 Dashboard Stat Cards Grid matching Image 3 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0"><Compass className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-black text-slate-900">{recommended.length || 42}</div>
              <div className="text-xs font-semibold text-slate-500">Recommended</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0"><Bookmark className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-black text-slate-900">{saved.length || 18}</div>
              <div className="text-xs font-semibold text-slate-500">Saved Jobs</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-black text-slate-900">7</div>
              <div className="text-xs font-semibold text-slate-500">Applied Jobs</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0"><Bell className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-black text-slate-900">3</div>
              <div className="text-xs font-semibold text-slate-500">Active Alerts</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                triggerLoading(300);
                setActiveTab('recommended');
              }}
              className={`font-extrabold text-sm pb-3 border-b-2 transition cursor-pointer ${
                activeTab === 'recommended' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Recommended Jobs for You
            </button>
            <button
              onClick={() => {
                triggerLoading(300);
                setActiveTab('saved');
              }}
              className={`font-extrabold text-sm pb-3 border-b-2 transition cursor-pointer ${
                activeTab === 'saved' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Saved Jobs ({saved.length})
            </button>
          </div>

          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View All</span>
        </div>

        {/* Jobs Feed with Match Score Badges */}
        {loading ? (
          <div className="space-y-4">
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Personalizing Recommendations...</div>
                  <div className="text-[11px] text-slate-500 font-medium">Analyzing skill coverage, title match vectors, and verified Bengaluru job vacancies</div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 animate-pulse">Computing Fit...</span>
            </div>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            {(activeTab === 'recommended' ? recommended : saved).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

      </div>

    </div>
  </div>
  );
};
