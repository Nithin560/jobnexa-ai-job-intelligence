import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, ShieldAlert, AlertCircle, CheckCircle, Info, UserCheck, ArrowRight, Sparkles, HelpCircle, Compass, MapPin } from 'lucide-react';
import { api } from '../../api/client';

export type AlertType = 'warning' | 'info' | 'error' | 'success';

export interface AlertModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'amber';
}

export interface PreviewSpot {
  title: string;
  tag: string;
  description: string;
}

export interface AlertModalOptions {
  title?: string;
  message: string;
  type?: AlertType;
  badge?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  actionButton?: AlertModalAction;
  details?: string;
  previewSpots?: PreviewSpot[];
}

export interface ConfirmModalOptions {
  title: string;
  message: string;
  badge?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: AlertType;
  details?: string;
}

interface AlertModalContextType {
  showAlert: (options: AlertModalOptions | string) => void;
  showSuccess: (title: string, message: string, action?: AlertModalAction, details?: string) => void;
  showError: (title: string, message: string, details?: string) => void;
  showWarning: (title: string, message: string, details?: string) => void;
  showInfo: (title: string, message: string, action?: AlertModalAction) => void;
  showConfirm: (options: ConfirmModalOptions) => void;
  showAdminRestrictedModal: () => void;
  showProfileUpdatedModal: (options: {
    targetTitle: string;
    skillsCount: number;
    experienceYears: number;
    onContinue?: () => void;
  }) => void;
  showComingSoonPlacesToVisitModal: (role?: 'candidate' | 'admin' | 'guest') => void;
  closeAlert: () => void;
  isOpen: boolean;
}

const AlertModalContext = createContext<AlertModalContextType>({
  showAlert: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
  showConfirm: () => {},
  showAdminRestrictedModal: () => {},
  showProfileUpdatedModal: () => {},
  showComingSoonPlacesToVisitModal: () => {},
  closeAlert: () => {},
  isOpen: false,
});

export const useAlertModal = () => useContext(AlertModalContext);

