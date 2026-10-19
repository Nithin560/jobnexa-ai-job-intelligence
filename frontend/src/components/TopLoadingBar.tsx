import React from 'react';

interface TopLoadingBarProps {
  isLoading: boolean;
}

export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-100/30 overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 animate-top-loader shadow-sm shadow-blue-500/50" />
    </div>
  );
};
