import React from 'react';

export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-shimmer relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        
        {/* Left: Logo & Title Placeholders */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse shrink-0" />

          <div className="space-y-2 flex-1 min-w-0">
            {/* Title */}
            <div className="h-5 bg-slate-200 rounded-md w-3/5 animate-pulse" />
            
            {/* Role & Location in same line */}
            <div className="flex items-center gap-3">
              <div className="h-3.5 bg-slate-100 rounded w-28 animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded w-32 animate-pulse" />
            </div>

            {/* Tags / Experience / Mode */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-5 bg-slate-100 rounded-lg w-20 animate-pulse" />
              <div className="h-5 bg-slate-100 rounded-lg w-16 animate-pulse" />
              <div className="h-5 bg-slate-100 rounded-lg w-24 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right: Salary & Match Badge Placeholder */}
        <div className="shrink-0 space-y-2 text-right hidden sm:block">
          <div className="h-5 bg-slate-200 rounded-md w-24 ml-auto animate-pulse" />
          <div className="h-6 bg-emerald-100/70 rounded-full w-20 ml-auto animate-pulse" />
        </div>
      </div>

      {/* Description lines */}
      <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100">
        <div className="h-3.5 bg-slate-100 rounded w-full animate-pulse" />
        <div className="h-3.5 bg-slate-100 rounded w-4/5 animate-pulse" />
      </div>

      {/* Skills list placeholders */}
      <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
        <div className="h-6 bg-slate-100 rounded-lg w-16 animate-pulse" />
        <div className="h-6 bg-slate-100 rounded-lg w-20 animate-pulse" />
        <div className="h-6 bg-slate-100 rounded-lg w-14 animate-pulse" />
        <div className="h-6 bg-slate-100 rounded-lg w-24 animate-pulse" />
        <div className="h-6 bg-slate-100 rounded-lg w-16 animate-pulse" />
      </div>

      {/* Bottom Bar: Timestamp and Apply Button */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-3.5 bg-slate-200 rounded w-24 animate-pulse" />
          <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
        </div>
        <div className="h-9 bg-blue-200/80 rounded-xl w-28 animate-pulse" />
      </div>
    </div>
  );
};
