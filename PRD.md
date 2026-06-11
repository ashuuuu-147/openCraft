# 📋 PRODUCT REQUIREMENTS DOCUMENT — OPENCRAFT
**Version:** 1.0 | **Date:** June 2026 | **Status:** Active Development

---

## 1. EXECUTIVE SUMMARY

OpenCraft is a contribution-first developer platform that closes the gap between learning and employment by routing developers through real open-source work. It is not a tutorial site. It is not a job board. It is the connective tissue between a beginner's first line of code and a company's next hire.

**One-liner:** *Learn by shipping. Get verified. Get hired.*

---

## 2. PROBLEM STATEMENT

### 2.1 Developer Pain Points
| Pain | Current "Fix" | Why It Fails |
|------|--------------|--------------|
| Tutorials don't build real skills | More courses | Same gap |
| OSS contribution is intimidating | GitHub docs | No structure |
| No paid entry path | Unpaid internships | Not sustainable |
| Certificates feel fake | "Real" bootcamps | Still not proven |
| Portfolio projects aren't trusted | Personal projects | No verification |

### 2.2 Company Pain Points
| Pain | Current "Fix" | Why It Fails |
|------|--------------|--------------|
| Resumes lie | Coding tests | Doesn't show teamwork |
| Junior hires fail often | Longer onboarding | Expensive |
| Consistent OSS contributors scarce | GSoC/Hacktoberfest | Seasonal only |
| Skill assessment takes weeks | HackerRank | Not real-world tasks |

---

## 3. SOLUTION

OpenCraft creates a **continuous, verified pipeline**:

```
Beginner → Warm-up Tasks → Real OSS Issues → Mentor Review → Badges → Payment → Hiring
```

Every step is verifiable. Every badge is earned. Every hire is de-risked.

---

## 4. TARGET USERS

### 4.1 Primary Users (Coders)
- CS students (Year 1–4)
- Self-taught developers (0–3 years experience)
- Developers transitioning into open source
- Developers from emerging markets seeking global exposure

**Demographics:** Ages 18–30 | India, Southeast Asia, Africa, LatAm (Phase 1 focus) → Global (Phase 2)

### 4.2 Paying Customers (Organizations)
- Open-source startups needing contributors
- SaaS companies with OSS SDKs
- AI/Web3/Infra dev-tool companies
- Enterprise companies running OSS programs

### 4.3 Platform Enablers (Mentors)
- Senior developers (5+ years)
- Open-source maintainers
- Experienced contributors willing to review and earn

---

## 5. USER STORIES

### Coder
- As a beginner, I want guided tasks so I know where to start
- As a contributor, I want mentor feedback so I can improve
- As a developer, I want verified proof of my work so I can get hired
- As a student, I want to earn money for my contributions

### Organization
- As a company, I want to post bounties and get quality PRs
- As a startup, I want to source verified junior talent
- As an OSS maintainer, I want consistent contributors

### Mentor
- As a senior dev, I want to earn by reviewing submissions
- As a mentor, I want to build a reputation for quality reviews

---

## 6. CORE FEATURES — MVP (Phase 1)

### 6.1 Authentication & Profiles
- [ ] Email + GitHub OAuth login
- [ ] GitHub account sync (repos, stars, contribution graph)
- [ ] Public contributor profile (badges, task history, tech stack)
- [ ] Skill tags (language, framework, domain)

### 6.2 Task System
- [ ] Task listing with filters (language, difficulty, type)
- [ ] Task types: Bug Fix, Feature, Documentation, Testing
- [ ] Difficulty levels: Starter → Intermediate → Advanced
- [ ] Task details page (description, expected output, linked repo)
- [ ] Claim task (with 72-hour lock to prevent conflicts)
- [ ] Submit work (PR link, description, screenshots)

### 6.3 Mentor Review System
- [ ] Mentor dashboard (queue of submissions)
- [ ] Review interface (approve / request changes / reject)
- [ ] Structured feedback form
- [ ] Review history and mentor rating

### 6.4 Verification & Badges
- [ ] Auto-badge on approved submission
- [ ] Badge levels: Beginner → Active → Verified → Mentor-Level
- [ ] Public badge display on profile
- [ ] Shareable badge URLs

