import React from 'react';
import { Filter, RotateCcw, GraduationCap } from 'lucide-react';
import { MarketInsights } from '../types';

interface SearchFiltersProps {
  filters: {
    source_type?: string;
    work_mode?: string;
    company_type?: string;
    employment_type?: string;
    experience_level?: string;
  };
  insights?: MarketInsights | null;
  activeTier?: 'all' | 'fresher' | 'experienced';
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  filters, 
  insights, 
  activeTier,
  onFilterChange, 
  onClear 
}) => {
  const effectiveTier = activeTier || sessionStorage.getItem('user_experience_tier') || 'all';
  // Helper to resolve experience tier count from live insights or exact database counts
  const getExpCount = (tierName: string, defaultVal: number) => {
    if (!insights?.experience_breakdown) return defaultVal;
    const item = insights.experience_breakdown.find((b) => b.name === tierName);
    return item ? item.count : defaultVal;
  };

  const workModeOptions = [
    { label: 'On-site', count: insights?.work_modes?.['On-site'] ?? 200, val: 'On-site' },
    { label: 'Hybrid', count: insights?.work_modes?.['Hybrid'] ?? 126, val: 'Hybrid' },
    { label: 'Remote', count: insights?.work_modes?.['Remote'] ?? 146, val: 'Remote' },
  ];

  const experienceOptions = [
    { label: 'Fresher (0 - 1 years)', count: getExpCount('Fresher', 54), val: '0' },
    { label: '1-3 years', count: getExpCount('1-3 years', 39), val: '1-3' },
    { label: '3-5 years', count: getExpCount('3-5 years', 53), val: '3-5' },
    { label: '5-10 years', count: getExpCount('5-10 years', 151), val: '5-10' },
    { label: '10+ years', count: getExpCount('10+ years', 59), val: '10+' },
  ];

  const companyTypeOptions = [
    { label: 'All Companies', count: null, val: '' },
    { label: 'Startups & Scale-ups', count: insights?.company_tiers?.['Startup'] ?? 111, val: 'Startup' },
    { label: 'Mid-Market Enterprises', count: insights?.company_tiers?.['Mid-size'] ?? 52, val: 'Mid-size' },
    { label: 'Enterprise & MNCs', count: insights?.company_tiers?.['Enterprise'] ?? 309, val: 'Enterprise' },
  ];

  const jobTypeOptions = [
    { label: 'Full-time', count: insights?.total_jobs ?? 472, val: 'Full-time' },
    { label: 'Part-time', count: 0, val: 'Part-time' },
    { label: 'Contract', count: 0, val: 'Contract' },
    { label: 'Internship', count: 0, val: 'Internship' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Clear All
        </button>
      </div>

      {/* Job Source */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Job Source</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {[
            { label: 'All Sources', val: '' },
            { label: '🏢 Company Career Sites', val: 'career_portal' },
            { label: '🌐 Job Platforms', val: 'job_portal' },
          ].map((src) => (
            <label key={src.val} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="source_type"
                checked={filters.source_type === src.val || (!filters.source_type && src.val === '')}
                onChange={() => onFilterChange('source_type', src.val)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className={src.val ? 'font-medium' : ''}>{src.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Work Mode</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {workModeOptions.map((mode) => (
            <label key={mode.val} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="work_mode"
                checked={filters.work_mode === mode.val}
                onChange={() => onFilterChange('work_mode', filters.work_mode === mode.val ? '' : mode.val)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>{mode.label} ({mode.count.toLocaleString()})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level (Tailored to logged-in user tier) */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Experience Level</h4>
        {effectiveTier === 'fresher' ? (
          <div className="bg-blue-50/80 border border-blue-200 text-blue-900 rounded-xl p-3 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Fresher (0 - 1 years)
            </span>
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {getExpCount('Fresher', 54)} jobs
            </span>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-slate-600">
            {experienceOptions
              .filter(exp => effectiveTier === 'experienced' ? exp.val !== '0' : true)
              .map((exp) => (
                <label key={exp.val} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
                  <input
                    type="radio"
                    name="exp_level"
                    checked={filters.experience_level === exp.val}
                    onChange={() => onFilterChange('experience_level', filters.experience_level === exp.val ? '' : exp.val)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>{exp.label} ({exp.count.toLocaleString()})</span>
                </label>
              ))}
          </div>
        )}
      </div>

      {/* Company Type */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Company Type</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {companyTypeOptions.map((type) => (
            <label key={type.val} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="company_type"
                checked={filters.company_type === type.val || (!filters.company_type && type.val === '')}
                onChange={() => onFilterChange('company_type', type.val)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className={type.val ? '' : 'font-medium'}>
                {type.label} {type.count !== null ? `(${type.count.toLocaleString()})` : ''}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Job Type</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {jobTypeOptions.map((etype) => (
            <label key={etype.val} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="employment_type"
                checked={filters.employment_type === etype.val}
                onChange={() => onFilterChange('employment_type', filters.employment_type === etype.val ? '' : etype.val)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>{etype.label} ({etype.count.toLocaleString()})</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onClear}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm shadow-blue-200"
      >
        Clear / Reset Filters
      </button>

    </div>
  );
};
