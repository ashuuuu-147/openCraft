<div align="center">

```
 ██████╗ ██████╗ ███████╗███╗   ██╗ ██████╗██████╗  █████╗ ███████╗████████╗
██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║     ██████╔╝███████║█████╗     ██║   
██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║     ██╔══██╗██╔══██║██╔══╝     ██║   
╚██████╔╝██║     ███████╗██║ ╚████║╚██████╗██║  ██║██║  ██║██║        ██║   
 ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝  
```

**Learn by shipping. Get verified. Get hired.**

*The contribution-first platform where real open-source work becomes your resume.*

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Status](https://img.shields.io/badge/Status-Active%20Development-yellow?style=flat-square)]()

<br/>

[**Live Demo**](https://opencraft.dev) · [**Report a Bug**](https://github.com/opencraft-platform/opencraft/issues) · [**Request a Feature**](https://github.com/opencraft-platform/opencraft/issues) · [**Join Discord**](https://discord.gg/opencraft)

</div>

---

## 📌 What is OpenCraft?

Most developers learn from tutorials. Tutorials don't get you hired.

**OpenCraft bridges that gap** by routing developers through real open-source tasks — guided by mentors, verified by actual merged PRs, and visible to companies who are done reading resumes.

It is not another course platform. It is not a job board. It is the system that connects **learning → real contribution → verification → payment → hiring** in one continuous loop.

```
You  →  Pick a task  →  Ship the PR  →  Mentor review  →  Verified badge  →  Company hire
         (real OSS)       (on GitHub)     (structured)      (trust graph)      (no resume)
```

---

## 🎯 The Problem We Solve

| For Developers | For Companies |
|----------------|---------------|
| Tutorials don't translate to real skills | Resumes are unreliable |
| Open source has a steep entry curve | Coding tests don't reflect real work |
| No structured path for beginners | Junior hires are high-risk |
| Contributions are impossible to verify | Consistent OSS contributors are scarce |
| Students want paid experience, not certificates | Onboarding costs are too high |

---

## ✨ Key Features

### For Developers
- 🧩 **Guided starter tasks** — handpicked warm-up tasks to get you into open source without drowning
- 🔀 **Real OSS issues** — actual GitHub issues from real projects, not synthetic practice problems
- 🎓 **Mentor reviews** — structured feedback from senior developers on every submission
- 🏅 **Verified badges** — proof of work that companies trust (no cert, just merged PRs)
- 💰 **Paid contributions** — earn money for approved work *(Phase 2)*
- 👤 **Public contributor profile** — your work history, visible and shareable

### For Organizations
- 📋 **Post tasks & bounties** — get quality contributions on your OSS repo
- 🔍 **Browse verified contributors** — filter by stack, level, contribution history
- 🤝 **Hire directly** — source junior devs without the resume game

### For Mentors
- 📬 **Review queue** — structured submissions to give feedback on
- ⭐ **Build reputation** — mentor ratings visible on your public profile
- 💵 **Earn per review** — get paid for quality mentorship *(Phase 2)*

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      OPENCRAFT STACK                    │
├──────────────┬──────────────────────────────────────────┤
│  Frontend    │  Next.js 14 (App Router) + TypeScript    │
│              │  Tailwind CSS + shadcn/ui                │
│              │  Framer Motion + Three.js (3D hero)      │
│              │  React Query + Zustand                   │
├──────────────┼──────────────────────────────────────────┤
│  Backend     │  Node.js + Express + TypeScript          │
│              │  Prisma ORM                              │
│              │  Bull (background jobs)                  │
├──────────────┼──────────────────────────────────────────┤
│  Database    │  PostgreSQL (primary)                    │
│              │  Redis (cache + sessions)                │
├──────────────┼──────────────────────────────────────────┤
│  Auth        │  NextAuth.js + GitHub OAuth              │
├──────────────┼──────────────────────────────────────────┤
│  Infra       │  Vercel (frontend) + Railway (backend)   │
│              │  Supabase (DB) + Upstash (Redis)         │
│              │  Cloudflare CDN + Sentry + PostHog       │
├──────────────┼──────────────────────────────────────────┤
│  Integrations│  GitHub API (Octokit) + Webhooks         │
│              │  Razorpay + Stripe (Phase 2)             │
│              │  Resend (email)                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
opencraft/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, signup
│   │   │   ├── (dashboard)/    # Main app pages
│   │   │   ├── (org)/          # Organization portal
│   │   │   └── (mentor)/       # Mentor review queue
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── tasks/          # TaskCard, TaskList, SubmitForm
│   │   │   ├── profile/        # BadgeGrid, ContributionGraph
│   │   │   ├── mentor/         # ReviewCard, ReviewForm
│   │   │   └── landing/        # Hero, HowItWorks, Features
│   │   ├── hooks/              # useTasks, useProfile, useSubmissions
│   │   ├── store/              # Zustand global state
│   │   └── lib/                # API client, auth config, utils
│   │
│   └── api/                    # Node.js backend
│       ├── src/
│       │   ├── routes/         # auth, tasks, submissions, reviews
│       │   ├── services/       # github, badge, review, notification
│       │   ├── workers/        # pr-verify, badge, email (Bull jobs)
│       │   └── middleware/     # auth, rate-limit, validation
│       └── prisma/
│           ├── schema.prisma   # Full data model
│           └── seed.ts         # 50+ starter tasks
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared eslint, tsconfig
│
├── turbo.json                  # Turborepo config
├── PRD.md                      # Product Requirements Document
├── initial.md                  # Build guide & setup
└── design.md                   # Design system & tokens
```

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 20.0.0
npm  >= 10.0.0
git
PostgreSQL (local) OR a Supabase account
Redis (local) OR an Upstash account
```

### 1. Clone & Install

```bash
git clone https://github.com/opencraft-platform/opencraft.git
cd opencraft
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
```

Fill in the values:

```env
# apps/web/.env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GITHUB_CLIENT_ID=your-github-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-app-secret
API_URL=http://localhost:4000

# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/opencraft
REDIS_URL=redis://localhost:6379
GITHUB_APP_TOKEN=your-github-personal-access-token
JWT_SECRET=generate-a-strong-secret
RESEND_API_KEY=re_xxxxxxxxxxxx
PORT=4000
```

> **Need a GitHub OAuth App?**
> Go to [GitHub → Settings → Developer Settings → OAuth Apps → New](https://github.com/settings/developers)
> Set callback URL to `http://localhost:3000/api/auth/callback/github`

### 3. Set Up the Database

```bash
cd apps/api

# Push the schema to your database
npx prisma db push

# Seed with 50+ starter tasks and sample data
npx prisma db seed

# (Optional) Open Prisma Studio to browse your DB
npx prisma studio
```

### 4. Run the Dev Servers

```bash
# From the root — starts both web and api
npm run dev

# Or individually:
cd apps/web && npm run dev   # → http://localhost:3000
cd apps/api && npm run dev   # → http://localhost:4000
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

---

## 🔑 Key Commands

```bash
# Development
npm run dev              # Start all apps (Turborepo)
npm run build            # Build all apps for production
npm run lint             # Lint all apps
npm run test             # Run all tests

# Database (from apps/api)
npx prisma studio        # Visual database browser
npx prisma db push       # Sync schema (no migration file)
npx prisma migrate dev   # Create + apply a migration
npx prisma db seed       # Reseed sample data
npx prisma generate      # Regenerate Prisma client

# Type generation
npm run types            # Generate shared types
```

---

## 🗺️ Roadmap

```
Phase 1 — MVP (Months 1–3)          ← We are here
  ✅ GitHub OAuth + profiles
  ✅ Task listing + filtering
  ✅ Task claim system (72h lock)
  ✅ Submission + mentor review
  ✅ Verified badges
  🔲 Points leaderboard
  🔲 Public contributor profiles

Phase 2 — Beta (Months 3–6)
  🔲 Organization portal + bounties
  🔲 Real payments (Razorpay + Stripe)
  🔲 User subscriptions
  🔲 Mentor payout system
  🔲 GitHub webhook — auto-detect merged PRs

Phase 3 — Scale (Months 6–12)
  🔲 AI-assisted pre-review
  🔲 Mobile app (React Native)
  🔲 Hiring dashboard for companies
  🔲 University partnership program
  🔲 Recommendation engine
  🔲 Analytics platform
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│               CLIENT (Next.js / React)                  │
│         React Query · Zustand · Framer Motion           │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                  API GATEWAY                            │
│              Rate Limit · CORS · Helmet                 │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              NODE.JS / EXPRESS BACKEND                  │
│         Auth · Tasks · Reviews · Submissions            │
└────────┬──────────────┬──────────────────┬──────────────┘
         │              │                  │
┌────────▼───┐  ┌───────▼──────┐  ┌───────▼──────────────┐
│ PostgreSQL │  │    Redis     │  │    Bull Queue        │
│  (Prisma)  │  │  (Cache +    │  │  (Background Jobs)   │
│            │  │   Sessions)  │  │                      │
└────────────┘  └──────────────┘  └──┬───────────┬───────┘
                                     │           │
                               ┌─────▼──┐  ┌────▼────────┐
                               │ Badge  │  │ PR Verify   │
                               │ Worker │  │ (GitHub API)│
                               └────────┘  └─────────────┘
```

---

## 🤝 Contributing

We built OpenCraft to help people contribute to open source — so of course we welcome contributions here too.

### How to Contribute

```bash
# 1. Fork the repo
# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make your changes
# 4. Commit with conventional commits
git commit -m "feat: add task expiry countdown component"

# 5. Push and open a PR
git push origin feat/your-feature-name
```

### Commit Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     new feature
fix:      bug fix
docs:     documentation changes
style:    formatting, no logic change
refactor: code restructure, no feature change
test:     adding or updating tests
chore:    build, tooling, config changes
```

### Good First Issues

New to the codebase? Look for issues tagged:

- [`good first issue`](https://github.com/opencraft-platform/opencraft/labels/good%20first%20issue) — self-contained, well-scoped tasks
- [`help wanted`](https://github.com/opencraft-platform/opencraft/labels/help%20wanted) — things we need community help on
- [`documentation`](https://github.com/opencraft-platform/opencraft/labels/documentation) — no code required

Read [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## 🌍 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | ✅ | Full URL of your Next.js app |
| `NEXTAUTH_SECRET` | ✅ | Secret for JWT signing |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App Client Secret |
| `API_URL` | ✅ | URL of the backend API |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `GITHUB_APP_TOKEN` | ✅ | GitHub PAT for API access |
| `JWT_SECRET` | ✅ | Backend JWT secret |
| `RESEND_API_KEY` | ✅ | Resend API key for emails |
| `RAZORPAY_KEY_ID` | Phase 2 | Razorpay payment key |
| `RAZORPAY_SECRET` | Phase 2 | Razorpay secret |
| `STRIPE_SECRET_KEY` | Phase 2 | Stripe secret (global payments) |

---

## 🧪 Running Tests

```bash
# All tests
npm run test

# Frontend only
cd apps/web && npm run test

# Backend only
cd apps/api && npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🐳 Docker (Optional)

```bash
# Start all services with Docker Compose
docker-compose up

# Or build and run individually
docker build -t opencraft-api ./apps/api
docker build -t opencraft-web ./apps/web
```

The `docker-compose.yml` spins up: PostgreSQL + Redis + API + Web.

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [`PRD.md`](PRD.md) | Full Product Requirements Document |
| [`initial.md`](initial.md) | Build guide, file structure, seed data |
| [`design.md`](design.md) | Design system, tokens, component specs |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidelines |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history |

---

## 💬 Community & Support

- 💬 **Discord** — [discord.gg/opencraft](https://discord.gg/opencraft) — ask questions, share progress, get help
- 🐦 **Twitter/X** — [@opencraftdev](https://twitter.com/opencraftdev) — updates and announcements
- 📧 **Email** — [hello@opencraft.dev](mailto:hello@opencraft.dev) — for organizations and partnerships
- 🐛 **Issues** — [GitHub Issues](https://github.com/opencraft-platform/opencraft/issues) — bugs and feature requests

---

## 📊 Project Stats

| Metric | Target (Month 6) |
|--------|-----------------|
| Active contributors | 1,000+ |
| Tasks available | 500+ |
| Verified contributors | 100+ |
| Partner organizations | 5+ |
| Countries represented | 20+ |

---

## ⚖️ License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE) for details.

You are free to use, modify, and distribute this code. If you build something with it, we'd love to know.

---

## 🙏 Acknowledgements

OpenCraft stands on the shoulders of giants:

- [**Next.js**](https://nextjs.org) — the React framework that makes this possible
- [**Prisma**](https://prisma.io) — the ORM that makes database work enjoyable
- [**shadcn/ui**](https://ui.shadcn.com) — the component library that saves weeks of work
- [**Turborepo**](https://turbo.build) — the monorepo tooling that keeps everything fast
- [**GitHub**](https://github.com) — without whom none of this makes sense
- Every open-source maintainer who has ever merged a first PR from a stranger on the internet ❤️

---

<div align="center">

**Built with ❤️ for developers who learn by shipping**

[opencraft.dev](https://opencraft.dev) · [GitHub](https://github.com/opencraft-platform/opencraft) · [Discord](https://discord.gg/opencraft) · [Twitter](https://twitter.com/opencraftdev)

<br/>

*Star ⭐ the repo if OpenCraft helped you — it helps more developers find it.*

</div>
