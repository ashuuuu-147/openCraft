// frontend/src/pages/TaskDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Github, GitPullRequest, Flame, Clock, Check, AlertCircle, ChevronLeft, Send, History, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, User } from '../types';

interface TaskDetailPageProps {
  user: User | null;
  addToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ user, addToast }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab state inside code terminal
  const [activeFileTab, setActiveFileTab] = useState<'specs' | 'env'>('specs');

  // Form states for submission
  const [prUrl, setPrUrl] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskDetails = () => {
    setLoading(true);
    fetch(`/api/tasks/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Task not found');
        return res.json();
      })
      .then((data) => setTask(data))
      .catch((err) => {
        console.error(err);
        addToast('Failed to load task details', 'error');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleClaim = async () => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/claim`, {
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
        addToast('Task claimed! You have 72 hours to submit your pull request.', 'success');
        fetchTaskDetails();
      }
    } catch (err) {
      console.error(err);
      addToast('Error claiming task', 'error');
    }
  };

  const handleUnclaim = async () => {
    if (!task) return;
    if (!window.confirm('Are you sure you want to release your claim?')) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/unclaim`, {
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
        addToast('Task released back to the explorer.', 'info');
        fetchTaskDetails();
      }
    } catch (err) {
      console.error(err);
      addToast('Error unclaiming task', 'error');
    }
  };

  const handleSubmitPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const githubPrRegex = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
    if (!githubPrRegex.test(prUrl)) {
      addToast('PR URL must be a valid GitHub Pull Request link.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          taskId: task.id,
          prUrl,
          description: submitDescription,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Failed to submit PR', 'error');
      } else {
        addToast('PR submitted for review! Maintainers have been notified.', 'success');
        
        // Multi-angle confetti burst
        confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });

        setPrUrl('');
        setSubmitDescription('');
        fetchTaskDetails();
      }
    } catch (err) {
      console.error(err);
      addToast('Error submitting PR', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const userClaim = task?.submissions?.find(
    (s) => s.coderId === user?.id && ['PENDING', 'CHANGES_REQUESTED', 'IN_REVIEW', 'APPROVED'].includes(s.status)
  );

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'STARTER': return 'text-ink bg-timeline-grep/30 border-timeline-grep/50';
      case 'EASY': return 'text-ink bg-timeline-read/30 border-timeline-read/50';
      case 'MEDIUM': return 'text-ink bg-timeline-done/35 border-timeline-done/60';
      case 'HARD': return 'text-ink bg-timeline-thinking/40 border-timeline-thinking/60';
      case 'ADVANCED': return 'text-white bg-primary border-primary';
      default: return 'text-body bg-canvas-soft border-hairline';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'OPEN': return 'text-ink bg-timeline-grep/30 border-timeline-grep/50';
      case 'IN_PROGRESS': return 'text-ink bg-timeline-read/30 border-timeline-read/50';
      case 'UNDER_REVIEW': return 'text-ink bg-timeline-thinking/40 border-timeline-thinking/60';
      case 'COMPLETED': return 'text-white bg-semantic-success border-semantic-success';
      default: return 'text-body bg-canvas-soft border-hairline';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-hairline rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-12 bg-hairline rounded w-3/4"></div>
            <div className="h-4 bg-hairline rounded w-1/4"></div>
            <div className="h-64 bg-hairline rounded"></div>
          </div>
          <div className="lg:col-span-4 h-96 bg-hairline rounded"></div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back link */}
      <div className="text-left">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-mono text-body hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
          BACK TO TASK EXPLORER
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Spec Sheet & Submission logs */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(task.difficulty)}`}>
                {task.difficulty}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-hairline bg-canvas-soft text-body flex items-center gap-1">
                <GitPullRequest className="w-3.5 h-3.5" />
                {task.type}
              </span>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${getStatusBadge(task.status)}`}>
                {task.status === 'IN_PROGRESS' ? 'CLAIMED' : task.status}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-normal text-ink leading-tight">
              {task.title}
            </h1>

            {/* Org info */}
            {task.org && (
              <div className="flex items-center gap-3 p-2 px-3 rounded-md border border-hairline bg-white w-max">
                <img src={task.org.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${task.org.name}`} alt={task.org.name} className="w-5 h-5 rounded border border-hairline" />
                <span className="text-xs font-mono text-ink font-semibold">{task.org.name}</span>
                {task.org.verified && (
                  <span className="text-[9px] font-mono text-semantic-success bg-surface-strong/30 border border-hairline px-1.5 py-0.5 rounded">Verified Org</span>
                )}
              </div>
            )}
          </div>

          <hr className="border-hairline" />

          {/* IDE Editor Spec */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-xs text-body uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-primary" />
                Technical Specification Editor
              </h3>
            </div>

            <div className="flex flex-col border border-hairline bg-canvas-soft rounded-lg relative overflow-hidden shadow-sm">
              {/* Tab Header */}
              <div className="flex bg-canvas border-b border-hairline text-xs font-mono">
                <button
                  onClick={() => setActiveFileTab('specs')}
                  className={`px-4 py-2.5 flex items-center gap-2 border-r border-hairline transition-all ${
                    activeFileTab === 'specs' 
                      ? 'bg-canvas-soft text-ink font-semibold border-t-2 border-t-primary' 
                      : 'bg-canvas text-body hover:text-ink hover:bg-canvas-soft'
                  }`}
                >
                  <span className="text-primary font-bold">#</span> issue_specs.md
                </button>
                <button
                  onClick={() => setActiveFileTab('env')}
                  className={`px-4 py-2.5 flex items-center gap-2 border-r border-hairline transition-all ${
                    activeFileTab === 'env' 
                      ? 'bg-canvas-soft text-ink font-semibold border-t-2 border-t-primary' 
                      : 'bg-canvas text-body hover:text-ink hover:bg-canvas-soft'
                  }`}
                >
                  <span className="text-primary font-bold">{}</span> setup_env.json
                </button>
                
                {/* Visual Mac dots */}
                <div className="ml-auto flex items-center gap-1.5 pr-4">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* Editor Code Body */}
              <div className="p-6 text-left font-mono text-xs overflow-x-auto min-h-[200px] select-text">
                {activeFileTab === 'specs' ? (
                  <div className="text-body whitespace-pre-wrap leading-relaxed">
                    {task.description}
                  </div>
                ) : (
                  <div className="text-body space-y-1">
                    <div>{`{`}</div>
                    <div className="pl-4"><span className="text-primary">"repository"</span>: "{task.repoUrl}",</div>
                    <div className="pl-4"><span className="text-primary">"difficulty"</span>: "{task.difficulty}",</div>
                    <div className="pl-4"><span className="text-primary">"language"</span>: "{task.tags.split(',')[0]}",</div>
                    <div className="pl-4"><span className="text-primary">"setup_command"</span>: "npm install && npm run dev",</div>
                    <div className="pl-4"><span className="text-primary">"test_command"</span>: "npm run test"</div>
                    <div>{`}`}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GitHub Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={task.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-hairline hover:border-primary hover:text-primary bg-white text-xs font-mono text-body transition-all"
            >
              <Github className="w-4 h-4 text-primary" />
              Source Repository
            </a>
            {task.issueUrl && (
              <a
                href={task.issueUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-hairline hover:border-primary hover:text-primary bg-white text-xs font-mono text-body transition-all"
              >
                <AlertCircle className="w-4 h-4 text-timeline-done" />
                GitHub Issue Tracker
              </a>
            )}
          </div>

          {/* Git Commit-Style Submission Form */}
          {userClaim && (userClaim.status === 'PENDING' || userClaim.status === 'CHANGES_REQUESTED') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="cursor-card p-6 rounded-lg bg-white space-y-5 text-left"
            >
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
                  <Send className="w-4.5 h-4.5 text-primary" />
                  Ship PR Contribution
                </h3>
                <p className="text-xs text-body">
                  Complete the issue externally on GitHub, then link the branch.
                </p>
              </div>

              <form onSubmit={handleSubmitPR} className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-body uppercase tracking-wider text-[10px]">GitHub PR URL Link</label>
                  <input
                    type="url"
                    required
                    value={prUrl}
                    onChange={(e) => setPrUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo/pull/12"
                    className="w-full px-4 py-3 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted focus:border-primary/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-body uppercase tracking-wider text-[10px]">Commit Message / Details</label>
                  <textarea
                    required
                    rows={4}
                    value={submitDescription}
                    onChange={(e) => setSubmitDescription(e.target.value)}
                    placeholder="Summarize your code fixes. Details edge-cases solved, modules modified, and tests run..."
                    className="w-full px-4 py-3 rounded-md border border-hairline bg-canvas-soft text-ink placeholder-muted focus:border-primary/50 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-md bg-primary hover:bg-primary-active text-on-primary font-bold text-sm transition-colors"
                >
                  {submitting ? 'SHIPPING BRANCH...' : 'PUSH TO MENTOR REVIEW QUEUE'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Submission Timeline */}
          {task.submissions && task.submissions.length > 0 && (
            <div className="space-y-6 text-left">
              <h3 className="font-display font-semibold text-xs text-body uppercase tracking-wider flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-primary" />
                Task Audit Logs
              </h3>

              <div className="border-l border-hairline ml-3 pl-6 space-y-6">
                {task.submissions.map((sub) => (
                  <div key={sub.id} className="relative space-y-3">
                    <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border border-primary bg-canvas"></span>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-ink">
                        @{sub.coder?.githubLogin || 'coder'}
                      </span>
                      <span className="text-body font-mono">pushed branch</span>
                      <a href={sub.prUrl} target="_blank" rel="noreferrer" className="font-mono text-primary hover:underline">
                        PR #{sub.prUrl.split('/').pop()}
                      </a>
                      <span className="text-[10px] font-mono text-muted ml-auto">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-md border border-hairline bg-canvas-soft text-xs text-body leading-relaxed font-mono">
                      {sub.description}
                    </div>

                    {/* Review reports */}
                    {sub.reviews && sub.reviews.map((rev) => (
                      <div key={rev.id} className="ml-4 p-4 rounded-md border border-hairline bg-white space-y-2 border-l-2 border-l-primary font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">Review by @{rev.mentor?.name}</span>
                          <span className={`font-bold uppercase ${rev.action === 'APPROVED' ? 'text-semantic-success' : 'text-semantic-error'}`}>
                            {rev.action}
                          </span>
                        </div>
                        {rev.comment && <p className="text-body text-[11px]">{rev.comment}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6 text-left">
          
          {/* Bounty Card */}
          <div className="cursor-card p-6 bg-white space-y-4">
            <h3 className="font-display font-semibold text-[10px] font-mono text-body uppercase tracking-widest">Reward Value</h3>
            
            <div className="space-y-2">
              <div className="text-ink font-display text-4xl font-semibold">
                <span className="text-xl">$</span>
                {task.cashReward.toFixed(2)}
              </div>
              <div className="text-xs font-mono text-timeline-done font-bold flex items-center gap-1">
                <Flame className="w-4 h-4" />
                +{task.reward} reputation points
              </div>
            </div>

            <hr className="border-hairline" />

            {/* Actions */}
            {task.status === 'COMPLETED' ? (
              <div className="flex items-center gap-2 p-3 rounded-md border border-hairline bg-canvas-soft text-xs text-semantic-success font-mono font-bold justify-center w-full">
                <CheckCircle className="w-4 h-4" />
                VERIFIED &amp; MERGED
              </div>
            ) : userClaim ? (
              <div className="space-y-2">
                <div className="text-center text-xs font-mono p-2.5 rounded-md border border-hairline bg-canvas-soft text-primary font-semibold">
                  CLAIMED BY YOU
                </div>
                {userClaim.status === 'PENDING' && (
                  <button
                    onClick={handleUnclaim}
                    className="w-full py-2 border border-hairline hover:border-semantic-error hover:text-semantic-error hover:bg-semantic-error/5 text-xs font-mono font-bold text-semantic-error rounded-md transition-colors"
                  >
                    Unclaim Issue
                  </button>
                )}
              </div>
            ) : task.status === 'IN_PROGRESS' ? (
              <div className="flex items-center gap-2 p-3 rounded-md border border-hairline bg-canvas-soft text-xs text-timeline-done font-mono font-bold justify-center w-full">
                <Clock className="w-4 h-4 animate-pulse" />
                LOCKED / IN PROGRESS
              </div>
            ) : user?.role === 'CODER' ? (
              <button
                onClick={handleClaim}
                className="btn-cursor-primary w-full py-3"
              >
                CLAIM TASK (72H LOCK)
              </button>
            ) : (
              <div className="text-center text-xs font-mono p-3 rounded-md border border-hairline bg-canvas-soft text-body">
                Sign in as Coder to claim.
              </div>
            )}
          </div>

          {/* Requirements Checklist */}
          <div className="cursor-card p-6 bg-white space-y-4">
            <h3 className="font-display font-semibold text-[10px] font-mono text-body uppercase tracking-widest">Requirements</h3>
            
            <ul className="space-y-4 text-xs font-mono">
              <li className="flex items-start gap-2.5 text-body">
                <Check className="w-4 h-4 text-semantic-success mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-ink font-bold">GitHub Sync Active</span>
                  <p className="text-[10px] text-muted mt-0.5">Required to sync branch commits.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-body">
                <Check className="w-4 h-4 text-semantic-success mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-ink font-bold">Language Match</span>
                  <p className="text-[10px] text-muted mt-0.5">Matches stack tag: {task.tags.split(',')[0]}.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-body">
                <Check className="w-4 h-4 text-semantic-success mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-ink font-bold">Developer Reputation</span>
                  <p className="text-[10px] text-muted mt-0.5">
                    {task.difficulty === 'ADVANCED' ? 'Requires Level >= ACTIVE' : 'Open to all levels.'}
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
