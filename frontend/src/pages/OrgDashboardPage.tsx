// frontend/src/pages/OrgDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, CheckCircle, Clock, AlertTriangle, ArrowRight, UserCheck, Code, Globe, ShieldAlert, Award, Loader2, Target, Search } from 'lucide-react';
import { Task, User, Organization } from '../types';

interface OrgDashboardPageProps {
  user: User | null;
  addToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const OrgDashboardPage: React.FC<OrgDashboardPageProps> = ({ addToast }) => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [discoverCoders, setDiscoverCoders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'post' | 'discover'>('listings');

  // New Task Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('BUG_FIX');
  const [difficulty, setDifficulty] = useState('EASY');
  const [repoUrl, setRepoUrl] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const [rewardPoints, setRewardPoints] = useState('20');
  const [cashReward, setCashReward] = useState('0.00');
  const [tags, setTags] = useState('');
  const [deadline, setDeadline] = useState('');

  // Discover filter states
  const [searchSkill, setSearchSkill] = useState('');
  const [searchLevel, setSearchLevel] = useState('');

  // Mock Hiring Dialog state
  const [hiringCoder, setHiringCoder] = useState<User | null>(null);
  const [salaryOffer, setSalaryOffer] = useState('75,000');
  const [offerSent, setOfferSent] = useState(false);

  // Profile Form States (for first-time Org register)
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  const fetchDashboardData = () => {
    setLoading(true);
    fetch('/api/orgs/my/dashboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.organization) {
          setOrg(data.organization);
          setTasks(data.tasks);
          setOrgName(data.organization.name);
          setOrgWebsite(data.organization.website || '');
          setOrgDescription(data.organization.description || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchDiscoverCoders = () => {
    const queryParams = new URLSearchParams();
    if (searchSkill) queryParams.append('skill', searchSkill);
    if (searchLevel) queryParams.append('level', searchLevel);

    fetch(`/api/orgs/contributors/discover?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDiscoverCoders(data);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchDiscoverCoders();
    }
  }, [activeTab, searchSkill, searchLevel]);

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          name: orgName,
          website: orgWebsite,
          description: orgDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Failed to save organization profile', 'error');
      } else {
        addToast('Organization profile saved successfully!', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      addToast('Error saving organization profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    
    const cashVal = parseFloat(cashReward);
    if (cashVal > 0 && !org.verified) {
      addToast('Your organization is not verified. You cannot post paid tasks yet.', 'error');
      return;
    }

    setPostLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          title,
          description,
          type: taskType,
          difficulty,
          repoUrl,
          issueUrl,
          reward: rewardPoints,
          cashReward: cashReward,
          tags,
          deadline,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Failed to post task', 'error');
      } else {
        addToast('Task posted successfully!', 'success');
        setTitle('');
        setDescription('');
        setRepoUrl('');
        setIssueUrl('');
        setTags('');
        setDeadline('');
        fetchDashboardData();
        setActiveTab('listings');
      }
    } catch (err) {
      console.error(err);
      addToast('Error posting task', 'error');
    } finally {
      setPostLoading(false);
    }
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setOfferSent(true);
    addToast(`Offer contract sent to @${hiringCoder?.githubLogin}!`, 'success');
    setTimeout(() => {
      setHiringCoder(null);
      setOfferSent(false);
    }, 2000);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'STARTER': return 'text-ink bg-timeline-grep/30 border-timeline-grep/50';
      case 'EASY': return 'text-ink bg-timeline-read/30 border-timeline-read/50';
      case 'MEDIUM': return 'text-ink bg-timeline-done/35 border-timeline-done/60';
      case 'HARD': return 'text-ink bg-timeline-thinking/40 border-timeline-thinking/60';
      case 'ADVANCED': return 'text-white bg-primary border-primary';
      default: return 'text-body bg-canvas-soft border-hairline';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'text-body bg-canvas-soft border-hairline';
      case 'ACTIVE': return 'text-ink bg-timeline-read/30 border-timeline-read/50';
      case 'VERIFIED': return 'text-ink bg-timeline-edit/30 border-timeline-edit/50';
      case 'MENTOR_LEVEL': return 'text-ink bg-timeline-done/35 border-timeline-done/60';
      default: return 'text-body bg-canvas-soft border-hairline';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-20 bg-hairline rounded-lg w-full"></div>
        <div className="h-64 bg-hairline rounded-lg"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-left">
        <div className="cursor-card bg-white p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-normal tracking-lg text-ink">Register Your Organization</h2>
            <p className="text-xs text-body max-w-sm leading-relaxed">
              Create your organization profile to start listing tasks and scouting contributors.
            </p>
          </div>

          <form onSubmit={handleRegisterOrg} className="space-y-4 text-sm font-mono">
            <div className="space-y-1.5">
              <label className="text-xs text-body uppercase font-mono">Company Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="DevToolCo"
                className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-body uppercase font-mono">Website URL</label>
              <input
                type="url"
                required
                value={orgWebsite}
                onChange={(e) => setOrgWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-body uppercase font-mono">Description</label>
              <textarea
                required
                rows={3}
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                placeholder="Briefly describe what your organization builds..."
                className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full btn-cursor-primary font-mono text-xs uppercase py-3 rounded-md"
            >
              REGISTER MERCHANT PROFILE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      
      {/* 1. Profile Banner */}
      <div className="cursor-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 bg-white">
        <div className="flex items-center gap-4">
          <img src={org.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${org.name}`} alt={org.name} className="w-14 h-14 rounded-md border border-hairline" />
          <div className="space-y-1">
            <h2 className="font-display text-xl font-normal tracking-lg text-ink flex items-center gap-2">
              {org.name}
              {org.verified && (
                <span className="text-[9px] font-mono text-ink bg-timeline-grep/30 border border-timeline-grep/50 px-1.5 py-0.5 rounded-sm">Verified Merchant</span>
              )}
            </h2>
            <p className="text-xs text-body flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-muted" />
              <a href={org.website} target="_blank" rel="noreferrer" className="hover:underline">{org.website}</a>
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex bg-canvas-soft p-1 rounded-md border border-hairline font-mono text-xs">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-sm font-medium transition-all ${
              activeTab === 'listings' ? 'bg-ink text-white' : 'text-body hover:text-ink'
            }`}
          >
            Listings ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-2 rounded-sm font-medium transition-all ${
              activeTab === 'post' ? 'bg-ink text-white' : 'text-body hover:text-ink'
            }`}
          >
            Post Task
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-sm font-medium transition-all ${
              activeTab === 'discover' ? 'bg-ink text-white' : 'text-body hover:text-ink'
            }`}
          >
            Discover Devs
          </button>
        </div>
      </div>

      {/* 2. dynamic content */}
      
      {/* Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="font-display font-normal tracking-lg text-lg text-ink">Published Task Listings</h3>

          {tasks.length === 0 ? (
            <div className="cursor-card flex flex-col items-center justify-center p-12 text-center bg-white">
              <Plus className="w-8 h-8 text-muted mb-2 animate-bounce" />
              <h4 className="font-display font-normal text-sm text-ink mb-1">No Tasks Listed</h4>
              <p className="text-xs text-body mb-4">You have not listed any tasks yet.</p>
              <button
                onClick={() => setActiveTab('post')}
                className="btn-cursor-secondary text-xs"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="cursor-card p-6 bg-white space-y-4 hover:border-hairline-strong">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-display font-normal tracking-md text-base text-ink">
                      {task.title}
                    </h4>
                    <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-sm ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-mono text-body">
                    <div>Status: <span className="text-ink font-semibold">{task.status}</span></div>
                    <div>Bounty: <span className="text-primary font-bold">${task.cashReward.toFixed(2)}</span></div>
                    <div>Claims: <span className="text-body font-bold">{task.submissions?.length || 0}</span></div>
                  </div>

                  {/* Submission logs */}
                  {task.submissions && task.submissions.length > 0 ? (
                    <div className="space-y-2 border-t border-hairline pt-3 font-mono">
                      <div className="text-[10px] text-muted uppercase">Recent Contributor Activity:</div>
                      <div className="space-y-1.5">
                        {task.submissions.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between text-xs p-2 rounded-sm bg-canvas-soft border border-hairline-soft">
                            <span className="text-ink">@{sub.coder?.githubLogin || 'coder'}</span>
                            <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border ${
                              sub.status === 'PENDING' ? 'border-timeline-read/30 text-ink bg-timeline-read/15' : 'border-timeline-done/30 text-ink bg-timeline-done/15'
                            }`}>
                              {sub.status === 'PENDING' ? 'CLAIMED / CODING' : sub.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-muted italic pt-1 border-t border-hairline">
                      No contributor claims logged yet.
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      Specs Detail Page
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Task */}
      {activeTab === 'post' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          <h3 className="font-display font-normal tracking-lg text-lg text-ink">Publish New Contribution Listing</h3>

          {/* Org verification alert */}
          {!org.verified && (
            <div className="p-4 rounded-md border border-timeline-thinking/50 bg-timeline-thinking/15 text-xs text-ink flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono">Organization Verification Required</span>
                <p className="text-[11px] text-body mt-1 font-mono">
                  You can list volunteer tasks ($0) immediately. However, you must be verified by OpenCraft admins to list paid bounties. Contact support@opencraft.dev for verification.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handlePostTask} className="cursor-card p-6 bg-white space-y-5 text-sm font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs text-body uppercase font-mono">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optimize database index querying"
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs text-body uppercase font-mono">Task Description (Markdown Specs)</label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include reproduction steps, file paths (e.g. src/db.ts), expected outputs, and test suite specs..."
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-body focus:outline-none focus:border-primary/50 focus:ring-0"
                >
                  <option value="BUG_FIX">Bug Fix</option>
                  <option value="FEATURE">Feature Addition</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="TESTING">Testing Suites</option>
                  <option value="REFACTOR">Refactoring</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-body focus:outline-none focus:border-primary/50 focus:ring-0"
                >
                  <option value="STARTER">Starter</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">Git Repository URL</label>
                <input
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/company/repo"
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">GitHub Issue Link (Optional)</label>
                <input
                  type="url"
                  value={issueUrl}
                  onChange={(e) => setIssueUrl(e.target.value)}
                  placeholder="https://github.com/company/repo/issues/12"
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">Points Reward</label>
                <input
                  type="number"
                  required
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">Bounty Reward (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cashReward}
                  onChange={(e) => setCashReward(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">Tech Tags (comma separated)</label>
                <input
                  type="text"
                  required
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="JavaScript,React,Security"
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-body uppercase font-mono">Bounty Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas-soft text-body focus:border-primary/50 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={postLoading}
              className="w-full btn-cursor-primary font-mono text-xs uppercase py-3 rounded-md flex items-center justify-center gap-2"
            >
              {postLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'PUBLISH SPECIFICATION'}
            </button>
          </form>
        </div>
      )}

      {/* Discover devs */}
      {activeTab === 'discover' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-canvas-soft p-4 rounded-md border border-hairline">
            <h3 className="font-display font-normal tracking-lg text-base text-ink">Scout Verified Contributors</h3>

            <div className="flex gap-3 font-mono text-xs w-full sm:w-auto">
              <input
                type="text"
                placeholder="Filter skill (e.g. React)..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="px-3 py-2 rounded-md border border-hairline bg-white text-ink placeholder-muted-soft focus:outline-none focus:border-primary/50 focus:ring-0 w-full sm:w-auto"
              />

              <select
                value={searchLevel}
                onChange={(e) => setSearchLevel(e.target.value)}
                className="px-3 py-2 rounded-md border border-hairline bg-white text-body focus:outline-none focus:border-primary/50 focus:ring-0"
              >
                <option value="">Level: All</option>
                <option value="BEGINNER">Beginner</option>
                <option value="ACTIVE">Active</option>
                <option value="VERIFIED">Verified</option>
                <option value="MENTOR_LEVEL">Mentor Level</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {discoverCoders.map((coder) => (
              <div key={coder.id} className="cursor-card p-5 bg-white flex flex-col space-y-4 hover:border-hairline-strong">
                <div className="flex items-center gap-3">
                  <img src={coder.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${coder.id}`} alt={coder.name} className="w-11 h-11 rounded-full border border-hairline" />
                  <div className="space-y-0.5">
                    <h4 className="font-display font-normal text-sm text-ink">{coder.name}</h4>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono text-body">@{coder.githubLogin}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 rounded-sm border uppercase ${getLevelColor(coder.level)}`}>
                        {coder.level}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-body leading-relaxed line-clamp-2 min-h-[32px]">
                  {coder.profile?.bio || 'No bio provided.'}
                </p>

                {coder.profile?.stack && (
                  <div className="flex flex-wrap gap-1">
                    {coder.profile.stack.split(',').map((stackItem) => (
                      <span key={stackItem} className="text-[9px] font-mono bg-canvas-soft border border-hairline-soft text-ink px-2 py-0.5 rounded-sm">
                        {stackItem.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mt-auto pt-3 border-t border-hairline text-xs font-mono">
                  <span className="text-ink font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    {coder.reputation} rep
                  </span>
                  
                  <button
                    onClick={() => setHiringCoder(coder)}
                    className="btn-cursor-primary px-3 py-1.5 rounded-md text-xs"
                  >
                    Hire Coder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offer Modal */}
      <AnimatePresence>
        {hiringCoder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-hairline rounded-lg p-6 max-w-md w-full space-y-6 relative animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-primary">
                  <Briefcase className="w-4 h-4" />
                  <span>&gt;_ CONTRACT_LEDGER</span>
                </div>
                <h3 className="font-display font-normal tracking-lg text-lg text-ink">
                  Extend Offer Contract
                </h3>
                <p className="text-xs text-body">
                  Drafting hiring proposal to developer @{hiringCoder.githubLogin}.
                </p>
              </div>

              {offerSent ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-primary animate-pulse" />
                  <span className="font-mono text-sm text-primary font-bold">OFFER DISPATCHED</span>
                  <p className="text-xs text-body">Piped to the developer profiles thread.</p>
                </div>
              ) : (
                <form onSubmit={handleSendOffer} className="space-y-4 text-xs font-mono text-left">
                  <div className="p-4 rounded-md border border-hairline bg-canvas-soft text-[11px] leading-relaxed text-body space-y-1">
                    <div><span className="text-muted">RECIPIENT:</span> {hiringCoder.name}</div>
                    <div><span className="text-muted">REPUTATION:</span> {hiringCoder.reputation}</div>
                    <div><span className="text-muted">LEVEL:</span> {hiringCoder.level}</div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-body">Salary Offer (USD / Year)</label>
                    <select
                      value={salaryOffer}
                      onChange={(e) => setSalaryOffer(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-hairline bg-white text-ink focus:outline-none focus:border-primary/50 focus:ring-0 text-xs font-mono"
                    >
                      <option value="60,000">$60,000 USD / Year</option>
                      <option value="75,000">$75,000 USD / Year</option>
                      <option value="90,000">$90,000 USD / Year</option>
                      <option value="120,000">$120,000 USD / Year</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setHiringCoder(null)}
                      className="flex-1 py-2.5 rounded border border-hairline hover:border-hairline-strong text-body font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-cursor-primary py-2.5 rounded-md"
                    >
                      Dispatch Proposal
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

