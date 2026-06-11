// frontend/src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Users, Code, Award, Target, Flame, ChevronRight, Check, ArrowRight, Star, ExternalLink, Zap } from 'lucide-react';
import { HeroScene } from '../components/landing/HeroScene';
import { Task } from '../types';

export const LandingPage: React.FC = () => {
  const [featuredTasks, setFeaturedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeaturedTasks(data.slice(0, 3));
        }
      })
      .catch((err) => console.error('Failed to fetch tasks:', err))
      .finally(() => setLoading(false));
  }, []);

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

  const steps = [
    { num: '01', title: 'Choose Stack', desc: 'Pick your weapon: JavaScript, Python, or Rust. Customize your target tags.', color: 'bg-timeline-thinking text-ink' },
    { num: '02', title: 'Warm-up', desc: 'Fix minor typo issues or add unit tests to build initial confidence.', color: 'bg-timeline-grep text-ink' },
    { num: '03', title: 'Claim Issue', desc: 'Reserve a real open-source issue. It is locked exclusively for you for 72 hours.', color: 'bg-timeline-read text-ink' },
    { num: '04', title: 'Review Gate', desc: 'Submit your PR. A verified senior tech lead reviews and comments on your branch.', color: 'bg-timeline-edit text-ink' },
    { num: '05', title: 'Paid & Badged', desc: 'Get points, unlock cryptographic credentials, and receive cash payouts.', color: 'bg-timeline-done text-white' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-ink selection:bg-primary/20 selection:text-ink">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left: Branding & CTA */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface-strong/30 text-body text-[10px] font-mono tracking-widest uppercase"
            >
              <Zap className="w-3.5 h-3.5 animate-pulse text-primary" />
              <span>Version 1.0.0 Dev Release</span>
            </motion.div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-normal tracking-mega leading-[1.1] text-ink">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="block"
                >
                  Learn by shipping.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="block"
                >
                  Get verified.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="block text-primary"
                >
                  Get hired.
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-sm sm:text-base text-body leading-relaxed max-w-md font-normal"
              >
                OpenCraft bridges the gap between learning and employment. We route you through real, locked open-source issues reviewed by maintainers to build a trustable developer footprint.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/signup"
                className="btn-cursor-primary px-6 py-3.5 text-sm"
              >
                START CONTRIBUTING
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/dashboard"
                className="btn-cursor-secondary px-6 py-3.5 text-sm"
              >
                EXPLORE TASKS
              </Link>
            </motion.div>

            {/* Micro Stats Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-hairline font-mono text-xs text-body"
            >
              <div>
                <div className="text-[10px] text-muted uppercase">Issues open</div>
                <div className="text-sm font-bold text-ink mt-1">142 Active</div>
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase">Average Payout</div>
                <div className="text-sm font-bold text-primary mt-1">$45.00</div>
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase">Verified Engineers</div>
                <div className="text-sm font-bold text-ink mt-1">1,400+</div>
              </div>
            </motion.div>
          </div>

          {/* Right: Floating 3D Graph Frame in a clean IDE Mockup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="lg:col-span-7 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[620px] ide-mockup-card p-1">
              <div className="p-4 bg-canvas-soft rounded-lg relative z-10">
                <HeroScene />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. Value Props Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="text-center space-y-3 mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-lg text-ink">
            Aligning the Open Source Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-body max-w-sm mx-auto">
            Providing value to developers, project maintainers, and scaling software companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coders */}
          <div className="cursor-card flex flex-col p-8 relative overflow-hidden group cursor-card-hover text-left bg-white">
            <div className="p-3 bg-canvas-soft border border-hairline rounded-md w-max mb-6 text-primary">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="font-display font-normal text-xl text-ink mb-3">For Contributors</h3>
            <p className="text-sm text-body leading-relaxed mb-6 h-16">
              Skip trivial tutorials. Learn by coding real, locked pull requests, receive feedback from verified maintainers, and earn financial bounties.
            </p>
            <ul className="space-y-2.5 mt-auto text-xs font-mono text-body">
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> 72h exclusive issue locking</li>
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Live async code review</li>
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Cryptographic level badges</li>
            </ul>
          </div>

          {/* Companies */}
          <div className="cursor-card flex flex-col p-8 relative overflow-hidden group cursor-card-hover text-left bg-white">
            <div className="p-3 bg-canvas-soft border border-hairline rounded-md w-max mb-6 text-primary">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display font-normal text-xl text-ink mb-3">For Organizations</h3>
            <p className="text-sm text-body leading-relaxed mb-6 h-16">
              Scout top engineers based on verified, hands-on repository contributions. Onboard juniors who have already compiled and shipped your codebase.
            </p>
            <ul className="space-y-2.5 mt-auto text-xs font-mono text-body">
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Direct talent directory scout</li>
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Verified competency graphs</li>
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Seamless hiring workflow</li>
            </ul>
          </div>

          {/* Mentors */}
          <div className="cursor-card flex flex-col p-8 relative overflow-hidden group cursor-card-hover text-left bg-white">
            <div className="p-3 bg-canvas-soft border border-hairline rounded-md w-max mb-6 text-primary">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-normal text-xl text-ink mb-3">For Reviewers</h3>
            <p className="text-sm text-body leading-relaxed mb-6 h-16">
              Help onboard the next generation of engineers, review code submissions asynchronously on your dashboard, and earn review bounties.
            </p>
            <ul className="space-y-2.5 mt-auto text-xs font-mono text-body">
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Paid per code review completed</li>
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Asynchronous workload</li>
              <li className="flex items-center gap-2"><Check className="text-semantic-success w-4 h-4" /> Mentorship reputation index</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Re-architected Interactive Circuit Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="text-center space-y-3 mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-lg text-ink">
            The Contribution Circuit
          </h2>
          <p className="text-xs sm:text-sm text-body max-w-sm mx-auto">
            Aligning development benchmarks to secure a verified portfolio.
          </p>
        </div>

        {/* Timeline Path Track */}
        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Connector Line Backdrop (hidden on mobile) */}
          <div className="absolute top-1/3 left-[10%] right-[10%] h-[1px] bg-hairline-strong hidden lg:block opacity-35 z-0 pointer-events-none"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative group cursor-card flex flex-col p-6 rounded-lg hover:border-hairline-strong z-10 bg-white text-left"
            >
              {/* Step indicator node */}
              <div className="flex justify-between items-center mb-4">
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-hairline shadow-sm ${step.color}`}>
                  STEP {step.num}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-primary opacity-30 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300"></span>
              </div>
              
              <h3 className="font-display font-semibold text-base text-ink mb-2 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-xs text-body leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Tasks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-lg text-ink flex items-center gap-2">
              <Target className="text-primary w-8 h-8" />
              Active Contribution Boards
            </h2>
            <p className="text-xs sm:text-sm text-body">
              Claim an issue and start coding right now. Locked for you on claim.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="font-mono text-xs text-primary hover:text-primary-active flex items-center gap-1 group border-b border-primary/20 pb-0.5"
          >
            BROWSE ALL OPEN ISSUES
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Task Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-64 rounded-lg border border-hairline bg-white animate-pulse flex flex-col p-6 space-y-4">
                <div className="h-6 bg-canvas-soft rounded-md w-1/3"></div>
                <div className="h-10 bg-canvas-soft rounded-md"></div>
                <div className="h-4 bg-canvas-soft rounded-md w-3/4"></div>
                <div className="h-10 bg-canvas-soft rounded-md mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTasks.map((task) => (
              <div
                key={task.id}
                className="group relative cursor-card flex flex-col p-6 rounded-lg bg-white cursor-card-hover text-left"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-4 relative z-10">
                  <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </span>
                  <span className="text-primary font-mono text-xs font-semibold flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5" />
                    +{task.reward} pts
                  </span>
                </div>

                {/* Body */}
                <div className="space-y-2.5 mb-5 relative z-10">
                  <div className="text-[10px] font-mono text-body">
                    {task.org?.name || 'GitHub Project'}
                  </div>
                  <h3 className="font-display font-semibold text-base text-ink leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {task.title}
                  </h3>
                  <p className="text-xs text-body line-clamp-3 leading-relaxed h-14">
                    {task.description}
                  </p>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
                  {task.tags.split(',').map((tag) => (
                    <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded-xs bg-canvas-soft border border-hairline text-body">
                      {tag.trim()}
                    </span>
                  ))}
                </div>

                {/* Footer Claim CTA */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-hairline relative z-10">
                  <span className="text-[10px] font-mono text-body">
                    {task.cashReward > 0 ? `$${task.cashReward.toFixed(2)} bounty` : 'Volunteer'}
                  </span>
                  <Link
                    to={`/tasks/${task.id}`}
                    className="inline-flex items-center justify-center p-1.5 px-3 rounded-md border border-hairline hover:border-primary hover:text-primary text-[10px] font-mono font-medium text-ink bg-surface-card transition-all"
                  >
                    Details
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