export const AlertModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertModalOptions>({
    title: 'Notice',
    message: '',
    type: 'info',
    confirmText: 'OK',
  });

  const closeAlert = useCallback(() => {
    setIsOpen(false);
    if (options.onCancel) {
      options.onCancel();
    }
  }, [options]);

  const showAlert = useCallback((opts: AlertModalOptions | string) => {
    if (typeof opts === 'string') {
      if (opts.toLowerCase().includes('admin accounts are not allowed to apply') || opts.toLowerCase().includes('application restricted')) {
        showAdminRestrictedModal();
        return;
      }
      setOptions({
        title: 'Notice',
        message: opts,
        type: 'info',
        confirmText: 'Got It',
      });
    } else {
      setOptions({
        title: opts.title || (opts.type === 'error' ? 'Error' : opts.type === 'warning' ? 'Warning' : 'Notice'),
        message: opts.message,
        type: opts.type || 'info',
        badge: opts.badge,
        confirmText: opts.confirmText || 'Got It',
        cancelText: opts.cancelText,
        showCancel: opts.showCancel,
        onConfirm: opts.onConfirm,
        onCancel: opts.onCancel,
        actionButton: opts.actionButton,
        details: opts.details,
        previewSpots: opts.previewSpots,
      });
    }
    setIsOpen(true);
  }, []);

  const showSuccess = useCallback((title: string, message: string, action?: AlertModalAction, details?: string) => {
    setOptions({
      title,
      message,
      type: 'success',
      badge: 'Action Completed',
      confirmText: 'Got It',
      actionButton: action,
      details,
    });
    setIsOpen(true);
  }, []);

  const showError = useCallback((title: string, message: string, details?: string) => {
    setOptions({
      title,
      message,
      type: 'error',
      badge: 'Attention Needed',
      confirmText: 'Dismiss',
      details,
    });
    setIsOpen(true);
  }, []);

  const showWarning = useCallback((title: string, message: string, details?: string) => {
    setOptions({
      title,
      message,
      type: 'warning',
      badge: 'System Notice',
      confirmText: 'Understood',
      details,
    });
    setIsOpen(true);
  }, []);

  const showInfo = useCallback((title: string, message: string, action?: AlertModalAction) => {
    setOptions({
      title,
      message,
      type: 'info',
      badge: 'Notification',
      confirmText: 'Got It',
      actionButton: action,
    });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((opts: ConfirmModalOptions) => {
    setOptions({
      title: opts.title,
      message: opts.message,
      type: opts.type || 'warning',
      badge: opts.badge || 'Confirmation Required',
      confirmText: opts.confirmText || 'Confirm',
      cancelText: opts.cancelText || 'Cancel',
      showCancel: true,
      onConfirm: opts.onConfirm,
      onCancel: opts.onCancel,
      details: opts.details,
    });
    setIsOpen(true);
  }, []);

  const showAdminRestrictedModal = useCallback(() => {
    setOptions({
      title: 'Application Restricted',
      badge: 'Admin Access Control',
      message: 'Admin accounts are not allowed to apply for jobs. Please use a candidate account to apply.',
      type: 'warning',
      details: 'Administrator accounts possess platform monitoring, scanner execution, and source governance privileges. To submit job applications, save positions, and manage candidate resumes, please switch to a verified candidate profile.',
      confirmText: 'Understood',
      actionButton: {
        label: 'Switch to Candidate Account',
        variant: 'primary',
        onClick: async () => {
          try {
            await api.quickLoginAsCandidate();
            setIsOpen(false);
            window.location.reload();
          } catch {
            setIsOpen(false);
            window.location.href = '/login';
          }
        },
      },
    });
    setIsOpen(true);
  }, []);

  const showProfileUpdatedModal = useCallback((opts: {
    targetTitle: string;
    skillsCount: number;
    experienceYears: number;
    onContinue?: () => void;
  }) => {
    setOptions({
      title: 'Profile Updated Successfully!',
      badge: 'Candidate Profile Saved',
      message: `Your career profile for "${opts.targetTitle}" with ${opts.skillsCount} skills and ${opts.experienceYears}y experience has been updated. Personalized matching is now active for Bengaluru tech jobs!`,
      type: 'success',
      details: 'Our semantic skill matching engine automatically recalculates fit vectors across direct company ATS portals (Greenhouse, Lever, Ashby, Workday) and startup sources (Wellfound, LinkedIn, Glassdoor).',
      confirmText: 'Stay on Profile',
      actionButton: {
        label: 'Explore Matching Jobs',
        variant: 'primary',
        onClick: () => {
          setIsOpen(false);
          if (opts.onContinue) {
            opts.onContinue();
          } else {
            window.location.href = '/';
          }
        },
      },
    });
    setIsOpen(true);
  }, []);

  const showComingSoonPlacesToVisitModal = useCallback((role: 'candidate' | 'admin' | 'guest' = 'candidate') => {
    setOptions({
      title: 'Places to Visit in Bengaluru (Coming Soon!)',
      badge: role === 'admin' ? 'Admin Preview • Module In Planning' : 'Upcoming Feature • Experienced Accounts',
      message: 'We are introducing an exclusive "Places to Visit" weekend discovery guide for experienced tech professionals in Bengaluru! Rejuvenate outside work hours with curated weekend getaways, nature trails, tech hangouts, and relaxation spots across the city.',
      type: 'info',
      previewSpots: [
        { title: 'Nandi Hills & Skandagiri', tag: 'Sunrise & Treks', description: 'Breathtaking sunrise viewpoints, cycling routes, and cloud-walk trails (60 km from ORR tech corridor).' },
        { title: 'Cubbon Park & MG Road', tag: 'City Green & Cafes', description: '300-acre green canopy, colonial heritage avenues, bookstores, and tech cafes in the city center.' },
        { title: 'Bannerghatta National Park', tag: 'Wildlife Safari', description: 'Tiger & lion safaris, butterfly conservatory, and nature reserve (22 km from Electronic City).' },
        { title: 'Coorg & Mysore Escapes', tag: 'Weekend Road Trips', description: 'Lush coffee plantations, heritage palaces, and waterfalls for scenic 2-day weekend retreats.' }
      ],
      details: role === 'admin'
        ? 'Admin curation tools for managing weekend destinations, travel distances from tech parks, and member perks are launching in the upcoming release.'
        : 'This feature will be accessible directly inside your Experienced Account navigation to provide personalized weekend work-life balance escapes.',
      confirmText: 'Got It',
      actionButton: {
        label: role === 'admin' ? 'View Admin Console' : 'Explore Tech Jobs',
        variant: 'primary',
        onClick: () => {
          setIsOpen(false);
        }
      }
    });
    setIsOpen(true);
  }, []);

  // Intercept native window.alert so no unhandled alert creates an ugly browser popup
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      showAlert(String(msg || ''));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeAlert();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAlert]);

  const handleConfirm = () => {
    if (options.onConfirm) {
      options.onConfirm();
    }
    closeAlert();
  };

  return (
    <AlertModalContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        showAdminRestrictedModal,
        showProfileUpdatedModal,
        showComingSoonPlacesToVisitModal,
        closeAlert,
        isOpen,
      }}
    >
      {children}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAlert();
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-modal-content">
            {/* Top Color Accent Line */}
            <div
              className={`h-1.5 w-full ${
                options.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500'
                  : options.type === 'error'
                  ? 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-500'
                  : options.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500'
              }`}
            />

            {/* Close 'X' Button at Top-Right */}
            <button
              type="button"
              onClick={closeAlert}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7">
              {/* Header Icon & Badge */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                    options.type === 'warning'
                      ? 'bg-amber-50 border-amber-200/80 text-amber-600'
                      : options.type === 'error'
                      ? 'bg-rose-50 border-rose-200/80 text-rose-600'
                      : options.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200/80 text-emerald-600'
                      : 'bg-blue-50 border-blue-200/80 text-blue-600'
                  }`}
                >
                  {options.type === 'warning' ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : options.type === 'error' ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : options.type === 'success' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Compass className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 pr-6">
                  {options.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200 mb-1.5 shadow-2xs">
                      {options.badge}
                    </span>
                  )}
                  <h3
                    id="alert-modal-title"
                    className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug"
                  >
                    {options.title}
                  </h3>
                </div>
              </div>

              {/* Message Body */}
              <div className="mt-4 space-y-3">
                <p className="text-slate-700 text-sm font-medium leading-relaxed">
                  {options.message}
                </p>

                {/* Optional Preview Spots */}
                {options.previewSpots && options.previewSpots.length > 0 && (
                  <div className="space-y-2 mt-3 pt-1">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Curated Weekend Spots Preview</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {options.previewSpots.map((spot, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition text-left">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-slate-800 truncate">{spot.title}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100/70 text-blue-700 border border-blue-200 shrink-0">{spot.tag}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{spot.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {options.details && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Feature Blueprint & Release Status</span>
                    </div>
                    <p className="text-slate-500">
                      {options.details}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                {options.showCancel && (
                  <button
                    type="button"
                    onClick={closeAlert}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
                  >
                    {options.cancelText || 'Cancel'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition shadow-2xs cursor-pointer"
                >
                  {options.confirmText || 'Got It'}
                </button>

                {options.actionButton && (
                  <button
                    type="button"
                    onClick={() => {
                      if (options.actionButton) {
                        options.actionButton.onClick();
                      }
                    }}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                      options.actionButton.variant === 'amber'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                    }`}
                  >
                    <span>{options.actionButton.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertModalContext.Provider>
  );
};
