import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/Modals/AuthModal';
import { HomePage } from './pages/HomePage';
import { JobDetailPage } from './pages/JobDetailPage';
import { UserDashboard } from './pages/UserDashboard';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Full-Screen Admin Dashboard Route matching Image 1 */}
        <Route path="/admin" element={<AdminDashboardPage />} />

        {/* Standard User-Facing Routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
              <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/jobs" element={<HomePage />} />
                  <Route path="/jobs/:id" element={<JobDetailPage />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<CandidateProfilePage />} />
                </Routes>
              </main>

              <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                  <div>© 2026 BangaloreJobs AI Powered Platform. Bengaluru, Karnataka, India.</div>
                  <div className="flex gap-4">
                    <a href="/docs" target="_blank" className="hover:underline">FastAPI Docs (/docs)</a>
                    <span>•</span>
                    <span>Zero-Cost Development Target (₹0)</span>
                  </div>
                </div>
              </footer>

              <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
