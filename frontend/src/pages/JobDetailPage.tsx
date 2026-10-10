import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Job } from '../types';
import { MatchBadge } from '../components/MatchBadge';
import { SkillGapAnalysis } from '../components/SkillGapAnalysis';
import { Briefcase, MapPin, ExternalLink, Bookmark, ArrowLeft, Building, Clock, CheckCircle } from 'lucide-react';

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

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Main Detail Header Box matching Image 2 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-10 h-10 object-contain" />
              ) : (
                <Briefcase className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{job.company_name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium border border-blue-200">
                  {job.company_type}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.experience_label}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.work_mode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition shadow-md shadow-blue-200 flex items-center gap-2"
            >
              <span>Apply on Company Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
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
