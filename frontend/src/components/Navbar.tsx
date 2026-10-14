import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Search, MapPin, User, LogOut, Shield, Users, Compass } from 'lucide-react';
import { api, isUserAuthenticated } from '../api/client';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isUserAuthenticated();
  const userRole = sessionStorage.getItem('user_role');
  const userEmail = sessionStorage.getItem('user_email');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [userCounts, setUserCounts] = React.useState<{ registered: number; active: number }>({ registered: 6, active: 6 });

  React.useEffect(() => {
    if (authenticated && userRole === 'admin') {
      api.getAdminUsers().then(res => {
        if (res) {
          setUserCounts({ registered: res.total_registered, active: res.total_active });
        }
      }).catch(() => {});
    }
  }, [authenticated, userRole]);

  const handleLogout = () => {
    api.logout();
    navigate('/login');
    window.location.reload();
  };

  const handleSwitchToAdmin = async () => {
    try {
      await api.quickLoginAsAdmin();
      navigate('/admin', { replace: true });
      window.location.reload();
    } catch (e) {
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
        
        {/* Brand Logo - links to / when authenticated, otherwise stays on /login */}
        <Link
          to={authenticated ? "/" : "/login"}
          className="flex items-center gap-2.5 shrink-0 mr-6 xl:mr-8 group"
        >
          <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-2 rounded-xl group-hover:from-blue-600 group-hover:to-indigo-500 transition shadow-sm">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 leading-tight block tracking-tight">JobNexa</span>
            <span className="text-[10px] font-bold text-blue-600 leading-none block uppercase tracking-wider">Bengaluru IT Intelligence</span>
          </div>
        </Link>

        {/* Global Search Bar Header - ONLY visible for logged-in users inside the platform */}
        {authenticated && !isAuthPage && (
          <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3.5 py-1.5 w-64 xl:w-72 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition shrink-0 mr-6 xl:mr-8">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              className="bg-transparent text-sm w-full outline-none text-slate-800 placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/?q=${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
            />
            <div className="flex items-center gap-1 border-l border-slate-300 pl-2 ml-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Bengaluru</span>
            </div>
          </div>
        )}

        {/* Navigation Links - ONLY visible for authenticated users inside the platform */}
        {authenticated && !isAuthPage && (
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-slate-600 mr-6 xl:mr-8">
            <Link to="/" className={`hover:text-blue-600 transition ${location.pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>Home</Link>
            <Link to="/jobs" className={`hover:text-blue-600 transition ${location.pathname === '/jobs' ? 'text-blue-600 font-semibold' : ''}`}>Jobs</Link>
            <Link to="/strategy" className={`hover:text-blue-600 transition flex items-center gap-1.5 ${location.pathname === '/strategy' ? 'text-blue-600 font-bold' : ''}`}>
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Blueprint</span>
            </Link>
            <Link to="/dashboard" className={`hover:text-blue-600 transition ${location.pathname === '/dashboard' ? 'text-blue-600 font-semibold' : ''}`}>Dashboard</Link>
            <Link to="/profile" className={`hover:text-blue-600 transition ${location.pathname === '/profile' ? 'text-blue-600 font-semibold' : ''}`}>My Profile</Link>
            <Link 
              to="/admin?tab=Dashboard" 
              state={{ tab: 'Dashboard' }} 
              className={`hover:text-blue-600 transition flex items-center gap-1 ${location.pathname === '/admin' && !location.search.includes('tab=Users') && (location.state as any)?.tab !== 'Users' ? 'text-blue-600 font-semibold' : ''}`}
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Admin</span>
            </Link>
            {userRole === 'admin' && (
              <Link 
                to="/admin?tab=Users" 
                state={{ tab: 'Users' }} 
                className={`hover:text-blue-600 transition flex items-center gap-1.5 whitespace-nowrap ${location.pathname === '/admin' && (location.search.includes('tab=Users') || (location.state as any)?.tab === 'Users') ? 'text-blue-600 font-bold' : ''}`}
                title="Users Analysis & Directory"
              >
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Users ({userCounts.registered} Reg • {userCounts.active} Act)</span>
              </Link>
            )}
          </nav>
        )}

        {/* Right Actions & Easy Role Switcher */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {authenticated && !isAuthPage ? (
            <div className="flex items-center gap-2">
              {/* Active Role Badge & Switcher */}
              {userRole === 'admin' ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin?tab=Users"
                    state={{ tab: 'Users' }}
                    className="hidden sm:inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-xl transition whitespace-nowrap"
                    title="View Registered & Active Users"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Users: {userCounts.registered} Reg • {userCounts.active} Act</span>
                  </Link>
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-xl">
                    <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Mode
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-xl">
                    <User className="w-3.5 h-3.5 text-blue-600" /> User
                  </span>
                  <button
                    onClick={handleSwitchToAdmin}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1"
                    title="Switch to Admin Panel"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Admin</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm" title={userEmail || ''}>
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitchToCandidate}
                className="hidden sm:inline-flex text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-xl transition items-center gap-1"
                title="1-Click User Login"
              >
                <User className="w-3 h-3" /> User Login
              </button>
              <button
                onClick={handleSwitchToAdmin}
                className="hidden sm:inline-flex text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-xl transition items-center gap-1"
                title="1-Click Admin Login"
              >
                <Shield className="w-3 h-3 text-amber-600" /> Admin Login
              </button>
              {location.pathname === '/login' ? (
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-200"
                >
                  Register
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-200"
                >
                  Log In
                </Link>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
