// frontend/src/types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CODER' | 'MENTOR' | 'ORG_ADMIN' | 'PLATFORM_ADMIN';
  level: 'BEGINNER' | 'ACTIVE' | 'VERIFIED' | 'MENTOR_LEVEL';
  reputation: number;
  githubLogin?: string;
  avatar?: string;
  createdAt: string;
  profile?: Profile;
  badges?: Badge[];
  submissions?: Submission[];
  rewards?: Reward[];
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  avatar?: string;
  stack: string; // comma-separated, e.g. "React,Node"
  website?: string;
  twitter?: string;
  timezone?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  userId: string;
  name: string;
  website?: string;
  logo?: string;
  description?: string;
  verified: boolean;
  createdAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'BUG_FIX' | 'FEATURE' | 'DOCUMENTATION' | 'TESTING' | 'REFACTOR';
  difficulty: 'STARTER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';
  repoUrl: string;
  issueUrl?: string;
  orgId?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'EXPIRED';
  reward: number; // points
  cashReward: number; // USD
  tags: string; // comma-separated, e.g. "javascript,docs"
  deadline?: string;
  createdAt: string;
  org?: {
    name: string;
    logo?: string;
    verified: boolean;
  };
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  taskId: string;
  coderId: string;
  prUrl: string;
  description: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  mentorId?: string;
  submittedAt: string;
  claimedAt?: string;
  claimExpiry?: string;
  task: Task;
  coder: {
    id: string;
    name: string;
    githubLogin?: string;
    level: string;
    profile?: {
      avatar?: string;
    }
  };
  reviews?: Review[];
}

export interface Review {
  id: string;
  submissionId: string;
  mentorId: string;
  action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  comment?: string;
  score?: number;
  reviewedAt: string;
  mentor?: {
    id: string;
    name: string;
    profile?: {
      avatar?: string;
    }
  };
}

export interface Badge {
  id: string;
  coderId: string;
  type: 'FIRST_CONTRIBUTION' | 'STREAK_7' | 'STREAK_30' | 'LANGUAGE_EXPERT' | 'MENTOR_APPROVED' | 'TOP_CONTRIBUTOR' | 'COMMUNITY_STAR';
  earnedAt: string;
}

export interface Reward {
  id: string;
  userId: string;
  taskId: string;
  points: number;
  cash: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  paidAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  user: User;
  stats: {
    tasksCompleted: number;
    tasksSubmitted: number;
    reputationScore: number;
    totalEarned: number;
  };
  activeTask?: Submission;
}
