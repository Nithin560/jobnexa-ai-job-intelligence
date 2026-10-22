import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface LoadingBarContextType {
  triggerLoading: (durationMs?: number) => void;
  startLoading: () => void;
  stopLoading: () => void;
  isLoading: boolean;
}

const LoadingBarContext = createContext<LoadingBarContextType>({
  triggerLoading: () => {},
  startLoading: () => {},
  stopLoading: () => {},
  isLoading: false,
});

export const useLoadingBar = () => useContext(LoadingBarContext);

interface TopLoadingBarProps {
  isLoading?: boolean;
}

export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ isLoading = true }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-slate-100/30 overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 animate-top-loader shadow-sm shadow-blue-500/50" />
    </div>
  );
};

export const LoadingBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const triggerLoading = useCallback((durationMs = 450) => {
    clearTimers();
    setVisible(true);
    setProgress(30);

    const t1 = setTimeout(() => {
      setProgress(70);
    }, Math.floor(durationMs * 0.3));

    const t2 = setTimeout(() => {
      setProgress(92);
    }, Math.floor(durationMs * 0.7));

    const t3 = setTimeout(() => {
      setProgress(100);
    }, durationMs);

    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, durationMs + 220);

    timerRef.current = [t1, t2, t3, t4];
  }, []);

  const startLoading = useCallback(() => {
    clearTimers();
    setManualLoading(true);
    setVisible(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(65), 200);
    const t2 = setTimeout(() => setProgress(85), 600);
    timerRef.current = [t1, t2];
  }, []);

  const stopLoading = useCallback(() => {
    clearTimers();
    setProgress(100);
    const t1 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      setManualLoading(false);
    }, 220);
    timerRef.current = [t1];
  }, []);

  // Automatically trigger loading bar on every single route and query param change
  useEffect(() => {
    triggerLoading(450);
    return () => clearTimers();
  }, [location.pathname, location.search, location.key, triggerLoading]);

  const showBar = visible || manualLoading;

  return (
    <LoadingBarContext.Provider value={{ triggerLoading, startLoading, stopLoading, isLoading: showBar }}>
      {showBar && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3.5px] bg-transparent pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 shadow-md shadow-blue-500/60 relative"
            style={{
              width: `${progress}%`,
              opacity: progress === 100 ? 0 : 1,
              transition: progress === 100 
                ? 'width 150ms ease-out, opacity 250ms 100ms' 
                : 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Glowing head light at the leading edge */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-white/40 blur-[2px] transform translate-x-1" />
          </div>
        </div>
      )}
      {children}
    </LoadingBarContext.Provider>
  );
};
