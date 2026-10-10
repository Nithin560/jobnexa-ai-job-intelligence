import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onToggleSave?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onToggleSave }) => {
  const getCompanyBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'startup': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'mid-size': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'large': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition group relative">
      <div className="flex items-start justify-between gap-4">
        
        {/* Left: Company Logo & Details */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company_name} className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <Briefcase className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/jobs/${job.id}`} className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                {job.title}
              </Link>
              {job.is_new && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> New
                </span>
              )}
              {job.match && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {job.match.score}% Match
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{job.company_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${getCompanyBadgeColor(job.company_type)}`}>
                {job.company_type}
              </span>
            </div>

            {/* Meta info: Location, Experience, Work Mode */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.experience_label}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                {job.work_mode}
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

          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-blue-200"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
