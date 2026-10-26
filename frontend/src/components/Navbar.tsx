import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, MapPin, User, LogOut, Shield, Compass, 
  Rocket, LayoutDashboard, Menu, X, Building2 
} from 'lucide-react';
import { api, isUserAuthenticated } from '../api/client';
import { useLoadingBar } from './TopLoadingBar';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerLoading } = useLoadingBar();
  const authenticated = isUserAuthenticated();
  const userRole = sessionStorage.getItem('user_role');
  const userEmail = sessionStorage.getItem('user_email');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    api.logout();
    navigate('/login');
    window.location.reload();
  };

  const handleSwitchToAdmin = async () => {
    try {
      sessionStorage.setItem('trigger_admin_places_popup', 'true');
      await api.quickLoginAsAdmin();
      navigate('/admin', { replace: true });
      window.location.reload();
    } catch (e) {
      sessionStorage.setItem('trigger_admin_places_popup', 'true');
      navigate('/admin', { replace: true });
    }
  };

  const handleSwitchToCandidate = async () => {
    try {
      await api.quickLoginAsCandidate();
      navigate('/', { replace: true });
      window.location.reload();
    } catch (e) {
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left Side: Brand Identity & Nav Sections Grouped Together */}
        <div className="flex items-center gap-3 lg:gap-6 min-w-0">
          <Link
            to={authenticated ? "/" : "/login"}
            className="flex items-center gap-3 group"
            title="JobNexa • Bengaluru IT Company Discovery & Engineering Job Intelligence"
          >
            {/* Precision Brand Icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/90 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-xs group-hover:border-blue-500 transition-colors shrink-0">
              <span className="text-white">Job</span>
              <span className="text-blue-400">N</span>
            </div>

            {/* Spanned Brand Title & Metadata */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition">
                  JobNexa
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  BLR Tech
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-600 tracking-tight">
                  Bengaluru IT Intelligence
                </span>
                <span className="hidden xl:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  198+ Verified Tech Units
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Tabs - Moved directly to left side next to brand */}
          {authenticated && !isAuthPage && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <Link
                to="/"
                onClick={() => triggerLoading(450)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname === '/' && !location.search.includes('Startup')
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Jobs Feed</span>
              </Link>

              <Link
                to="/jobs?company_type=Startup"
                onClick={() => triggerLoading(450)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  location.search.includes('Startup') 
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Rocket className="w-3.5 h-3.5 text-amber-500" />
                <span>Startups</span>
              </Link>

              <Link
                to="/dashboard"
                onClick={() => triggerLoading(450)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname === '/dashboard' 
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/strategy"
                onClick={() => triggerLoading(450)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname === '/strategy' 
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>Blueprint</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => triggerLoading(450)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname === '/profile' 
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Profile</span>
              </Link>

              {userRole === 'admin' && (
                <Link
                  to="/admin?tab=Dashboard"
                  state={{ tab: 'Dashboard' }}
                  onClick={() => triggerLoading(450)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    location.pathname === '/admin' 
                      ? 'bg-white text-amber-800 shadow-2xs font-bold border border-amber-200/80' 
                      : 'text-slate-600 hover:text-amber-800 hover:bg-white/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right Actions & Account Controls */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {authenticated && !isAuthPage ? (
            <div className="flex items-center gap-2">
              {/* Telemetry pill */}
              <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Direct Apply Sync Active</span>
              </div>

              {/* Role Indicator (Strictly view only - no unauthorized role switching) */}
              {userRole === 'admin' ? (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs">
                  <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Candidate
                </span>
              )}

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <div 
                  className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs border border-slate-700" 
                  title={userEmail || 'Active Account'}
                >
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition ml-1 cursor-pointer"
                title="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            /* Logged Out / Auth Page Navigation */
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden xl:flex items-center gap-2 mr-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  <MapPin className="w-3 h-3 text-blue-600" /> Bengaluru Only
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  100% Direct Apply
                </span>
              </div>
              <button
                onClick={handleSwitchToCandidate}
                className="hidden lg:inline-flex text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition items-center gap-1 cursor-pointer"
                title="1-Click Candidate Login"
              >
                <User className="w-3.5 h-3.5" /> Candidate Demo
              </button>
              {location.pathname === '/login' ? (
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs shrink-0 whitespace-nowrap"
                >
                  Create Account
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs shrink-0 whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {isMobileMenuOpen && authenticated && !isAuthPage && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-md">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              to="/"
              onClick={() => { triggerLoading(450); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl flex items-center gap-2 border ${
                location.pathname === '/' && !location.search.includes('Startup')
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Jobs Feed</span>
            </Link>

            <Link
              to="/jobs?company_type=Startup"
              onClick={() => { triggerLoading(450); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl flex items-center gap-2 border ${
                location.search.includes('Startup')
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Rocket className="w-4 h-4 text-amber-500" />
              <span>Startups</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => { triggerLoading(450); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl flex items-center gap-2 border ${
                location.pathname === '/dashboard'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/strategy"
              onClick={() => { triggerLoading(450); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl flex items-center gap-2 border ${
                location.pathname === '/strategy'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>Blueprint</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => { triggerLoading(450); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl flex items-center gap-2 border ${
                location.pathname === '/profile'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Profile</span>
            </Link>

            {userRole === 'admin' && (
              <Link
                to="/admin?tab=Dashboard"
                state={{ tab: 'Dashboard' }}
                onClick={() => { triggerLoading(450); setIsMobileMenuOpen(false); }}
                className={`p-2.5 rounded-xl flex items-center gap-2 border ${
                  location.pathname === '/admin'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
