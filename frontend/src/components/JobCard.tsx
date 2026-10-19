import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, ExternalLink, Sparkles, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onToggleSave?: (jobId: string) => void;
}

export const formatJobRealTime = (postedAt?: string, lastSeenAt?: string): string => {
  const raw = postedAt || lastSeenAt;
  if (!raw) return 'Recently';

  try {
    const isoStr = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    
    // Check if same calendar day
    const isToday = 
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = 
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) {
      return `Today, ${timeStr}`;
    }
    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }

    const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return 'Recently';
  }
};

export const JobCard: React.FC<JobCardProps> = ({ job, onToggleSave }) => {
  const isExpired = job.status === 'expired' || job.status === 'closed' || job.status === 'stale';
  const isAdmin = (sessionStorage.getItem('user_role') || localStorage.getItem('user_role')) === 'admin';

  return (
    <div className={`bg-white rounded-2xl border p-5 transition group relative ${isExpired ? 'border-amber-200 bg-slate-50/50' : 'border-slate-200 hover:shadow-md hover:border-slate-300'}`}>
      <div className="flex items-start justify-between gap-4">
        
        {/* Left: Company Logo & Details */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0 p-1.5">
            <img 
              src={
                job.company_logo && !job.company_logo.includes('logo.clearbit.com')
                  ? job.company_logo
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'Job')}&background=2563eb&color=fff&size=128&bold=true`
              } 
              alt={job.company_name} 
              className="w-full h-full object-contain rounded-lg" 
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'Job')}&background=2563eb&color=fff&size=128&bold=true`;
                if (target.src !== fallback) {
                  target.onerror = null;
                  target.src = fallback;
                }
              }} 
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title & Status */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link to={`/jobs/${job.id}`} className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition truncate">
                {job.title}
              </Link>
              {isExpired ? (
                <span className="text-amber-700 bg-amber-50 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  ⚠️ Expired on Career Portal
                </span>
              ) : job.is_new ? (
                <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> New
                </span>
              ) : null}
            </div>

            {/* Row 2: Company Name, Category & IT Role Family */}
            <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-600 flex-wrap sm:flex-nowrap">
              <span className="font-semibold text-slate-800 shrink-0">{job.company_name}</span>
              <span className="text-xs px-2 py-0.5 rounded-md border border-slate-200 text-slate-500 font-medium shrink-0">
                {job.company_type}
              </span>
              {job.it_role_family && (
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md shadow-2xs shrink-0">
                  {job.it_role_family}
                </span>
              )}
            </div>

            {/* Row 3: Verified BLR Unit Badge & Source Badge */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 flex-wrap sm:flex-nowrap">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified BLR Unit ({job.confidence_score || 95}%)
              </span>
              {job.source_type === 'job_portal' ? (
                <span className="border border-slate-200 text-slate-500 text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 shrink-0">
                  🌐 {job.source_name || 'Job Platform'}
                </span>
              ) : (
                <span className="border border-slate-200 text-slate-500 text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 shrink-0">
                  🏢 {job.source_name || 'Company Career Site'}
                </span>
              )}
            </div>

            {/* Row 4: Role and Location on the SAME line with space between them */}
            <div className="flex items-center gap-6 sm:gap-8 mt-2.5 text-xs text-slate-600 flex-wrap sm:flex-nowrap">
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-800">{job.hiring_role || job.title}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] inline-flex items-center gap-1 shadow-2xs">
                  📍 {job.location}
                </span>
              </span>
            </div>

            {/* Row 5: Meta info: Experience, Work Mode */}
            <div className="flex items-center gap-2.5 mt-2 text-xs text-slate-500 flex-wrap sm:flex-nowrap">
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {job.experience_min === 0 && job.experience_max <= 1 ? (
                  <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md text-[11px]">
                    🎓 Fresher ({job.experience_label})
                  </span>
                ) : job.experience_min >= 8 ? (
                  <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md text-[11px]">
                    💼 Lead / Senior ({job.experience_label})
                  </span>
                ) : job.experience_min >= 5 ? (
                  <span className="font-bold text-violet-700 bg-violet-50 border border-violet-200/80 px-2 py-0.5 rounded-md text-[11px]">
                    💼 Senior ({job.experience_label})
                  </span>
                ) : (
                  <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                    💼 {job.experience_label}
                  </span>
                )}
              </span>
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-600 text-[11px] shrink-0">
                {job.work_mode}
              </span>
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-600 text-[11px] shrink-0">
                {job.employment_type}
              </span>
            </div>

            {/* Skill Tags */}
            <div className="flex items-center gap-1.5 mt-3.5 flex-wrap">
              {job.skills.slice(0, 5).map((skill, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-xs text-slate-400 font-medium pl-1">+{job.skills.length - 5} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col items-end justify-between h-full gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs text-slate-500 font-medium flex items-center gap-1 whitespace-nowrap"
              title={`Verification timestamp: ${job.last_seen_at || job.posted_at || 'Recent'}`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatJobRealTime(job.posted_at, job.last_seen_at)}</span>
            </span>
            <button
              onClick={() => onToggleSave && onToggleSave(job.id)}
              className={`p-2 rounded-xl border transition ${job.is_saved ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          {isExpired ? (
            <button
              disabled
              className="px-4 py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center gap-1.5 border border-slate-200"
              title="Position removed from company career portal (application closed)"
            >
              <span>Application Closed</span>
            </button>
          ) : isAdmin ? (
            <button
              type="button"
              onClick={() => {
                alert("Application restricted: Admin accounts are not allowed to apply for jobs. Please use a candidate account to apply.");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-200 hover:border-amber-300 cursor-not-allowed shadow-2xs"
              title="Admins cannot apply for jobs. Please log in with a candidate account to apply."
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Admin (Cannot Apply)</span>
            </button>
          ) : (
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-blue-200"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

      </div>

    </div>
  );
};