### 6.5 Reward System (Mock in MVP)
- [ ] Points system for approved work
- [ ] Leaderboard (by points, by language, by month)
- [ ] Reward history in dashboard

---

## 7. FEATURES — BETA (Phase 2)

### 7.1 Organization Portal
- [ ] Org registration and verification
- [ ] Project listing with task creation
- [ ] Paid bounty posting
- [ ] Contributor tracking dashboard
- [ ] Hiring workflow (shortlist → message → hire)

### 7.2 Real Payments
- [ ] Razorpay integration (India-first)
- [ ] Stripe integration (Global)
- [ ] Mentor payout system
- [ ] Contributor earnings dashboard

### 7.3 Subscriptions
- [ ] Free tier (limited tasks/month)
- [ ] Pro tier (unlimited tasks + faster reviews + priority tasks)
- [ ] Organization tier (post tasks, access talent pool)

---

## 8. FEATURES — SCALE (Phase 3)

- AI-assisted pre-review (code quality, style checks)
- Mobile app (React Native)
- University partnership program
- Hiring dashboard for companies
- Recommendation engine (match contributors to tasks)
- Analytics dashboard (skill trends, contribution heatmaps)
- API for third-party integrations

---

## 9. FUNCTIONAL REQUIREMENTS

### 9.1 Performance
- Page load: < 2s (P95)
- Task claim: < 500ms response
- Submission upload: Support up to 100MB attachments
- Search: < 300ms for task filtering

### 9.2 Security
- GitHub OAuth only (no password storage)
- JWT with 24-hour expiry + refresh tokens
- Rate limiting on all API endpoints
- Input sanitization on all submission fields
- HTTPS enforced everywhere

### 9.3 Availability
- 99.5% uptime SLA (MVP)
- 99.9% uptime SLA (Scale)
- Graceful degradation if GitHub API is down

### 9.4 Scalability
- Stateless backend (horizontal scaling)
- Redis caching for task listings
- CDN for static assets and profile badges
- DB connection pooling

---

## 10. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Target |
|-------------|--------|
| Mobile responsive | Yes (all pages) |
| Accessibility | WCAG 2.1 AA |
| Internationalization | English first, i18n-ready |
| Dark mode | Yes |
| Offline support | Read-only (PWA) |

---

## 11. USER FLOWS

### 11.1 Coder Onboarding Flow
```
Landing Page
  → Sign Up (Email or GitHub OAuth)
  → Select Stack (Language + Framework)
  → Complete Profile (bio, links, timezone)
  → Take Starter Assessment (5 short tasks)
  → Get Assigned to First Real Task
  → Dashboard
```

### 11.2 Task Completion Flow
```
Browse Tasks (filter by stack/difficulty)
  → Read Task Details
  → Claim Task (locked for 72h)
  → Work on Task (externally on GitHub)
  → Submit: [PR link + description + notes]
  → Mentor Queue → Review
  → Approved: Badge + Points + (Phase 2: Payment)
  → Rejected: Feedback + Resubmit Option
```

### 11.3 Organization Flow
```
Register Org
  → Verify (email + domain)
  → Pay Listing Fee
  → Create Project Profile
  → Post Tasks / Bounties
  → Monitor Submissions
  → Access Contributor Profiles
  → Hire
```

---

## 12. DATA MODEL (HIGH LEVEL)

### Entities
- **User** (id, email, githubId, role, level, createdAt)
- **Profile** (userId, bio, stack, avatar, socialLinks, timezone)
- **Task** (id, title, description, type, difficulty, repoUrl, orgId, status, reward)
- **Submission** (id, taskId, userId, prUrl, description, status, submittedAt)
- **Review** (id, submissionId, mentorId, status, feedback, reviewedAt)
- **Badge** (id, userId, type, level, earnedAt, taskId)
- **Organization** (id, name, domain, plan, createdAt)
- **Mentor** (id, userId, rating, reviewCount, specializations)
- **Reward** (id, userId, taskId, points, cash, paidAt)

---

