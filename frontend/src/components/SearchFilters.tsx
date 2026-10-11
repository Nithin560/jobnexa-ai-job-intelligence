import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    source_type?: string;
    work_mode?: string;
    company_type?: string;
    employment_type?: string;
    experience_level?: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange, onClear }) => {
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
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
          {['On-site (15,842)', 'Hybrid (6,231)', 'Remote (2,769)'].map((mode) => {
            const rawVal = mode.split(' ')[0];
            return (
              <label key={mode} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
                <input
                  type="radio"
                  name="work_mode"
                  checked={filters.work_mode === rawVal}
                  onChange={() => onFilterChange('work_mode', rawVal)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>{mode}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Experience Level</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {[
            { label: 'Fresher (4,231)', val: '0' },
            { label: '1-3 years (9,842)', val: '1-3' },
            { label: '3-5 years (6,231)', val: '3-5' },
            { label: '5-10 years (3,842)', val: '5-10' },
            { label: '10+ years (696)', val: '10+' },
          ].map((exp) => (
            <label key={exp.val} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="exp_level"
                checked={filters.experience_level === exp.val}
                onChange={() => onFilterChange('experience_level', exp.val)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>{exp.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Company Type */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Company Type</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {[
            { label: 'All Companies', val: '' },
            { label: 'Startups & Scale-ups (111)', val: 'Startup' },
            { label: 'Mid-Market Companies (52)', val: 'Mid-size' },
            { label: 'Enterprise & MNCs (309)', val: 'Enterprise' },
          ].map((type) => (
            <label key={type.val} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="company_type"
                checked={filters.company_type === type.val || (!filters.company_type && type.val === '')}
                onChange={() => onFilterChange('company_type', type.val)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className={type.val ? '' : 'font-medium'}>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Job Type</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {['Full-time (18,432)', 'Part-time (1,024)', 'Contract (2,843)', 'Internship (2,543)'].map((etype) => {
            const rawVal = etype.split(' ')[0];
            return (
              <label key={etype} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
                <input
                  type="radio"
                  name="employment_type"
                  checked={filters.employment_type === rawVal}
                  onChange={() => onFilterChange('employment_type', rawVal)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>{etype}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        onClick={onClear}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm shadow-blue-200"
      >
        Apply Filters
      </button>

    </div>
  );
};
