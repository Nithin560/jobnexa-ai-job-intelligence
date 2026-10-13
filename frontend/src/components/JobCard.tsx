import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onToggleSave?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onToggleSave }) => {
  const isExpired = job.status === 'expired' || job.status === 'closed' || job.status === 'stale';

  return (

    <div className={`bg-white rounded-2xl border p-5 transition group relative ${isExpired ? 'border-amber-200 bg-slate-50/50' : 'border-slate-200 hover:shadow-md hover:border-slate-300'}`}>
      <div className="flex items-start justify-between gap-4">
        
        {/* Left: Company Logo & Details */}
        <div className="flex items-start gap-4">
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

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/jobs/${job.id}`} className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                {job.title}
              </Link>
              {isExpired ? (
                <span className="text-amber-700 bg-amber-50 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⚠️ Expired on Career Portal
                </span>
              ) : job.is_new ? (
                <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> New
                </span>
              ) : null}
            </div>

            {/* Company Name & Source Type */}
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 flex-wrap">
              <span className="font-semibold text-slate-800">{job.company_name}</span>
              <span className="text-xs px-2 py-0.5 rounded-md border border-slate-200 text-slate-500 font-medium">
                {job.company_type}
              </span>
              {job.source_type === 'job_portal' ? (
                <span className="border border-slate-200 text-slate-500 text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  🌐 {job.source_name || 'Job Platform'}
                </span>
              ) : (
                <span className="border border-slate-200 text-slate-500 text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  🏢 {job.source_name || 'Company Career Site'}
                </span>
              )}
            </div>

            {/* Hiring Role & Location */}
            <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-600 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-800">{job.hiring_role || job.title}</span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500">Location:</span>
                {job.location.toLowerCase().includes('united states') || job.location.toLowerCase().includes('usa') || job.location.toLowerCase().includes('us remote') ? (
                  <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md text-[11px] inline-flex items-center gap-1 shadow-2xs">
                    🇺🇸 {job.location}
                  </span>
                ) : job.location.toLowerCase().includes('worldwide') || job.location.toLowerCase().includes('anywhere') ? (
                  <span className="font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md text-[11px] inline-flex items-center gap-1 shadow-2xs">
                    🌐 {job.location}
                  </span>
                ) : (
                  <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] inline-flex items-center gap-1 shadow-2xs">
                    🇮🇳 {job.location}
                  </span>
                )}
              </span>
            </div>

            {/* Meta info: Experience, Work Mode */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
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
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-600 text-[11px]">
                {job.work_mode}
              </span>
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-600 text-[11px]">
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
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 2 hours ago
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
