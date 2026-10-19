import React from 'react';

export const JobDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto animate-shimmer relative overflow-hidden">
      {/* Back button placeholder */}
      <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-7 bg-slate-200 rounded-lg w-72 animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-slate-100 rounded w-28 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="h-11 bg-blue-200 rounded-2xl w-36 animate-pulse" />
        </div>

        {/* Badges line */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="h-6 bg-slate-100 rounded-lg w-24 animate-pulse" />
          <div className="h-6 bg-slate-100 rounded-lg w-28 animate-pulse" />
          <div className="h-6 bg-slate-100 rounded-lg w-20 animate-pulse" />
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-3">
        <div className="h-5 bg-blue-200 rounded w-28 animate-pulse" />
        <div className="h-5 bg-slate-200 rounded w-24 animate-pulse" />
        <div className="h-5 bg-slate-200 rounded w-28 animate-pulse" />
      </div>

      {/* Content Placeholder */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
        <div className="h-5 bg-slate-200 rounded w-1/3 animate-pulse" />
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-11/12 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-4/5 animate-pulse" />
        </div>
        <div className="h-5 bg-slate-200 rounded w-1/4 animate-pulse mt-6" />
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="h-8 bg-slate-100 rounded-xl w-24 animate-pulse" />
          <div className="h-8 bg-slate-100 rounded-xl w-28 animate-pulse" />
          <div className="h-8 bg-slate-100 rounded-xl w-20 animate-pulse" />
          <div className="h-8 bg-slate-100 rounded-xl w-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
