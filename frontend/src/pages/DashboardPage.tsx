// frontend/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, DollarSign, Flame, GitPullRequest, Search, CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { DashboardStats, Task, User } from '../types';

interface DashboardPageProps {
  user: User | null;
  addToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, addToast }) => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'explore'>('explore');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedReward, setSelectedReward] = useState('');

  const fetchDashboardStats = () => {
    setLoading(true);
    fetch('/api/users/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stats');
        return res.json();
      })
      .then((data) => setDashboardData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchExploreTasks = () => {
    setTasksLoading(true);
    const queryParams = new URLSearchParams();
    if (selectedLanguage) queryParams.append('language', selectedLanguage);
    if (selectedDifficulty) queryParams.append('difficulty', selectedDifficulty);
    if (selectedReward) queryParams.append('reward', selectedReward);
    
    fetch(`/api/tasks?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setTasksLoading(false));
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchExploreTasks();
  }, [selectedLanguage, selectedDifficulty, selectedReward]);

  const handleClaimTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Failed to claim task', 'error');
      } else {
        addToast('Task claimed successfully! 72-hour timer started.', 'success');
        fetchDashboardStats();
        fetchExploreTasks();
        setActiveTab('my-tasks');
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred claiming this task', 'error');
    }
  };

  const handleUnclaimTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to release your claim?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/unclaim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Failed to unclaim task', 'error');
      } else {
        addToast('Task release completed.', 'info');
        fetchDashboardStats();
        fetchExploreTasks();
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred unclaiming this task', 'error');
    }
  };

  const renderTimeRemaining = (expiryStr?: string) => {
    if (!expiryStr) return 'No active timer';
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${mins}m remaining`;
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

  const getLevelBadge = (level?: string) => {
    switch (level) {
      case 'BEGINNER': return { text: 'Beginner', style: 'border-hairline text-body bg-canvas-soft' };
      case 'ACTIVE': return { text: 'Active Contributor', style: 'border-timeline-read/40 text-ink bg-timeline-read/15' };
      case 'VERIFIED': return { text: 'Verified Developer', style: 'border-timeline-edit/40 text-ink bg-timeline-edit/15' };
      case 'MENTOR_LEVEL': return { text: 'Mentor Level', style: 'border-timeline-done/40 text-ink bg-timeline-done/15' };
      default: return { text: 'Beginner', style: 'border-hairline text-body' };
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-ink bg-timeline-read/30 border-timeline-read/50';
      case 'IN_REVIEW': return 'text-ink bg-timeline-thinking/40 border-timeline-thinking/50';
      case 'APPROVED': return 'text-white bg-semantic-success border-semantic-success';
      case 'REJECTED': return 'text-white bg-semantic-error border-semantic-error';
      case 'CHANGES_REQUESTED': return 'text-white bg-semantic-error border-semantic-error';
      default: return 'text-body bg-canvas-soft border-hairline';
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.org?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative">
      
      {/* 1. Header Card */}
      {loading ? (
        <div className="h-32 w-full rounded-lg border border-hairline bg-white animate-pulse"></div>
      ) : (
        dashboardData && (
          <div className="cursor-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-lg bg-white relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <img
                src={dashboardData.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dashboardData.user.id}`}
                alt={dashboardData.user.name}
                className="w-14 h-14 rounded-full border border-hairline"
              />
              <div className="space-y-1 text-left">
                <h2 className="font-display text-xl sm:text-2xl font-normal text-ink flex items-center gap-2">
                  {dashboardData.user.name}
                  {dashboardData.user.level !== 'BEGINNER' && (
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-body">&gt; @{dashboardData.user.githubLogin || 'coder'}</span>
                  <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${getLevelBadge(dashboardData.user.level).style}`}>
                    {getLevelBadge(dashboardData.user.level).text}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile CTA */}
            {dashboardData.user.githubLogin && (
              <Link
                to={`/u/${dashboardData.user.githubLogin}`}
                className="btn-cursor-secondary text-xs"
              >
                View Public Profile →
              </Link>
            )}
          </div>
        )
      )}

      {/* 2. Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="h-24 rounded-lg border border-hairline bg-white animate-pulse"></div>
          ))}
        </div>
      ) : (
        dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="cursor-card p-5 rounded-lg flex items-center justify-between bg-white cursor-card-hover">
              <div className="space-y-1 text-left">
                <div className="text-[10px] font-mono text-body uppercase">Tasks Completed</div>
                <div className="text-2xl font-display font-semibold text-ink">{dashboardData.stats.tasksCompleted}</div>
              </div>
              <CheckCircle className="w-7 h-7 text-semantic-success opacity-75" />
            </div>

            <div className="cursor-card p-5 rounded-lg flex items-center justify-between bg-white cursor-card-hover">
              <div className="space-y-1 text-left">
                <div className="text-[10px] font-mono text-body uppercase">Submissions</div>
                <div className="text-2xl font-display font-semibold text-ink">{dashboardData.stats.tasksSubmitted}</div>
              </div>
              <GitPullRequest className="w-7 h-7 text-primary opacity-75" />
            </div>

            <div className="cursor-card p-5 rounded-lg flex items-center justify-between bg-white cursor-card-hover">
              <div className="space-y-1 text-left">
                <div className="text-[10px] font-mono text-body uppercase">Reputation</div>
                <div className="text-2xl font-display font-semibold text-primary">{dashboardData.stats.reputationScore}</div>
              </div>
              <Flame className="w-7 h-7 text-timeline-done opacity-75" />
            </div>

            <div className="cursor-card p-5 rounded-lg flex items-center justify-between bg-white cursor-card-hover">
              <div className="space-y-1 text-left">
                <div className="text-[10px] font-mono text-body uppercase">Total Earned</div>
                <div className="text-2xl font-display font-semibold text-ink">${dashboardData.stats.totalEarned.toFixed(2)}</div>
              </div>
              <DollarSign className="w-7 h-7 text-primary opacity-75" />
            </div>
          </div>
        )
      )}

      {/* 3. Main Split Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 9 Columns: Explorer & Active Claims */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex border-b border-hairline">
            <button
              onClick={() => setActiveTab('explore')}
              className={`pb-3 px-6 text-xs font-mono font-bold border-b-2 transition-colors focus:outline-none ${
                activeTab === 'explore' ? 'border-primary text-primary' : 'border-transparent text-body hover:text-ink'
              }`}
            >
              Explore Tasks
            </button>
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`pb-3 px-6 text-xs font-mono font-bold border-b-2 transition-colors focus:outline-none ${
                activeTab === 'my-tasks' ? 'border-primary text-primary' : 'border-transparent text-body hover:text-ink'
              }`}
            >
              My Claims &amp; Submissions
            </button>
          </div>

          {/* Active claims tab */}
          {activeTab === 'my-tasks' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {loading ? (
                <div className="h-40 w-full bg-white animate-pulse rounded-lg border border-hairline"></div>
              ) : dashboardData?.activeTask ? (
                <div className="cursor-card p-6 rounded-lg bg-white space-y-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${getSubmissionStatusColor(dashboardData.activeTask.status)}`}>
                          {dashboardData.activeTask.status === 'PENDING' ? 'CLAIMED / IN PROGRESS' : dashboardData.activeTask.status}
                        </span>
                        {dashboardData.activeTask.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-semantic-error">
                            <Clock className="w-3.5 h-3.5" />
                            {renderTimeRemaining(dashboardData.activeTask.claimExpiry)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-lg text-ink">
                        {dashboardData.activeTask.task.title}
                      </h3>
                      <p className="text-xs text-body">
                        Posted by {dashboardData.activeTask.task.org?.name || 'GitHub Project'}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-2 sm:mt-0 font-mono text-xs">
                      {dashboardData.activeTask.status === 'PENDING' && (
                        <button
                          onClick={() => handleUnclaimTask(dashboardData.activeTask!.task.id)}
                          className="p-2 px-3 rounded-md border border-hairline hover:border-semantic-error hover:text-semantic-error bg-surface-card transition-colors font-mono text-xs"
                        >
                          Unclaim
                        </button>
                      )}
                      <Link
                        to={`/tasks/${dashboardData.activeTask.task.id}`}
                        className="btn-cursor-primary text-xs flex items-center gap-1"
                      >
                        {dashboardData.activeTask.status === 'PENDING' ? 'Submit PR' : 'View Detail'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <hr className="border-hairline" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-body text-left">
                    <div>
                      <span className="text-muted">Repository:</span>{' '}
                      <a href={dashboardData.activeTask.task.repoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate block max-w-[200px]">
                        {dashboardData.activeTask.task.repoUrl.replace('https://github.com/', '')}
                      </a>
                    </div>
                    <div>
                      <span className="text-muted">Bounty:</span>{' '}
                      <span className="text-ink">
                        {dashboardData.activeTask.task.cashReward > 0 ? `$${dashboardData.activeTask.task.cashReward.toFixed(2)}` : 'Volunteer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">Points:</span>{' '}
                      <span className="text-timeline-done font-bold">+{dashboardData.activeTask.task.reward} pts</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-hairline bg-canvas-soft">
                  <AlertTriangle className="w-8 h-8 text-muted mb-3" />
                  <h4 className="font-display font-semibold text-sm text-ink mb-1">No Active Claims</h4>
                  <p className="text-xs text-body max-w-xs mb-4">
                    You are not currently working on any tasks. Claim an issue from the explorer to begin.
                  </p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="btn-cursor-primary text-xs"
                  >
                    Browse Tasks
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Explore tasks tab */}
          {activeTab === 'explore' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-hairline">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-body" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted focus:border-primary/50 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto font-mono text-xs">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-2 rounded-md border border-hairline bg-canvas-soft text-body focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Language: All</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Rust">Rust</option>
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 rounded-md border border-hairline bg-canvas-soft text-body focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Difficulty: All</option>
                    <option value="STARTER">Starter</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>

                  <select
                    value={selectedReward}
                    onChange={(e) => setSelectedReward(e.target.value)}
                    className="px-3 py-2 rounded-md border border-hairline bg-canvas-soft text-body focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Reward Type: All</option>
                    <option value="paid">Paid Bounty</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              {/* Task Grid */}
              {tasksLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="h-60 rounded-lg border border-hairline bg-white animate-pulse"></div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-hairline bg-white">
                  <Search className="w-8 h-8 text-muted mb-2" />
                  <h4 className="font-display font-semibold text-sm text-ink mb-1">No Tasks Found</h4>
                  <p className="text-xs text-body">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group relative flex flex-col p-5 rounded-lg bg-white border border-hairline cursor-card-hover"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        <span className="text-primary font-mono text-xs font-semibold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          +{task.reward} pts
                        </span>
                      </div>

                      {/* Body */}
                      <div className="space-y-2.5 mb-4 text-left">
                        <div className="text-[10px] font-mono text-body truncate">
                          {task.org?.name || 'GitHub Project'}
                        </div>
                        <h3 className="font-display font-semibold text-sm text-ink leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {task.title}
                        </h3>
                        <p className="text-xs text-body line-clamp-3 leading-relaxed h-14">
                          {task.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {task.tags.split(',').map((tag) => (
                          <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded-xs bg-canvas-soft border border-hairline text-body">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>

                      {/* Footer Claim CTA */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-hairline">
                        <span className="text-[10px] font-mono text-body">
                          {task.cashReward > 0 ? `$${task.cashReward.toFixed(2)} bounty` : 'Volunteer'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="text-body hover:text-ink text-[10px] font-mono py-1 px-2.5 rounded-md border border-hairline bg-surface-card"
                          >
                            Specs
                          </Link>
                          {task.status === 'OPEN' && user?.role === 'CODER' && (
                            <button
                              onClick={() => handleClaimTask(task.id)}
                              className="btn-cursor-primary py-1 px-3 text-[10px]"
                            >
                              Claim →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 3 Columns: Terminal Activity Feed */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="font-display font-semibold text-xs text-body uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            CLI Operation Feed
          </h3>

          <div className="ide-pane p-4 space-y-3 h-[340px] text-left select-text border border-hairline bg-canvas-soft relative overflow-hidden">
            <div className="border-b border-hairline -mx-4 -mt-4 mb-2 pb-2 px-4 flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 mr-1.5"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 mr-1.5"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              <span className="text-[9px] text-muted font-mono ml-3">activity_log.sh</span>
            </div>
            
            <div className="space-y-2.5 font-mono text-[10px] leading-relaxed text-body">
              <div>
                <span className="text-muted">[22:30:15]</span> <span className="text-primary font-semibold">AUTH</span> init token handshake.
              </div>
              <div>
                <span className="text-muted">[22:30:16]</span> <span className="text-semantic-success">LOAD</span> user profile data.
              </div>
              <div>
                <span className="text-muted">[22:35:42]</span> <span className="text-timeline-done font-bold">CLAIM</span> task id DTC_auth_leak.
              </div>
              <div>
                <span className="text-muted">[22:35:42]</span> <span className="text-primary font-semibold">LOCK</span> starting 72h countdown.
              </div>
              <div>
                <span className="text-muted">[22:40:02]</span> <span className="text-semantic-success">SYNC</span> verified on-chain badge ledger.
              </div>
              <div className="text-muted animate-pulse">
                $&gt; listening for remote webhook...
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Credentials Badges Hex Grid */}
      {!loading && dashboardData && (
        <section className="space-y-6 pt-6">
          <div className="space-y-1 text-left">
            <h3 className="font-display text-lg font-normal text-ink flex items-center gap-2">
              <Award className="text-primary w-5 h-5 animate-pulse" />
              Verified Contribution Credentials
            </h3>
            <p className="text-xs text-body">
              Cryptographic tokens verifying your code contributions.
            </p>
          </div>

          {dashboardData.user.badges && dashboardData.user.badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 pt-2">
              {dashboardData.user.badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center text-center space-y-2 group">
                  <div className="w-16 h-16 rounded-md flex items-center justify-center border border-hairline bg-white shadow-sm relative">
                    <Award className="w-8 h-8 text-timeline-done relative z-10" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono text-ink truncate max-w-[120px]">
                      {badge.type.replace('_', ' ')}
                    </div>
                    <div className="text-[9px] font-mono text-body">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-lg border border-hairline bg-white">
              <p className="text-xs font-mono text-body">
                No badges earned yet. Complete your first task to unlock the <span className="text-primary">FIRST_CONTRIBUTION</span> badge!
              </p>
            </div>
          )}
        </section>
      )}

    </div>
  );
};
