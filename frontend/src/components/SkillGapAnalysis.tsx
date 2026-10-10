import React from 'react';
import { Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { MatchBreakdown } from '../types';

interface SkillGapAnalysisProps {
  match?: MatchBreakdown;
  jobSkills: string[];
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ match, jobSkills }) => {
  const matched = match?.matched_skills || [];
  const missing = match?.missing_skills || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-bold text-slate-900 text-base">Your Skills vs Job Requirements</h3>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Matched</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Missing</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span> Optional</span>
        </div>
      </div>

      {/* Skill Chips Grid */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {jobSkills.map((skill, idx) => {
          const isMatched = matched.includes(skill);
          const isMissing = missing.includes(skill);

          if (isMatched) {
            return (
              <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> {skill}
              </span>
            );
          } else if (isMissing) {
            return (
              <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <X className="w-3.5 h-3.5 text-rose-600" /> {skill}
              </span>
            );
          } else {
            return (
              <span key={idx} className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl">
                {skill} (Optional)
              </span>
            );
          }
        })}
      </div>

      {/* Skill Gap Insights Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Skill Gap Analysis</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            {missing.length > 0 ? (
              <>You are a strong match! Focus on adding <strong className="font-semibold">{missing.join(', ')}</strong> to your profile or learning roadmap to increase your selection probability.</>
            ) : (
              <>You possess 100% of the required skills for this position! We recommend applying immediately on the employer's website.</>
            )}
          </p>
        </div>
      </div>

    </div>
  );
};
