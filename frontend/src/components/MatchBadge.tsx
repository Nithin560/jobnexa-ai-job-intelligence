import React from 'react';
import { MatchBreakdown } from '../types';

interface MatchBadgeProps {
  match?: MatchBreakdown;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ match }) => {
  if (!match) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (score >= 75) return 'text-blue-600 border-blue-500 bg-blue-50';
    return 'text-amber-600 border-amber-500 bg-amber-50';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-6">
        
        {/* Circle Ring Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500 transition-all duration-1000 ease-out"
              strokeDasharray={`${match.score}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 leading-none">{match.score}%</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Overall Match</span>
          </div>
        </div>

        {/* Component Bars */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Skills Match</span>
              <span>{match.skills_match_percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${match.skills_match_percent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Experience Match</span>
              <span>{match.experience_match_percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${match.experience_match_percent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Location Match</span>
              <span>{match.location_match_percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${match.location_match_percent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Role Match</span>
              <span>{match.role_match_percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${match.role_match_percent}%` }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
