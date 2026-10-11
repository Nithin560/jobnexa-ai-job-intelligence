import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/Modals/AuthModal';
import { HomePage } from './pages/HomePage';
import { JobDetailPage } from './pages/JobDetailPage';
import { UserDashboard } from './pages/UserDashboard';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { isUserAuthenticated } from './api/client';

// Route Guard: Ensures visitor is authenticated in an active session, otherwise redirects to /login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
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
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        {/* Dedicated Full-Width Login & Register Routes with Landmark Background */}
        <Route
          path="/login"
          element={
            <div className="min-h-screen flex flex-col font-sans">
              <Navbar onOpenAuth={() => {}} />
              <main className="flex-1 flex flex-col">
                <LoginPage />
              </main>
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="min-h-screen flex flex-col font-sans">
              <Navbar onOpenAuth={() => {}} />
              <main className="flex-1 flex flex-col">
                <RegisterPage />
              </main>
            </div>
          }
        />

        {/* Full-Screen Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected User-Facing Platform Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PlatformLayout>
                <HomePage />
              </PlatformLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <PlatformLayout>
                <HomePage />
              </PlatformLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <PlatformLayout>
                <JobDetailPage />
              </PlatformLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PlatformLayout>
                <UserDashboard />
              </PlatformLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PlatformLayout>
                <CandidateProfilePage />
              </PlatformLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-All Route */}
        <Route
          path="*"
          element={<Navigate to={isUserAuthenticated() ? "/" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
