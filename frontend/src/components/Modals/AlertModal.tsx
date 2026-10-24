import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, ShieldAlert, AlertCircle, CheckCircle, Info, UserCheck, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export type AlertType = 'warning' | 'info' | 'error' | 'success';

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
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'amber';
  };
  details?: string;
}

interface AlertModalContextType {
  showAlert: (options: AlertModalOptions | string) => void;
  showAdminRestrictedModal: () => void;
  closeAlert: () => void;
  isOpen: boolean;
}

const AlertModalContext = createContext<AlertModalContextType>({
  showAlert: () => {},
  showAdminRestrictedModal: () => {},
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
      // Check if message is the admin restriction message
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
      });
    }
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
    <AlertModalContext.Provider value={{ showAlert, showAdminRestrictedModal, closeAlert, isOpen }}>
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
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-modal-content">
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
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
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
                    <Info className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 pr-6">
                  {options.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200 mb-1.5">
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

                {options.details && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Role & Application Policy</span>
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
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs"
                  >
                    {options.cancelText || 'Cancel'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition shadow-2xs"
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
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm ${
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
