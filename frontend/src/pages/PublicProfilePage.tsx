// frontend/src/pages/PublicProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Flame, GitPullRequest, Globe, Twitter, Calendar, CheckCircle, HelpCircle, Terminal } from 'lucide-react';
import { User } from '../types';

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/users/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then((data) => setProfileUser(data))
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [username]);

  const getLevelBadge = (level?: string) => {
    switch (level) {
      case 'BEGINNER': return { text: 'Beginner', style: 'border-hairline text-body bg-canvas-soft' };
      case 'ACTIVE': return { text: 'Active Contributor', style: 'border-timeline-read/40 text-ink bg-timeline-read/15' };
      case 'VERIFIED': return { text: 'Verified Developer', style: 'border-timeline-edit/40 text-ink bg-timeline-edit/15' };
      case 'MENTOR_LEVEL': return { text: 'Mentor Level', style: 'border-timeline-done/40 text-ink bg-timeline-done/15' };
      default: return { text: 'Beginner', style: 'border-hairline text-body' };
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-40 bg-hairline rounded-lg w-full"></div>
        <div className="h-64 bg-hairline rounded-lg"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-muted mx-auto" />
        <h2 className="font-display text-xl font-normal text-ink">Profile Not Found</h2>
        <p className="text-xs text-body leading-relaxed">
          The contributor profile for &quot;{username}&quot; does not exist.
        </p>
        <Link
          to="/"
          className="btn-cursor-primary text-xs"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const approvedCount = profileUser.submissions?.filter(s => s.status === 'APPROVED').length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 select-text relative">

      {/* 1. Profile Header Card */}
      <div className="cursor-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 rounded-lg bg-white relative overflow-hidden text-left">
        <div className="flex items-center gap-4">
          <img
            src={profileUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.id}`}
            alt={profileUser.name}
            className="w-14 h-14 rounded-full border border-hairline"
          />
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-normal text-ink flex items-center gap-2">
              {profileUser.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-body">&gt; @{profileUser.githubLogin}</span>
              <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${getLevelBadge(profileUser.level).style}`}>
                {getLevelBadge(profileUser.level).text}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 font-mono text-xs text-body">
          <div className="p-3 bg-canvas-soft border border-hairline rounded-md text-center min-w-[80px]">
            <div className="text-[9px] text-muted uppercase">Reputation</div>
            <div className="text-sm font-bold text-timeline-done mt-1 flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5" />
              {profileUser.reputation}
            </div>
          </div>

          <div className="p-3 bg-canvas-soft border border-hairline rounded-md text-center min-w-[80px]">
            <div className="text-[9px] text-muted uppercase">Merged PRs</div>
            <div className="text-sm font-bold text-semantic-success mt-1 flex items-center justify-center gap-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {approvedCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Developer Bio & Stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        
        {/* Bio */}
        <div className="md:col-span-2 cursor-card p-6 bg-white space-y-4">
          <h3 className="font-display font-semibold text-xs text-body uppercase tracking-widest">About Contributor</h3>
          <p className="text-sm text-body leading-relaxed">
            {profileUser.profile?.bio || 'This developer is busy writing code.'}
          </p>

          <hr className="border-hairline" />

          {/* Socials */}
          <div className="flex flex-wrap gap-4 text-xs font-mono text-body">
            {profileUser.profile?.website && (
              <a href={profileUser.profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Globe className="w-4 h-4 text-primary" />
                {profileUser.profile.website.replace('https://', '')}
              </a>
            )}
            {profileUser.profile?.twitter && (
              <a href={`https://twitter.com/${profileUser.profile.twitter}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Twitter className="w-4 h-4 text-primary" />
                @{profileUser.profile.twitter}
              </a>
            )}
            <div className="flex items-center gap-1.5 text-muted">
              <Calendar className="w-4 h-4" />
              Joined {new Date(profileUser.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Stack */}
        <div className="cursor-card p-6 bg-white space-y-4">
          <h3 className="font-display font-semibold text-xs text-body uppercase tracking-widest">Tech Stack</h3>
          
          {profileUser.profile?.stack ? (
            <div className="flex flex-wrap gap-2">
              {profileUser.profile.stack.split(',').map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md border border-hairline bg-canvas-soft text-xs font-mono text-body"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted italic">No programming stacks specified.</p>
          )}
        </div>

      </div>

      {/* 3. Credentials Grid */}
      <section className="space-y-4 text-left">
        <h3 className="font-display font-semibold text-xs text-body uppercase tracking-widest">Earned Credentials</h3>
        
        {profileUser.badges && profileUser.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {profileUser.badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center text-center space-y-2 group">
                <div className="w-16 h-16 rounded-md flex items-center justify-center border border-hairline bg-white shadow-sm relative">
                  <Award className="w-6 h-6 text-timeline-done relative z-10" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono text-ink truncate max-w-[100px]">
                    {badge.type.replace('_', ' ')}
                  </div>
                  <div className="text-[8px] font-mono text-muted">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-mono text-muted italic">No credentials logged yet.</p>
        )}
      </section>

      {/* 4. Contribution log */}
      <section className="space-y-6 text-left">
        <h3 className="font-display font-semibold text-xs text-body uppercase tracking-widest">Verified Contribution Log</h3>

        {profileUser.submissions && profileUser.submissions.filter(s => s.status === 'APPROVED').length > 0 ? (
          <div className="border-l border-hairline ml-3 pl-6 space-y-6">
            {profileUser.submissions
              .filter((s) => s.status === 'APPROVED')
              .map((sub) => (
                <div key={sub.id} className="relative space-y-3">
                  <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border border-primary bg-canvas"></span>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-ink">
                      {sub.task.org?.name || 'GitHub Repo'}
                    </span>
                    <span className="text-body font-mono">/ {sub.task.title}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded ${getDifficultyColor(sub.task.difficulty)}`}>
                      {sub.task.difficulty}
                    </span>
                    <span className="text-[9px] font-mono text-muted ml-auto">
                      Merged {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Submission Diff terminal */}
                  <div className="ide-pane p-4 space-y-2 text-xs leading-relaxed overflow-x-auto border border-hairline bg-canvas-soft">
                    <div className="border-b border-hairline -mx-4 -mt-4 mb-2 pb-2 px-4 flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 mr-1.5"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 mr-1.5"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                      <span className="text-[9px] text-muted font-mono ml-3">commit_verification.sh</span>
                    </div>
                    <div className="text-body font-mono">
                      $&gt; git log -n 1 --format=short
                    </div>
                    <div className="text-muted text-[11px] select-text">
                      &gt; {sub.description}
                    </div>
                    <div className="pt-1">
                      <a href={sub.prUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-mono text-[10px]">
                        <GitPullRequest className="w-3.5 h-3.5" />
                        PR #{sub.prUrl.split('/').pop()} commit logs
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-xs font-mono text-muted italic">No merged contributions logged yet.</p>
        )}
      </section>

    </div>
  );
};
