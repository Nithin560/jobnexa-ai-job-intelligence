import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Search, MapPin, Bell, User, LogOut, Shield } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  const userEmail = localStorage.getItem('user_email');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 leading-tight block">BangaloreJobs</span>
            <span className="text-xs font-semibold text-blue-600 leading-none block">AI Powered</span>
          </div>
        </Link>

        {/* Global Search Bar Header */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-1.5 w-96 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition">
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

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className={`hover:text-blue-600 ${location.pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>Home</Link>
          <Link to="/jobs" className={`hover:text-blue-600 ${location.pathname === '/jobs' ? 'text-blue-600 font-semibold' : ''}`}>Jobs</Link>
          <Link to="/dashboard" className={`hover:text-blue-600 ${location.pathname === '/dashboard' ? 'text-blue-600 font-semibold' : ''}`}>Dashboard</Link>
          <Link to="/profile" className={`hover:text-blue-600 ${location.pathname === '/profile' ? 'text-blue-600 font-semibold' : ''}`}>My Profile</Link>
          <Link to="/admin" className={`hover:text-blue-600 flex items-center gap-1 ${location.pathname === '/admin' ? 'text-blue-600 font-semibold' : ''}`}>
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>

          {token ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition"
              >
                Log In
              </button>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-200"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
