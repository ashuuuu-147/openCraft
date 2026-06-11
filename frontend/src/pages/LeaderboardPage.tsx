// frontend/src/pages/LeaderboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Flame, Users, ShieldAlert, Award as BadgeIcon } from 'lucide-react';
import { User } from '../types';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER': return { text: 'Beginner', style: 'border-hairline text-body bg-canvas-soft' };
      case 'ACTIVE': return { text: 'Active', style: 'border-timeline-read/40 text-ink bg-timeline-read/15' };
      case 'VERIFIED': return { text: 'Verified', style: 'border-timeline-edit/40 text-ink bg-timeline-edit/15' };
      case 'MENTOR_LEVEL': return { text: 'Mentor', style: 'border-timeline-done/40 text-ink bg-timeline-done/15' };
      default: return { text: 'Beginner', style: 'border-hairline text-body' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-1 text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-normal text-ink flex items-center gap-2">
          <Award className="w-8 h-8 text-timeline-done" />
          Platform Contributor Rankings
        </h2>
        <p className="text-sm text-body">
          Honoring developers shipping verified open-source contributions.
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-hairline rounded-lg animate-pulse w-full"></div>
      ) : leaderboard.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-hairline bg-white">
          <Users className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-xs font-mono text-body">
            No contributor rankings logged yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-canvas-soft text-body">
                <th className="p-4 text-center w-16">Rank</th>
                <th className="p-4">Developer</th>
                <th className="p-4">Level</th>
                <th className="p-4">Credentials</th>
                <th className="p-4 text-right">Reputation Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-body">
              {leaderboard.map((user, idx) => {
                const rank = idx + 1;
                let rankStyle = 'text-body';
                if (rank === 1) rankStyle = 'text-timeline-done font-bold scale-110';
                else if (rank === 2) rankStyle = 'text-muted font-bold';
                else if (rank === 3) rankStyle = 'text-timeline-done font-bold';

                return (
                  <tr key={user.id} className="hover:bg-canvas-soft transition-colors">
                    <td className={`p-4 text-center font-display text-sm ${rankStyle}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border border-hairline"
                        />
                        <div className="space-y-0.5 text-left">
                          <Link
                            to={`/u/${user.githubLogin || user.id}`}
                            className="font-bold text-ink hover:text-primary hover:underline"
                          >
                            {user.name}
                          </Link>
                          <div className="text-[10px] text-muted">@{user.githubLogin || 'coder'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getLevelBadge(user.level).style}`}>
                        {getLevelBadge(user.level).text}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {user.badges && user.badges.slice(0, 3).map((badge: any, bIdx: number) => (
                          <span
                            key={bIdx}
                            title={badge.type.replace('_', ' ')}
                            className="p-1 rounded bg-canvas-soft border border-hairline text-timeline-done flex items-center justify-center"
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                          </span>
                        ))}
                        {user.badges?.length > 3 && (
                          <span className="text-[9px] text-muted pt-1">+{user.badges.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right text-timeline-done font-bold text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {user.reputation} pts
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
