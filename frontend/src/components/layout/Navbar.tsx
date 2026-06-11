// frontend/src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldAlert, Briefcase, Award, CreditCard, ChevronDown, Menu, X } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogoutClick = () => {
    onLogout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'BEGINNER': return 'border-hairline text-body bg-canvas-soft';
      case 'ACTIVE': return 'border-timeline-read/40 text-ink bg-timeline-read/15';
      case 'VERIFIED': return 'border-timeline-edit/40 text-ink bg-timeline-edit/15';
      case 'MENTOR_LEVEL': return 'border-timeline-done/40 text-ink bg-timeline-done/15';
      default: return 'border-hairline text-body';
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="OpenCraft Logo" className="w-8 h-8 transition-transform group-hover:rotate-12 duration-300" />
              <span className="font-display text-xl font-normal tracking-sm text-ink group-hover:text-primary transition-colors">
                OpenCraft
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'border-primary text-primary'
                    : 'border-transparent text-body hover:text-ink hover:border-hairline-strong'
                }`}
              >
                Explorer
              </Link>
              
              <Link
                to="/leaderboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/leaderboard')
                    ? 'border-primary text-primary'
                    : 'border-transparent text-body hover:text-ink hover:border-hairline-strong'
                }`}
              >
                Leaderboard
              </Link>

              {user && user.role === 'MENTOR' && (
                <Link
                  to="/mentor"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive('/mentor')
                      ? 'border-primary text-primary'
                      : 'border-transparent text-body hover:text-ink hover:border-hairline-strong'
                  }`}
                >
                  Mentor Queue
                </Link>
              )}

              {user && user.role === 'ORG_ADMIN' && (
                <Link
                  to="/org"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive('/org')
                      ? 'border-primary text-primary'
                      : 'border-transparent text-body hover:text-ink hover:border-hairline-strong'
                  }`}
                >
                  Org Portal
                </Link>
              )}

              <Link
                to="/billing"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/billing')
                    ? 'border-primary text-primary'
                    : 'border-transparent text-body hover:text-ink hover:border-hairline-strong'
                }`}
              >
                Billing
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 px-3 rounded-md border border-hairline bg-surface-card hover:border-hairline-strong hover:bg-canvas-soft transition-all focus:outline-none"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-hairline"
                  />
                  <span className="text-sm font-medium text-ink max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
 
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <div 
                      className="absolute right-0 mt-2 w-56 rounded-lg border border-hairline backdrop-blur-md shadow-sm z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150"
                      style={{ backgroundColor: 'rgba(247, 247, 244, 0.9)' }}
                    >
                      {/* User Header */}
                      <div className="px-4 py-2 border-b border-hairline">
                        <div className="text-xs text-muted">Logged in as</div>
                        <div className="text-sm font-semibold text-ink truncate">{user.email}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft text-ink">
                            {user.role}
                          </span>
                          {user.role === 'CODER' && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getLevelColor(user.level)}`}>
                              {user.level}
                            </span>
                          )}
                        </div>
                      </div>
 
                      {/* Dropdown Links */}
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-body hover:text-ink hover:bg-canvas-soft transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-muted" />
                        My Dashboard
                      </Link>
 
                      {user.role === 'MENTOR' && (
                        <Link
                          to="/mentor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-body hover:text-ink hover:bg-canvas-soft transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-muted" />
                          Review Queue
                        </Link>
                      )}
 
                      {user.role === 'ORG_ADMIN' && (
                        <Link
                          to="/org"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-body hover:text-ink hover:bg-canvas-soft transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-muted" />
                          Manage Organization
                        </Link>
                      )}
 
                      {user.githubLogin && (
                        <Link
                          to={`/u/${user.githubLogin}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-body hover:text-ink hover:bg-canvas-soft transition-colors"
                        >
                          <Award className="w-4 h-4 text-muted" />
                          Public Profile
                        </Link>
                      )}
 
                      <Link
                        to="/billing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-body hover:text-ink hover:bg-canvas-soft transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-muted" />
                        Billing Details
                      </Link>
 
                      <hr className="border-hairline my-1" />
 
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-semantic-error hover:bg-semantic-error/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-body hover:text-ink transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-cursor-primary text-xs"
                >
                  Start Contributing →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted hover:text-ink hover:bg-canvas-soft focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
 
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-hairline bg-canvas/95 backdrop-blur-lg animate-in slide-in-from-top-5 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard') ? 'bg-canvas-soft text-primary' : 'text-body hover:bg-canvas-soft hover:text-ink'
              }`}
            >
              Task Explorer
            </Link>
            
            <Link
              to="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/leaderboard') ? 'bg-canvas-soft text-primary' : 'text-body hover:bg-canvas-soft hover:text-ink'
              }`}
            >
              Leaderboard
            </Link>
 
            {user && user.role === 'MENTOR' && (
              <Link
                to="/mentor"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/mentor') ? 'bg-canvas-soft text-primary' : 'text-body hover:bg-canvas-soft hover:text-ink'
                }`}
              >
                Mentor Queue
              </Link>
            )}
 
            {user && user.role === 'ORG_ADMIN' && (
              <Link
                to="/org"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/org') ? 'bg-canvas-soft text-primary' : 'text-body hover:bg-canvas-soft hover:text-ink'
                }`}
              >
                Org Portal
              </Link>
            )}
 
            <Link
              to="/billing"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/billing') ? 'bg-canvas-soft text-primary' : 'text-body hover:bg-canvas-soft hover:text-ink'
              }`}
            >
              Billing
            </Link>
          </div>
 
          <div className="pt-4 pb-3 border-t border-hairline px-4">
            {user ? (
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-hairline"
                  />
                  <div>
                    <div className="text-base font-semibold text-ink">{user.name}</div>
                    <div className="text-sm text-body">{user.email}</div>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-body hover:bg-canvas-soft hover:text-ink"
                  >
                    My Dashboard
                  </Link>
                  {user.githubLogin && (
                    <Link
                      to={`/u/${user.githubLogin}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-body hover:bg-canvas-soft hover:text-ink"
                    >
                      Public Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-semantic-error hover:bg-semantic-error/10 transition-colors"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2 border border-hairline rounded-md text-base font-medium text-body hover:text-ink hover:bg-canvas-soft"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2 rounded-md bg-primary hover:bg-primary-active text-on-primary font-bold text-base transition-colors"
                >
                  Start Contributing →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
