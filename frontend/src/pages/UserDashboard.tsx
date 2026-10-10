import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { JobCard } from '../components/JobCard';
import { Job } from '../types';
import { 
  LayoutDashboard, User, FileText, Sparkles, Bookmark, CheckCircle, Bell, Building2, 
  Target, Settings, Edit3, ArrowUpRight
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [saved, setSaved] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved'>('recommended');
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('user_email') || 'nithin@example.com';
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
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'My Profile', icon: User, active: false },
    { label: 'Resume', icon: FileText, active: false },
    { label: 'Recommended', icon: Sparkles, active: false },
    { label: 'Saved Jobs', icon: Bookmark, active: false },
    { label: 'Applied Jobs', icon: CheckCircle, active: false },
    { label: 'Job Alerts', icon: Bell, active: false },
    { label: 'Companies', icon: Building2, active: false },
    { label: 'Skill Gap Analysis', icon: Target, active: false },
    { label: 'Account Settings', icon: Settings, active: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
      
      {/* Left Navigation Sidebar matching Image 3 */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-1">
          {userNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                  item.active 
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
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Welcome Back, <span className="capitalize">{userName}</span>!
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Here are the latest job opportunities for you in Bengaluru.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition border border-blue-200 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* 4 Dashboard Stat Cards Grid matching Image 3 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0"><Sparkles className="w-5 h-5" /></div>
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
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0"><Bell className="w-5 h-5" /></div>
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
              onClick={() => setActiveTab('recommended')}
              className={`font-extrabold text-sm pb-3 border-b-2 transition ${
                activeTab === 'recommended' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Recommended Jobs for You
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`font-extrabold text-sm pb-3 border-b-2 transition ${
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
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 font-medium">
            Calculating personalized AI matches...
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
  );
};
