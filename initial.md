# 🚀 INITIAL.MD — OPENCRAFT BUILD GUIDE
> The exact file structure, setup commands, and implementation map to go from zero to working MVP.

---

## 1. PROJECT STRUCTURE

```
opencraft/
├── apps/
│   ├── web/                        # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   ├── submissions/
│   │   │   │   └── leaderboard/
│   │   │   ├── (org)/
│   │   │   │   ├── org/register/
│   │   │   │   └── org/dashboard/
│   │   │   ├── (mentor)/
│   │   │   │   └── mentor/queue/
│   │   │   ├── api/
│   │   │   │   └── auth/[...nextauth]/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx             # Landing page
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskDetail.tsx
│   │   │   │   └── SubmitForm.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileHeader.tsx
│   │   │   │   ├── BadgeGrid.tsx
│   │   │   │   └── ContributionGraph.tsx
│   │   │   ├── mentor/
│   │   │   │   ├── ReviewCard.tsx
│   │   │   │   └── ReviewForm.tsx
│   │   │   └── landing/
│   │   │       ├── Hero.tsx
│   │   │       ├── HowItWorks.tsx
│   │   │       ├── Features.tsx
│   │   │       └── CTA.tsx
│   │   ├── lib/
│   │   │   ├── api.ts               # API client
│   │   │   ├── auth.ts              # NextAuth config
│   │   │   ├── utils.ts
│   │   │   └── constants.ts
│   │   ├── store/
│   │   │   └── useAppStore.ts       # Zustand store
│   │   ├── hooks/
│   │   │   ├── useTasks.ts
│   │   │   ├── useProfile.ts
│   │   │   └── useSubmissions.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── public/
│   │       ├── logo.svg
│   │       └── og-image.png
│   │
│   └── api/                         # Node.js / Express backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── tasks.ts
│       │   │   ├── submissions.ts
│       │   │   ├── reviews.ts
│       │   │   ├── users.ts
│       │   │   ├── organizations.ts
│       │   │   └── badges.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rate-limit.ts
│       │   │   └── validate.ts
│       │   ├── services/
│       │   │   ├── github.service.ts
│       │   │   ├── badge.service.ts
│       │   │   ├── review.service.ts
│       │   │   └── notification.service.ts
│       │   ├── workers/
│       │   │   ├── pr-verify.worker.ts
│       │   │   ├── badge.worker.ts
│       │   │   └── email.worker.ts
│       │   ├── db/
│       │   │   └── index.ts          # Prisma client
│       │   ├── utils/
│       │   └── index.ts              # App entry
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   └── index.ts
│   └── config/                       # Shared config (eslint, ts, etc.)
│
├── .env.example
├── .gitignore
├── package.json                      # Root monorepo config
├── turbo.json                        # Turborepo
└── README.md
```

---

## 2. SETUP & INSTALLATION

### Prerequisites
```bash
node >= 20.0.0
npm >= 10.0.0
git
PostgreSQL (local) OR Supabase account
```

### Step 1: Bootstrap Monorepo
```bash
npx create-turbo@latest opencraft
cd opencraft
```

### Step 2: Install Root Dependencies
```bash
npm install
```

### Step 3: Setup Frontend (Next.js)
```bash
cd apps/web
npm install next@14 react react-dom typescript
npm install tailwindcss postcss autoprefixer
npm install @next-auth/prisma-adapter next-auth
npm install @tanstack/react-query zustand
npm install framer-motion
npm install lucide-react
npm install clsx tailwind-merge
npx shadcn-ui@latest init
npx tailwindcss init -p
```

### Step 4: Setup Backend (Node + Express)
```bash
cd apps/api
npm install express typescript ts-node
npm install @prisma/client prisma
npm install jsonwebtoken bcryptjs
npm install express-rate-limit cors helmet
npm install bull ioredis
npm install @octokit/rest          # GitHub API
npm install resend                  # Email
npm install zod                     # Validation
npm install dotenv
npm install -D @types/express @types/node tsx nodemon
npx prisma init
```

