// frontend/src/pages/MentorDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Star, Clock, Check, Briefcase, FileCode, CheckCircle, ArrowRight, Loader2, Code, Terminal } from 'lucide-react';
import { Submission } from '../types';

interface MentorDashboardPageProps {
  addToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const MentorDashboardPage: React.FC<MentorDashboardPageProps> = ({ addToast }) => {
  const [queue, setQueue] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mentor Stats (mocked)
  const [stats] = useState({
    reviewsCompleted: 24,
    avgTurnaround: '14.5 hours',
    earnings: 320.00
  });

  const fetchQueue = () => {
    setLoading(true);
    fetch('/api/reviews/queue', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load queue');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setQueue(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    setStars(5);
    setComment('');
  };

  const handleAction = async (action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED') => {
    if (!selectedSub) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          action,
          comment,
          score: stars,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error || 'Failed to submit review', 'error');
      } else {
        addToast(`Review submitted: ${action}!`, 'success');
        setSelectedSub(null);
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred submitting the review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const quickComments = [
    'Clean commit structure and clear variable naming.',
    'PR adheres to repository style guides perfectly.',
    'Missing unit tests for edge-case payloads.',
    'Please rebase and resolve conflicts with the master branch.',
    'Typo found in variables or documentation comments.',
  ];

  const handleQuickComment = (phrase: string) => {
    setComment((prev) => (prev ? `${prev}\n${phrase}` : phrase));
  };

  const renderMockDiff = (taskTitle: string) => {
    const title = taskTitle.toLowerCase();
    if (title.includes('typo') || title.includes('readme')) {
      return (
        <div className="font-mono text-[11px] space-y-1">
          <div className="text-muted">diff --git a/README.md b/README.md</div>
          <div className="text-muted">--- a/README.md</div>
          <div className="text-muted">+++ b/README.md</div>
          <div className="text-semantic-error bg-semantic-error/10 px-1">- This is a recieving demo client config.</div>
          <div className="text-semantic-success bg-semantic-success/10 px-1">+ This is a receiving demo client config.</div>
        </div>
      );
    }
    if (title.includes('semicolon') || title.includes('utils')) {
      return (
        <div className="font-mono text-[11px] space-y-1">
          <div className="text-muted">diff --git a/src/utils.js b/src/utils.js</div>
          <div className="text-muted">--- a/src/utils.js</div>
          <div className="text-muted">+++ b/src/utils.js</div>
          <div className="text-semantic-error bg-semantic-error/10 px-1">-   return new Date(ts).toLocaleTimeString()</div>
          <div className="text-semantic-success bg-semantic-success/10 px-1">+   return new Date(ts).toLocaleTimeString();</div>
        </div>
      );
    }
    if (title.includes('stream') || title.includes('generator')) {
      return (
        <div className="font-mono text-[11px] space-y-1">
          <div className="text-muted">diff --git text/openai/client.py b/openai/client.py</div>
          <div className="text-muted">--- a/openai/client.py</div>
          <div className="text-muted">+++ b/openai/client.py</div>
          <div className="text-semantic-error bg-semantic-error/10 px-1">-    return res.json()</div>
          <div className="text-semantic-success bg-semantic-success/10 px-1">+    for chunk in res.iter_lines():</div>
          <div className="text-semantic-success bg-semantic-success/10 px-1">+        if chunk:</div>
          <div className="text-semantic-success bg-semantic-success/10 px-1">+            yield json.loads(chunk)</div>
        </div>
      );
    }
    return (
      <div className="font-mono text-[11px] space-y-1">
        <div className="text-muted">diff --git a/src/main.rs b/src/main.rs</div>
        <div className="text-semantic-error bg-semantic-error/10 px-1">- // old implementation</div>
        <div className="text-semantic-success bg-semantic-success/10 px-1">+ // new verified optimized implementation</div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative text-left">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-normal tracking-lg text-ink flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary animate-pulse" />
            Mentor Review Console
          </h2>
          <p className="text-sm text-body">
            Ensure repository standards by reviewing PR code submissions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 p-4 rounded-md border border-hairline bg-canvas-soft w-full lg:w-auto font-mono text-xs">
          <div className="px-4 border-r border-hairline">
            <div className="text-muted">Reviews Done</div>
            <div className="text-base font-bold text-ink mt-1">{stats.reviewsCompleted}</div>
          </div>
          <div className="px-4 border-r border-hairline">
            <div className="text-muted">Avg Speed</div>
            <div className="text-base font-bold text-ink mt-1">{stats.avgTurnaround}</div>
          </div>
          <div className="px-4">
            <div className="text-muted">Earnings</div>
            <div className="text-base font-bold text-primary mt-1">${stats.earnings.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 2. Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Queue */}
        <div className={`space-y-4 ${selectedSub ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
          <h3 className="font-display font-normal tracking-lg text-lg text-ink">
            Review Queue
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-hairline text-body ml-2">
              {queue.length} pending
            </span>
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((s) => (
                <div key={s} className="h-28 rounded-md border border-hairline bg-white animate-pulse"></div>
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div className="cursor-card flex flex-col items-center justify-center p-12 text-center bg-white">
              <CheckCircle className="w-8 h-8 text-primary mb-2 animate-bounce" />
              <h4 className="font-display font-normal text-sm text-ink mb-1">Queue is Empty</h4>
              <p className="text-xs text-body">All contributions have been verified!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`p-4 rounded-md border cursor-pointer transition-all ${
                    selectedSub?.id === sub.id
                      ? 'border-primary bg-white shadow-none'
                      : 'border-hairline bg-canvas-soft hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-mono text-body truncate block max-w-[150px]">
                      {sub.task.org?.name || 'GitHub Repo'}
                    </span>
                    <span className="text-[9px] font-mono text-primary font-bold">
                      +{sub.task.reward} pts
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-ink line-clamp-1 mb-1 font-mono">
                    {sub.task.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-[10px] font-mono text-body mt-3">
                    <span>by @{sub.coder?.githubLogin || 'coder'}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-primary" />
                      Pending Review
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Split view */}
        <AnimatePresence>
          {selectedSub && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
            >
              {/* Diff Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-normal tracking-md text-xs text-body uppercase">Code Diff</h3>
                  <a
                    href={selectedSub.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                  >
                    View PR on GitHub
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Contributor notes */}
                <div className="p-4 rounded-md border border-hairline bg-white space-y-1.5 text-xs">
                  <div className="text-[10px] font-mono text-muted">CONTRIBUTOR DESCRIPTION:</div>
                  <p className="text-body leading-relaxed select-text font-mono">{selectedSub.description}</p>
                </div>

                {/* Git diff terminal */}
                <div className="ide-pane overflow-x-auto select-text border border-hairline bg-canvas-soft p-4 rounded-md">
                  <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-hairline-soft">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    <span className="text-[10px] text-muted font-mono ml-2">pull_request.patch</span>
                  </div>
                  {renderMockDiff(selectedSub.task.title)}
                </div>
              </div>

              {/* Review Panel */}
              <div className="space-y-4">
                <h3 className="font-display font-normal tracking-md text-xs text-body uppercase">Grade &amp; Publish</h3>

                <div className="cursor-card p-5 bg-white space-y-5">
                  {/* Score */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs text-body">PR Competency Score</label>
                    <div className="flex gap-2 text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStars(s)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${s <= stars ? 'fill-primary text-primary' : 'text-muted'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-3">
                    <label className="font-mono text-xs text-body">Detailed Review Comment</label>
                    
                    {/* Quick tokens */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {quickComments.map((phr, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleQuickComment(phr)}
                          className="text-[9px] font-mono px-2 py-0.5 rounded border border-hairline bg-canvas-soft text-body hover:border-hairline-strong hover:text-ink transition-all"
                        >
                          {phr.substring(0, 15)}...
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={5}
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review logs. commends structural updates or details reasons for requested updates..."
                      className="w-full px-3 py-2 rounded-md border border-hairline bg-canvas-soft text-xs text-ink placeholder-muted-soft focus:border-primary/50 focus:outline-none focus:ring-0"
                    ></textarea>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                    <button
                      onClick={() => handleAction('REJECTED')}
                      disabled={submitting}
                      className="py-2.5 rounded border border-semantic-error/30 text-semantic-error hover:bg-semantic-error/10 font-bold transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('CHANGES_REQUESTED')}
                      disabled={submitting}
                      className="py-2.5 rounded border border-timeline-done/35 text-timeline-done hover:bg-timeline-done/10 font-bold transition-all"
                    >
                      Request Mod
                    </button>
                    <button
                      onClick={() => handleAction('APPROVED')}
                      disabled={submitting}
                      className="py-2.5 rounded bg-semantic-success text-white font-bold hover:bg-semantic-success/90 transition-all"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
