import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Job } from '../types';
import { MatchBadge } from '../components/MatchBadge';
import { SkillGapAnalysis } from '../components/SkillGapAnalysis';
import { formatJobRealTime } from '../components/JobCard';
import { Briefcase, MapPin, ExternalLink, Bookmark, ArrowLeft, Building, Clock, CheckCircle, ShieldCheck } from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'match' | 'company'>('match');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getJobDetail(id);
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">Loading job details...</div>;
  }

  if (!job) {
    return <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-600">Job listing not found.</div>;
  }

  const isExpired = job.status === 'expired' || job.status === 'closed' || job.status === 'stale';

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Expired Warning Banner if listing is expired */}
      {isExpired && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center gap-3.5 shadow-xs">
          <div className="text-2xl shrink-0">⚠️</div>
          <div>
            <div className="font-bold text-sm text-amber-900">Position Expired / Application Closed</div>
            <div className="text-xs text-amber-700 font-medium mt-0.5">
              This job posting has been archived because it is no longer listed on the employer's official career portal or job website.
            </div>
          </div>
        </div>
      )}

      {/* Main Detail Header Box matching Image 2 */}
      <div className={`bg-white rounded-3xl border p-8 shadow-sm space-y-6 ${isExpired ? 'border-amber-200 bg-slate-50/30' : 'border-slate-200'}`}>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 p-2 overflow-hidden">
              <img 
                src={
                  job.company_logo && !job.company_logo.includes('logo.clearbit.com')
                    ? job.company_logo
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'Job')}&background=2563eb&color=fff&size=128&bold=true`
                } 
                alt={job.company_name} 
                className="w-full h-full object-contain rounded-xl" 
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
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                {isExpired && (
                  <span className="text-amber-800 bg-amber-100 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Expired
                  </span>
                )}
              </div>
              {/* Row 2: Company Name, Category & IT Role Family */}
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 flex-wrap">
                <span className="font-semibold text-slate-800">{job.company_name}</span>
                <span className="text-xs px-2 py-0.5 rounded font-medium border border-slate-200 text-slate-500">
                  {job.company_type}
                </span>
                {job.it_role_family && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                    {job.it_role_family}
                  </span>
                )}
              </div>

              {/* Row 3: Verified BLR Unit Badge & Source Badge */}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified BLR Unit ({job.confidence_score || 95}%)
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

              {/* Row 4: Hiring Role & Location on the SAME line with space between them */}
              <div className="flex items-center gap-6 sm:gap-8 mt-2.5 text-xs text-slate-600 flex-wrap">
                <span className="inline-flex items-center gap-1.5 shrink-0">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500">Role:</span>
                  <span className="font-semibold text-slate-800">{job.hiring_role || job.title}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 shrink-0">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] inline-flex items-center gap-1 shadow-2xs">
                    📍 {job.location}
                  </span>
                </span>
              </div>

              {/* Row 5: Meta info & Live Real Time */}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {job.experience_label}</span>
                <span>{job.work_mode}</span>
                <span>{job.employment_type}</span>
                <span className="text-slate-300">|</span>
                <span 
                  className="flex items-center gap-1 text-slate-600 font-medium"
                  title={`Verification timestamp: ${job.last_seen_at || job.posted_at || 'Recent'}`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatJobRealTime(job.posted_at, job.last_seen_at)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isExpired ? (
              <button
                disabled
                className="px-6 py-3 bg-slate-100 text-slate-400 font-bold text-sm rounded-2xl border border-slate-200 cursor-not-allowed flex items-center gap-2"
                title="Position removed from company career portal (application closed)"
              >
                <span>Application Closed</span>
              </button>
            ) : (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition shadow-md shadow-blue-200 flex items-center gap-2"
              >
                <span>{job.source_type === 'job_portal' ? `Apply via ${job.source_name || 'Job Platform'}` : `Apply on ${job.company_name} Careers`}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

        </div>


        {/* Tabbed Navigation matching Image 2 */}
        <div className="flex items-center gap-6 border-b border-slate-100 pt-4">
          {['details', 'match', 'company'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`font-bold text-sm pb-3 border-b-2 capitalize transition ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              {tab === 'match' ? 'Match Analysis' : tab === 'details' ? 'Job Details' : 'Company Info'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'match' && (
        <div className="space-y-6">
          <MatchBadge match={job.match} />
          <SkillGapAnalysis match={job.match} jobSkills={job.skills} />
        </div>
      )}

      {activeTab === 'details' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Job Description</h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">About {job.company_name}</h3>
          <p className="text-sm text-slate-600">Official Careers Page: <a href={job.company_careers_url || '#'} target="_blank" className="text-blue-600 underline font-semibold">{job.company_careers_url || job.apply_url}</a></p>
        </div>
      )}

    </div>
  );
};