### Step 5: Environment Variables
```bash
# apps/web/.env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GITHUB_CLIENT_ID=your-github-app-client-id
GITHUB_CLIENT_SECRET=your-github-app-client-secret
API_URL=http://localhost:4000

# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/opencraft
REDIS_URL=redis://localhost:6379
GITHUB_APP_TOKEN=your-github-pat
JWT_SECRET=your-jwt-secret
RESEND_API_KEY=your-resend-key
PORT=4000
```

---

## 3. DATABASE SCHEMA (PRISMA)

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  githubId    String?  @unique
  githubLogin String?
  role        Role     @default(CODER)
  level       Level    @default(BEGINNER)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile     Profile?
  submissions Submission[]
  badges      Badge[]
  mentor      Mentor?
  rewards     Reward[]
}

enum Role {
  CODER
  MENTOR
  ORG_ADMIN
  PLATFORM_ADMIN
}

enum Level {
  BEGINNER
  ACTIVE
  VERIFIED
  MENTOR_LEVEL
}

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  bio       String?
  avatar    String?
  stack     String[] // e.g. ["JavaScript", "React", "Node.js"]
  website   String?
  twitter   String?
  timezone  String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model Organization {
  id          String   @id @default(cuid())
  name        String
  domain      String   @unique
  logo        String?
  description String?
  plan        OrgPlan  @default(FREE)
  verified    Boolean  @default(false)
  createdAt   DateTime @default(now())

  tasks Task[]
}

enum OrgPlan {
  FREE
  STARTER
  GROWTH
  ENTERPRISE
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String
  type        TaskType
  difficulty  Difficulty
  repoUrl     String
  issueUrl    String?
  orgId       String?
  status      TaskStatus   @default(OPEN)
  reward      Int          @default(0)    // points
  cashReward  Float        @default(0)    // USD
  tags        String[]
  createdAt   DateTime     @default(now())
  expiresAt   DateTime?

  org         Organization? @relation(fields: [orgId], references: [id])
  submissions Submission[]
}

enum TaskType {
  BUG_FIX
  FEATURE
  DOCUMENTATION
  TESTING
  REFACTOR
}

enum Difficulty {
  STARTER
  EASY
  MEDIUM
  HARD
  ADVANCED
}

enum TaskStatus {
  OPEN
  IN_PROGRESS
  UNDER_REVIEW
  COMPLETED
  EXPIRED
}

