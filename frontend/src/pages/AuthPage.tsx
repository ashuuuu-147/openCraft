// frontend/src/pages/AuthPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Github, Mail, Lock, User as UserIcon, ShieldAlert, Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (token: string, user: User) => void;
  addToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, addToast }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthCode = searchParams.get('code');

  const [isLogin, setIsLogin] = useState(true);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CODER' | 'MENTOR' | 'ORG_ADMIN'>('CODER');
  
  // Pending user token (for role selection after registration)
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // GitHub Auth Config and Modal states
  const [authConfig, setAuthConfig] = useState<{ githubClientId: string; isGithubConfigured: boolean } | null>(null);
  const [showMockGithubModal, setShowMockGithubModal] = useState(false);
  const [mockGithubUsername, setMockGithubUsername] = useState('coder_guest');

  // Load backend OAuth config on mount
  useEffect(() => {
    fetch('/api/auth/config')
      .then((res) => res.json())
      .then((data) => setAuthConfig(data))
      .catch((err) => console.error('Failed to load auth config:', err));
  }, []);

  // Handle GitHub OAuth Redirect Code
  useEffect(() => {
    if (oauthCode) {
      setLoading(true);
      fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: oauthCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            addToast(`GitHub Auth Failed: ${data.error}`, 'error');
            navigate('/login');
          } else {
            addToast('Successfully authenticated with GitHub!', 'success');
            onLogin(data.token, data.user);
            
            // Redirect based on role
            if (data.user.role === 'MENTOR') {
              navigate('/mentor');
            } else if (data.user.role === 'ORG_ADMIN') {
              navigate('/org');
            } else {
              navigate('/dashboard');
            }
          }
        })
        .catch((err) => {
          console.error(err);
          addToast('Network error during GitHub authentication', 'error');
          navigate('/login');
        })
        .finally(() => setLoading(false));
    }
  }, [oauthCode, navigate, onLogin, addToast]);

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { email, password, name, role: 'CODER' };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Authentication failed', 'error');
      } else {
        addToast(isLogin ? 'Welcome back!' : 'Account registered successfully!', 'success');
        
        if (isLogin) {
          onLogin(data.token, data.user);
          if (data.user.role === 'MENTOR') navigate('/mentor');
          else if (data.user.role === 'ORG_ADMIN') navigate('/org');
          else navigate('/dashboard');
        } else {
          // If signup, show Role Selection
          setPendingToken(data.token);
          setPendingUser(data.user);
          setShowRoleSelect(true);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred during authentication', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Mock Login (Developer Testing Tool)
  const handleMockLogin = async (handle: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: `mock_github_code_${handle}` }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Mock login failed', 'error');
      } else {
        addToast(`Successfully logged in as ${data.user.name}!`, 'success');
        onLogin(data.token, data.user);
        if (data.user.role === 'MENTOR') navigate('/mentor');
        else if (data.user.role === 'ORG_ADMIN') navigate('/org');
        else navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error during mock login', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Role Selection
  const handleRoleSelection = async () => {
    if (!pendingToken) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/select-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pendingToken}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Failed to assign role', 'error');
      } else {
        addToast(`Persona set to ${selectedRole}!`, 'success');
        onLogin(data.token, data.user);
        
        if (selectedRole === 'MENTOR') navigate('/mentor');
        else if (selectedRole === 'ORG_ADMIN') navigate('/org');
        else navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error saving role selection', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to GitHub OAuth Page
  const triggerRealGithubAuth = () => {
    if (authConfig && authConfig.isGithubConfigured) {
      const clientId = authConfig.githubClientId;
      const redirectUri = window.location.origin + '/login';
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    } else {
      setShowMockGithubModal(true);
    }
  };

  // 1. Loading Overlay for OAuth Callback
  if (oauthCode && loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-neon animate-spin" />
        <p className="font-mono text-sm text-text-secondary">&gt; EXCHANGING GITHUB AUTH CODE...</p>
      </div>
    );
  }

  // 2. Role Selection Page
  if (showRoleSelect) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-left">
        <div className="cursor-card bg-white p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-normal tracking-lg text-ink">Choose Your Workspace Persona</h2>
            <p className="text-xs text-body leading-relaxed">
              OpenCraft tailored views dynamically adapt to your user role. Choose carefully.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Coder Card */}
            <label
              onClick={() => setSelectedRole('CODER')}
              className={`flex items-start gap-4 p-5 rounded-lg border cursor-pointer transition-all ${
                selectedRole === 'CODER'
                  ? 'border-primary bg-canvas-soft'
                  : 'border-hairline bg-white hover:bg-canvas-soft'
              }`}
            >
              <div className={`p-2 rounded-md border ${selectedRole === 'CODER' ? 'border-primary text-primary bg-white' : 'border-hairline text-muted'}`}>
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink font-mono">I am a Developer (Coder)</h3>
                <p className="text-xs text-body mt-1 leading-relaxed">
                  Learn by resolving real open source issues, get feedback from maintainers, and earn reputation badges.
                </p>
              </div>
            </label>

            {/* Mentor Card */}
            <label
              onClick={() => setSelectedRole('MENTOR')}
              className={`flex items-start gap-4 p-5 rounded-lg border cursor-pointer transition-all ${
                selectedRole === 'MENTOR'
                  ? 'border-primary bg-canvas-soft'
                  : 'border-hairline bg-white hover:bg-canvas-soft'
              }`}
            >
              <div className={`p-2 rounded-md border ${selectedRole === 'MENTOR' ? 'border-primary text-primary bg-white' : 'border-hairline text-muted'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink font-mono">I am a Tech Lead / Reviewer (Mentor)</h3>
                <p className="text-xs text-body mt-1 leading-relaxed">
                  Help junior devs ship clean code. Approve and verify pull requests and earn bounty review fees.
                </p>
              </div>
            </label>

            {/* Org Card */}
            <label
              onClick={() => setSelectedRole('ORG_ADMIN')}
              className={`flex items-start gap-4 p-5 rounded-lg border cursor-pointer transition-all ${
                selectedRole === 'ORG_ADMIN'
                  ? 'border-primary bg-canvas-soft'
                  : 'border-hairline bg-white hover:bg-canvas-soft'
              }`}
            >
              <div className={`p-2 rounded-md border ${selectedRole === 'ORG_ADMIN' ? 'border-primary text-primary bg-white' : 'border-hairline text-muted'}`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink font-mono">I am an Organization Representative</h3>
                <p className="text-xs text-body mt-1 leading-relaxed">
                  Post open-source issues, manage code repositories, and source verified junior engineers directly.
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={handleRoleSelection}
            disabled={loading}
            className="w-full btn-cursor-primary font-mono text-xs uppercase py-3 rounded-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Persona & Continue →'}
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Login/Signup Page
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-8rem)] text-left">
      
      {/* Left Column: Premium Interactive Dev Mock sign in */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-primary">
            <Terminal className="w-4 h-4" />
            <span>&gt;_ DEVPANEL_AUTHENTICATION</span>
          </div>
          <h2 className="font-display text-2xl font-normal tracking-lg text-ink">Instant Developer Mock Logins</h2>
          <p className="text-xs text-body leading-relaxed">
            Since GitHub OAuth requires active API secrets configured on a web hostname, use these quick-access mock logins to evaluate different platform roles:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 font-mono">
          <button
            onClick={() => handleMockLogin('jane')}
            className="flex items-center justify-between p-3.5 rounded-md border border-hairline bg-white hover:bg-canvas-soft hover:border-hairline-strong text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=jane" alt="Jane" className="w-8 h-8 rounded-full border border-hairline" />
              <div>
                <div className="text-xs font-bold text-ink">Jane Dev</div>
                <div className="text-[10px] text-body">Role: Coder (Beginner)</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-ink bg-surface-strong/40 border border-hairline px-2 py-0.5 rounded-sm">Coder</span>
          </button>

          <button
            onClick={() => handleMockLogin('john')}
            className="flex items-center justify-between p-3.5 rounded-md border border-hairline bg-white hover:bg-canvas-soft hover:border-hairline-strong text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" alt="John" className="w-8 h-8 rounded-full border border-hairline" />
              <div>
                <div className="text-xs font-bold text-ink">John Pro</div>
                <div className="text-[10px] text-body">Role: Coder (Verified, +85 pts)</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-ink bg-surface-strong/40 border border-hairline px-2 py-0.5 rounded-sm">Verified Coder</span>
          </button>

          <button
            onClick={() => handleMockLogin('alex')}
            className="flex items-center justify-between p-3.5 rounded-md border border-hairline bg-white hover:bg-canvas-soft hover:border-hairline-strong text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" alt="Alex" className="w-8 h-8 rounded-full border border-hairline" />
              <div>
                <div className="text-xs font-bold text-ink">Alex Mentor</div>
                <div className="text-[10px] text-body">Specialty: JavaScript, Python</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-ink bg-surface-strong/40 border border-hairline px-2 py-0.5 rounded-sm">Mentor</span>
          </button>

          <button
            onClick={() => handleMockLogin('sarah')}
            className="flex items-center justify-between p-3.5 rounded-md border border-hairline bg-white hover:bg-canvas-soft hover:border-hairline-strong text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" alt="Sarah" className="w-8 h-8 rounded-full border border-hairline" />
              <div>
                <div className="text-xs font-bold text-ink">Sarah Tech</div>
                <div className="text-[10px] text-body">Specialty: Rust, Go concurrency</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-ink bg-surface-strong/40 border border-hairline px-2 py-0.5 rounded-sm">Mentor</span>
          </button>

          <button
            onClick={() => handleMockLogin('devtool')}
            className="flex items-center justify-between p-3.5 rounded-md border border-hairline bg-white hover:bg-canvas-soft hover:border-hairline-strong text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=DTC&backgroundColor=03a9f4" alt="DevTool" className="w-8 h-8 rounded-full border border-hairline" />
              <div>
                <div className="text-xs font-bold text-ink">DevToolCo Admin</div>
                <div className="text-[10px] text-body">Organization Administrator</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-ink bg-surface-strong/40 border border-hairline px-2 py-0.5 rounded-sm">Org Admin</span>
          </button>
        </div>
      </div>

      {/* Right Column: Interactive Local Auth Form */}
      <div className="lg:col-span-7">
        <div className="cursor-card bg-white p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-normal tracking-lg text-ink">
              {isLogin ? 'Welcome to OpenCraft' : 'Create Contribution Account'}
            </h2>
            <p className="text-xs text-body font-mono">
              {isLogin ? 'Sign in to access your claimed issues.' : 'Start learning, contributing, and earning.'}
            </p>
          </div>

          {/* GitHub OAuth Button */}
          <button
            onClick={triggerRealGithubAuth}
            className="w-full btn-cursor-secondary flex items-center justify-center gap-3 py-3 rounded-md font-mono text-xs text-ink"
          >
            <Github className="w-5 h-5 text-ink" />
            Connect with GitHub OAuth
          </button>

          <div className="flex items-center gap-4 text-xs font-mono text-body">
            <hr className="flex-1 border-hairline" />
            <span>OR CONTINUE WITH EMAIL</span>
            <hr className="flex-1 border-hairline" />
          </div>

          <form onSubmit={handleLocalSubmit} className="space-y-4 text-sm">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-body">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-body">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-body">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-body hover:text-ink focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cursor-primary font-mono text-xs uppercase py-3 rounded-md flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-mono text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>

        </div>
      </div>

      {/* Simulated GitHub OAuth Authorization Modal */}
      <AnimatePresence>
        {showMockGithubModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-hairline rounded-lg p-8 max-w-md w-full space-y-6 text-left relative animate-in fade-in zoom-in-95 duration-150 animate-out fade-out duration-150"
            >
              {/* Connector Header */}
              <div className="flex items-center justify-center gap-4 py-2 border-b border-hairline pb-6">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-md border border-hairline flex items-center justify-center bg-canvas-soft">
                    <Github className="w-6 h-6 text-ink" />
                  </div>
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider">GitHub</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full border-t border-dashed border-hairline-strong relative">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[9px] font-mono text-primary font-bold">OAUTH</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center bg-canvas-soft">
                    <img src="/logo.svg" alt="OpenCraft" className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider">OpenCraft</span>
                </div>
              </div>

              {/* Information */}
              <div className="space-y-2">
                <h3 className="font-display font-normal text-lg text-ink tracking-md">Authorize OpenCraft</h3>
                <p className="text-xs text-body leading-relaxed">
                  Real GitHub credentials are not configured in your backend `.env` variables. Enter a simulated GitHub handle below to authenticate using mock OAuth flow.
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-body uppercase tracking-wider font-bold">GitHub Username</label>
                  <input
                    type="text"
                    value={mockGithubUsername}
                    onChange={(e) => setMockGithubUsername(e.target.value)}
                    placeholder="octocat"
                    className="w-full px-4 py-2.5 rounded-md border border-hairline bg-white text-ink text-sm focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors animate-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMockGithubModal(false)}
                    className="flex-1 py-2.5 rounded border border-hairline hover:border-hairline-strong text-body font-mono text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMockGithubModal(false);
                      navigate(`/login?code=mock_github_code_${mockGithubUsername}`);
                    }}
                    className="flex-1 btn-cursor-primary py-2.5 rounded-md font-mono text-xs"
                  >
                    Authorize OpenCraft
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
