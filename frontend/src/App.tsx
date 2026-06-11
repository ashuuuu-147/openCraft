// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer, ToastItem, ToastType } from './components/ui/Toast';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { MentorDashboardPage } from './pages/MentorDashboardPage';
import { OrgDashboardPage } from './pages/OrgDashboardPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { StripeDummyPage } from './pages/StripeDummyPage';
import { User } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (token: string, loggedUser: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    addToast('Successfully signed out.', 'info');
  };

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper component for protected coder routes
  const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      addToast('Please log in to access this page.', 'warning');
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Helper component for protected role routes
  const RoleRoute: React.FC<{ children: React.ReactElement; roles: string[] }> = ({ children, roles }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      addToast('Please log in to access this page.', 'warning');
      return <Navigate to="/login" replace />;
    }
    if (user && !roles.includes(user.role)) {
      addToast('You do not have permission to view that page.', 'error');
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-canvas text-ink antialiased">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route
              path="/login"
              element={
                user ? <Navigate to="/dashboard" replace /> : <AuthPage onLogin={handleLogin} addToast={addToast} />
              }
            />
            <Route
              path="/signup"
              element={
                user ? <Navigate to="/dashboard" replace /> : <AuthPage onLogin={handleLogin} addToast={addToast} />
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage user={user} addToast={addToast} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetailPage user={user} addToast={addToast} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor"
              element={
                <RoleRoute roles={['MENTOR', 'PLATFORM_ADMIN']}>
                  <MentorDashboardPage addToast={addToast} />
                </RoleRoute>
              }
            />

            <Route
              path="/org"
              element={
                <RoleRoute roles={['ORG_ADMIN']}>
                  <OrgDashboardPage user={user} addToast={addToast} />
                </RoleRoute>
              }
            />

            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <StripeDummyPage user={user} addToast={addToast} />
                </ProtectedRoute>
              }
            />

            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/u/:username" element={<PublicProfilePage />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Global Toasts rendering */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </BrowserRouter>
  );
};