## 13. TECH STACK

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (client) + React Query (server state)
- **Animations:** Framer Motion
- **3D Elements:** Three.js / React Three Fiber

### Backend
- **Runtime:** Node.js (Express or Fastify)
- **Language:** TypeScript throughout
- **ORM:** Prisma
- **Database:** PostgreSQL (primary) + Redis (cache/sessions)
- **Queue:** Bull (background jobs: reviews, emails, badge assignment)
- **Auth:** NextAuth.js + GitHub OAuth

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway or Render (backend)
- **DB Hosting:** Supabase or PlanetScale
- **CDN:** Cloudflare
- **Email:** Resend
- **Payments:** Razorpay + Stripe (Phase 2)
- **Monitoring:** Sentry + Posthog

### Integrations
- **GitHub API:** Repo data, PR verification, contribution graphs
- **Webhooks:** Auto-detect merged PRs and trigger badge/reward

---

## 14. SYSTEM ARCHITECTURE

```
[Client — Next.js / React]
        |
   [API Gateway]
        |
   [Node.js Backend]
    /        |        \
[PostgreSQL] [Redis]  [Bull Queue]
                          |
                    [Workers]
                   /    |     \
           [Badge]  [Email]  [PR Verify via GitHub API]
```

---

## 15. MONETIZATION MODEL

### Revenue Streams

| Stream | Model | Phase |
|--------|-------|-------|
| User Pro Subscription | ₹499/mo or $6.99/mo | Phase 2 |
| Organization Listing Fee | ₹5,000–₹20,000/mo | Phase 2 |
| Platform Commission | 10–15% of paid bounties | Phase 2 |
| University Partnerships | Annual contract | Phase 3 |
| Enterprise Hiring API | Custom pricing | Phase 3 |

### Unit Economics (Target by Month 18)
- Free users: 10,000
- Pro users: 500 (5% conversion)
- Revenue from Pro: ₹2,49,500/mo (~$3,000)
- Organizations paying: 20 × ₹10,000 avg = ₹2,00,000/mo
- **Total MRR target (M18):** ~₹5,00,000 (~$6,000)

---

## 16. METRICS & SUCCESS CRITERIA

### Phase 1 (MVP — 0–3 months)
- 200+ signed-up users
- 50+ tasks completed and reviewed
- 10+ mentors onboarded
- Avg task completion time < 5 days
- NPS > 40

### Phase 2 (Beta — 3–6 months)
- 1,000+ active users
- 5+ paying organizations
- 100+ verified contributors
- $1,000+ MRR

### Phase 3 (Scale — 6–12 months)
- 10,000+ contributors
- 50+ organizations
- $10,000+ MRR
- 3+ university partnerships

---

## 17. RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low task quality | Medium | High | Structured task template + org vetting |
| Fake PR submissions | Medium | High | GitHub API PR merge verification |
| Mentor burnout | Medium | High | Pay mentors, cap daily reviews |
| Slow supply of tasks | High | High | Curate 100 starter tasks manually |
| Payment compliance issues | Low | High | Start with points, phase in payments |
| GitHub API rate limits | Medium | Medium | Cache aggressively, use webhooks |

---

## 18. ROADMAP TIMELINE

```
Month 1–3 (MVP):
  ✓ Auth + profiles
  ✓ Task listing
  ✓ Submissions
  ✓ Mentor review
  ✓ Badges (mock rewards)

Month 3–6 (Beta):
  ✓ Org portal + bounties
  ✓ Real payments (Razorpay)
  ✓ Subscriptions
  ✓ PR auto-verification

Month 6–12 (Scale):
  ✓ AI pre-review
  ✓ Mobile app
  ✓ Hiring dashboard
  ✓ University partnerships
  ✓ Analytics platform
```

---

## 19. OPEN QUESTIONS

1. Should mentors be approved by OpenCraft or community-voted?
2. What is the minimum PR quality threshold for auto-approval?
3. Should contributor profiles be public or gated behind a login?
4. How do we handle disputes between contributor and mentor?
5. Which markets should we localize first (India, Nigeria, Indonesia)?

---

*This PRD is a living document. Update on every major product decision.*