model Submission {
  id          String           @id @default(cuid())
  taskId      String
  userId      String
  prUrl       String
  description String
  status      SubmissionStatus @default(PENDING)
  submittedAt DateTime         @default(now())
  claimedAt   DateTime?
  claimExpiry DateTime?

  task    Task    @relation(fields: [taskId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
  reviews Review[]
}

enum SubmissionStatus {
  PENDING
  IN_REVIEW
  APPROVED
  REJECTED
  CHANGES_REQUESTED
}

model Review {
  id           String       @id @default(cuid())
  submissionId String
  mentorId     String
  status       ReviewStatus
  feedback     String?
  score        Int?         // 1-5
  reviewedAt   DateTime     @default(now())

  submission Submission @relation(fields: [submissionId], references: [id])
  mentor     Mentor     @relation(fields: [mentorId], references: [id])
}

enum ReviewStatus {
  APPROVED
  REJECTED
  CHANGES_REQUESTED
}

model Mentor {
  id              String   @id @default(cuid())
  userId          String   @unique
  rating          Float    @default(0)
  reviewCount     Int      @default(0)
  specializations String[]
  approved        Boolean  @default(false)
  createdAt       DateTime @default(now())

  user    User     @relation(fields: [userId], references: [id])
  reviews Review[]
}

model Badge {
  id        String    @id @default(cuid())
  userId    String
  type      BadgeType
  level     Level
  taskId    String?
  earnedAt  DateTime  @default(now())
  shareUrl  String?

  user User @relation(fields: [userId], references: [id])
}

enum BadgeType {
  FIRST_CONTRIBUTION
  STREAK_7
  STREAK_30
  LANGUAGE_EXPERT
  MENTOR_APPROVED
  TOP_CONTRIBUTOR
  COMMUNITY_STAR
}

model Reward {
  id        String       @id @default(cuid())
  userId    String
  taskId    String
  points    Int          @default(0)
  cash      Float        @default(0)
  status    RewardStatus @default(PENDING)
  paidAt    DateTime?
  createdAt DateTime     @default(now())

  user User @relation(fields: [userId], references: [id])
}

enum RewardStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
}
```

---

## 4. API ROUTES

### Authentication
```
POST   /api/auth/github          → GitHub OAuth callback
POST   /api/auth/refresh         → Refresh JWT
DELETE /api/auth/logout          → Invalidate session
```

### Users & Profiles
```
GET    /api/users/:id            → Get user profile
PUT    /api/users/:id            → Update profile
GET    /api/users/:id/badges     → Get user badges
GET    /api/users/:id/submissions→ Get user submissions
GET    /api/leaderboard          → Get top contributors
```

### Tasks
```
GET    /api/tasks                → List tasks (filter/sort/paginate)
GET    /api/tasks/:id            → Get task detail
POST   /api/tasks                → Create task (Org/Admin)
PUT    /api/tasks/:id            → Update task
DELETE /api/tasks/:id            → Archive task
POST   /api/tasks/:id/claim      → Claim a task
DELETE /api/tasks/:id/claim      → Unclaim a task
```

### Submissions
```
GET    /api/submissions          → List submissions (mentor view)
GET    /api/submissions/:id      → Get submission detail
POST   /api/submissions          → Create submission
PUT    /api/submissions/:id      → Update submission
```

### Reviews
```
POST   /api/reviews              → Create review (Mentor only)
GET    /api/reviews/:id          → Get review
GET    /api/mentor/queue         → Get pending review queue
```

### Organizations
```
POST   /api/organizations        → Register org
GET    /api/organizations/:id    → Get org profile
PUT    /api/organizations/:id    → Update org
GET    /api/organizations/:id/tasks → Get org's tasks
```

### Badges
```
GET    /api/badges/:id           → Get badge (public)
POST   /api/badges/award         → Award badge (internal/worker)
```

---

## 5. KEY SERVICES

### GitHub Service
```typescript
// apps/api/src/services/github.service.ts

import { Octokit } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({ auth: process.env.GITHUB_APP_TOKEN });
  }

  // Verify if a PR has been merged
  async verifyPRMerged(prUrl: string): Promise<boolean> {
    const { owner, repo, pullNumber } = this.parsePRUrl(prUrl);
    const { data } = await this.octokit.pulls.get({ owner, repo, pull_number: pullNumber });
    return data.merged;
  }

  // Get user's contribution graph
  async getContributionGraph(username: string) {
    // Uses GitHub GraphQL API for contribution data
  }

  // Parse PR URL into parts
  private parsePRUrl(url: string) {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) throw new Error("Invalid PR URL");
    return { owner: match[1], repo: match[2], pullNumber: parseInt(match[3]) };
  }
}
```

### Badge Service
```typescript
// apps/api/src/services/badge.service.ts

export class BadgeService {
  async checkAndAwardBadges(userId: string, submission: Submission) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { submissions: true, badges: true }
    });

    const approvedCount = user.submissions.filter(s => s.status === "APPROVED").length;

    // Award FIRST_CONTRIBUTION badge
    if (approvedCount === 1) {
      await this.awardBadge(userId, "FIRST_CONTRIBUTION");
    }

    // Check streak badges
    await this.checkStreakBadges(userId);

    // Upgrade user level
    await this.upgradeLevel(userId, approvedCount);
  }

  async upgradeLevel(userId: string, approvedCount: number) {
    let newLevel: Level;
    if (approvedCount >= 20) newLevel = "VERIFIED";
    else if (approvedCount >= 5) newLevel = "ACTIVE";
    else newLevel = "BEGINNER";

    await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
  }
}
```

---

## 6. FRONTEND KEY COMPONENTS

### Task Card Component
```tsx
// components/tasks/TaskCard.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, GitPullRequest } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  onClaim: (taskId: string) => void;
}

export function TaskCard({ task, onClaim }: TaskCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      className="bg-gray-900 border border-gray-700 rounded-xl p-6 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <Badge variant={task.difficulty === "STARTER" ? "green" : "blue"}>
          {task.difficulty}
        </Badge>
        <span className="text-yellow-400 font-mono text-sm">+{task.reward} pts</span>
      </div>

      <h3 className="text-white font-semibold text-lg mb-2">{task.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {task.tags.map(tag => (
          <span key={tag} className="bg-gray-800 text-green-400 text-xs px-2 py-1 rounded font-mono">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <GitPullRequest size={12} /> {task.type}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> 72h lock
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => onClaim(task.id)}
          className="bg-green-500 hover:bg-green-400 text-black font-bold"
        >
          Claim →
        </Button>
      </div>
    </motion.div>
  );
}
```

---

## 7. SEED DATA (for development)

```typescript
// apps/api/prisma/seed.ts

const starterTasks = [
  {
    title: "Fix typo in README.md",
    description: "There's a spelling error in the introduction section. Find it and submit a PR.",
    type: "DOCUMENTATION",
    difficulty: "STARTER",
    repoUrl: "https://github.com/opencraft-platform/starter-repo",
    tags: ["documentation", "beginner", "markdown"],
    reward: 10,
  },
  {
    title: "Add missing semicolons in utils.js",
    description: "The utils.js file is missing semicolons at the end of several statements.",
    type: "BUG_FIX",
    difficulty: "STARTER",
    repoUrl: "https://github.com/opencraft-platform/starter-repo",
    tags: ["javascript", "beginner", "linting"],
    reward: 15,
  },
  {
    title: "Write a unit test for the sum() function",
    description: "The sum() function in math.js has no tests. Write at least 3 test cases.",
    type: "TESTING",
    difficulty: "EASY",
    repoUrl: "https://github.com/opencraft-platform/starter-repo",
    tags: ["javascript", "testing", "jest"],
    reward: 25,
  },
  // Add 20+ more for launch
];
```

---

## 8. LAUNCH CHECKLIST

### Pre-launch (Week 1–2)
- [ ] GitHub OAuth app registered
- [ ] Domain purchased (opencraft.dev)
- [ ] Vercel project created
- [ ] Supabase database spun up
- [ ] Redis instance (Upstash) connected
- [ ] Environment variables set in Vercel
- [ ] 50+ starter tasks created manually
- [ ] 5+ mentors recruited from personal network
- [ ] Beta waitlist form live

### Launch Day
- [ ] Announce on Twitter/X with demo video
- [ ] Post on Product Hunt
- [ ] Share on LinkedIn
- [ ] Post on relevant Reddit communities (r/learnprogramming, r/cscareerquestions)
- [ ] Share in dev Discord/Slack communities
- [ ] Email beta waitlist

### Post-launch (Week 3–4)
- [ ] Monitor Sentry for errors
- [ ] Daily check on task completion rate
- [ ] Weekly NPS survey to active users
- [ ] Mentor feedback sessions

---

## 9. DEVELOPMENT COMMANDS

```bash
# Start everything (monorepo)
npm run dev

# Individual apps
cd apps/web && npm run dev      # http://localhost:3000
cd apps/api && npm run dev      # http://localhost:4000

# Database
npx prisma studio               # Visual DB browser
npx prisma db push              # Sync schema
npx prisma db seed              # Seed sample data
npx prisma migrate dev          # Create migration

# Type generation
npx prisma generate

# Build
npm run build

# Tests
npm run test
```

---

## 10. SCALING NOTES

When you hit 1,000+ users:
- Add read replicas to PostgreSQL
- Move background jobs to dedicated worker instances
- Add Cloudflare rate limiting at the edge
- Enable Vercel Analytics and Web Vitals monitoring
- Consider moving to PlanetScale for zero-downtime migrations

When you hit 10,000+ users:
- Consider migrating to microservices (auth, tasks, payments as separate services)
- Add ElasticSearch for task search
- Implement caching strategy with Redis Cluster
- Add CDN for badge images and profile avatars
