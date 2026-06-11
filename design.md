# 🎨 DESIGN.MD — OPENCRAFT VISUAL SYSTEM
> Dark. 3D. Code-first. Built for developers who ship things.

---

## 1. DESIGN PHILOSOPHY

OpenCraft is not a learning app that happens to use code. It IS code. The design must feel like the terminal, the IDE, the pull request — familiar to developers, intimidating to nobody.

**Core feeling:** You are in a cockpit. Everything is data. Everything is actionable.

**Three design principles:**
1. **Dark by default** — developers live in dark mode
2. **Code is content** — monospace fonts, syntax colors, PR aesthetics
3. **3D depth creates hierarchy** — floating cards, z-axis information architecture

---

## 2. COLOR SYSTEM

```
Background Layers (Z-axis from deep to surface):
  --bg-void:      #050810    ← Deepest background (canvas)
  --bg-base:      #0A0F1E    ← Main page background
  --bg-surface:   #111827    ← Card backgrounds
  --bg-elevated:  #1A2235    ← Hover states, modals
  --bg-overlay:   #1F2D40    ← Tooltips, dropdowns

Primary Accent (Electric Blue — energy, trust):
  --blue-glow:    #00D4FF    ← Neon highlights, CTAs
  --blue-mid:     #0090CC    ← Buttons, links
  --blue-deep:    #005580    ← Subtle accents

Success (Terminal Green — contribution, approval):
  --green-neon:   #00FF88    ← Badges, success states
  --green-mid:    #00CC66    ← Active states
  --green-subtle: #003322    ← Success backgrounds

Warning / Reward (Gold — points, achievements):
  --gold-bright:  #FFD700    ← Points, rewards
  --gold-mid:     #CC9900    ← Secondary gold

Danger / Rejection (Red):
  --red-neon:     #FF4466    ← Error states, rejections

Text Scale:
  --text-primary:   #F0F4FF  ← Main text (off-white, not harsh)
  --text-secondary: #8892A4  ← Secondary info
  --text-muted:     #4A5568  ← Placeholder, disabled
  --text-code:      #A8FF78  ← Inline code, terminal text

Borders:
  --border-subtle:  #1E2A3A  ← Card borders
  --border-active:  #00D4FF22← Glowing borders on focus
  --border-glow:    #00D4FF  ← Active card glow
```

### Usage Rules
- Never use white backgrounds. Ever.
- Neon colors are **accents only** — used for 1–2 elements per screen
- All interactive elements must have a glow state on hover/focus
- Text on dark backgrounds: prefer `--text-primary` not pure `#FFFFFF`

---

## 3. TYPOGRAPHY

### Font Stack
```css
/* Display — for hero titles, page headings */
--font-display: 'Space Grotesk', 'Inter', sans-serif;

/* Body — readable, modern */
--font-body: 'Inter', system-ui, sans-serif;

/* Code — monospace for all code, terminal, tags */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### Type Scale
```css
--text-xs:    11px / line-height: 1.4  ← Tags, metadata
--text-sm:    13px / line-height: 1.5  ← Secondary text
--text-base:  15px / line-height: 1.6  ← Body copy
--text-lg:    17px / line-height: 1.5  ← Card titles
--text-xl:    20px / line-height: 1.4  ← Section headings
--text-2xl:   26px / line-height: 1.3  ← Page titles
--text-3xl:   34px / line-height: 1.2  ← Hero subtitles
--text-hero:  56px / line-height: 1.1  ← Main hero title
--text-mega:  80px / line-height: 1.0  ← Single-word displays
```

### Typography Rules
- Hero titles: Space Grotesk, bold (700), with gradient text effect
- Code snippets, task tags, badge labels: JetBrains Mono
- Body text: Inter at 15–16px, `--text-primary` on dark bg
- Numbers and stats: JetBrains Mono, neon color
- NEVER use regular weight for headings — minimum 600

---

## 4. 3D DESIGN SYSTEM

This is the signature element. OpenCraft uses **3D depth throughout** to communicate information hierarchy.

### 4.1 Card Depth System
```css
/* Layer 0 — Inset / sunken */
.card-inset {
  background: var(--bg-void);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.6);
}

/* Layer 1 — Flat surface */
.card-base {
  background: var(--bg-surface);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Layer 2 — Raised card (default interactive state) */
.card-raised {
  background: var(--bg-surface);
  box-shadow:
    0 4px 6px rgba(0,0,0,0.4),
    0 0 0 1px var(--border-subtle),
    inset 0 1px 0 rgba(255,255,255,0.03);
  transform: translateZ(0);
}

/* Layer 3 — Hover state (card floats up) */
.card-hover {
  background: var(--bg-elevated);
  box-shadow:
    0 20px 40px rgba(0,0,0,0.5),
    0 0 0 1px rgba(0,212,255,0.15),
    0 0 30px rgba(0,212,255,0.08),
    inset 0 1px 0 rgba(255,255,255,0.05);
  transform: translateY(-4px) translateZ(20px);
}

/* Layer 4 — Active / selected */
.card-active {
  box-shadow:
    0 25px 50px rgba(0,0,0,0.6),
    0 0 0 1px rgba(0,212,255,0.4),
    0 0 40px rgba(0,212,255,0.15);
  transform: translateY(-6px);
}
```

### 4.2 3D Perspective Layout
```css
/* Apply to task grid, leaderboard, etc. */
.perspective-container {
  perspective: 1200px;
  perspective-origin: center center;
}

/* Individual cards tilt slightly on hover */
.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.card-3d:hover {
  transform: rotateX(2deg) rotateY(-2deg) translateY(-4px);
}
```

### 4.3 Three.js Hero Scene (Landing Page)
The hero uses a **Three.js particle system** representing a contribution graph:
```
Visual concept:
- Dark void background
- Floating grid of glowing cubes (like GitHub contribution graph but 3D)
- Each cube represents a real task/contribution
- Cubes pulse gently, glow green when "approved"
- Mouse parallax moves the entire scene
- On load: cubes animate in from void (opacity 0 → 1, position Y offset)
```

Implementation reference:
```jsx
// components/landing/HeroScene.tsx
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Stars, MeshWobbleMaterial } from "@react-three/drei"

// Contribution cube grid: 7 columns × 12 weeks = 84 cubes
// Color: black (no contribution) → dim green → bright neon green
// Interaction: hover a cube → shows "Task: Fix auth bug" tooltip
```

---

## 5. COMPONENT LIBRARY

### 5.1 Buttons
```css
/* Primary CTA */
.btn-primary {
  background: linear-gradient(135deg, #00D4FF, #0090CC);
  color: #000;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0,212,255,0.3);
  transition: all 0.2s;
}
.btn-primary:hover {
  box-shadow: 0 0 30px rgba(0,212,255,0.5);
  transform: translateY(-1px);
}

/* Success / Approve */
.btn-success {
  background: linear-gradient(135deg, #00FF88, #00CC66);
  color: #000;
  font-weight: 700;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}
.btn-ghost:hover {
  border-color: var(--blue-glow);
  color: var(--blue-glow);
}
```

### 5.2 Task Cards
Visual anatomy of a task card:
```
┌─────────────────────────────────┐  ← Glowing border on hover
│ [STARTER]          [+10 pts] 🏆 │  ← Badge + reward
│                                 │
│  Fix README typo                │  ← Task title (--font-body, bold)
│  Find the spelling error in     │  ← Description (2 lines max)
│  the intro and submit a PR.     │
│                                 │
│ [javascript] [docs] [beginner]  │  ← Tech tags (--font-mono, green)
│                                 │
│ 🔀 Documentation    ⏱ 72h lock  │  ← Meta (small, muted)
│                  [Claim →]      │  ← CTA
└─────────────────────────────────┘
```

### 5.3 Badge Display
```
Badges appear as 3D hexagonal tokens:

    ╱‾‾‾╲
   ╱ ⭐  ╲     ← Glow ring in badge color
   ╲     ╱     ← Metallic gradient
    ╲___╱
  VERIFIED       ← Level text below
```

CSS effect: `clip-path: polygon(...)` + `box-shadow` glow + subtle rotation on hover

### 5.4 Code Terminal Component
Used throughout for displaying code, PR diffs, and feedback:
```css
.terminal {
  background: #000B14;
  border: 1px solid #1E2A3A;
  border-radius: 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #A8FF78;
  padding: 20px;
  position: relative;
}

.terminal::before {
  /* macOS-style dots */
  content: "● ● ●";
  position: absolute;
  top: 14px;
  left: 16px;
  color: #FF5F57 #FEBC2E #28C840;
  font-size: 10px;
}
```

### 5.5 Contributor Profile
```
┌──────────────────────────────────────┐
│  [Avatar]  @username                 │
│            Verified Contributor ✓    │
│            🌏 India • 🕐 IST        │
│                                      │
│  Stack: [React] [Node] [TypeScript]  │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ← Contribution heatmap (3D cubes)
│  █ █ ░ █ █ █ ░ ░ █ █ ░ █ █ █ █ █  │
│                                      │
│  Badges:  🥉 🥈 🥇 ⭐ 🏆           │
│                                      │
│  42 tasks · 38 approved · 98/100 ★  │
└──────────────────────────────────────┘
```

---

## 6. PAGE DESIGNS

### 6.1 Landing Page Layout
```
[NAVBAR] Logo | Tasks | For Orgs | Sign In | [Get Started →]

[HERO — Full viewport]
  3D contribution graph (Three.js) — fills right 60%
  Left side:
    eyebrow: "The open-source contribution platform"
    H1: "Learn by shipping."
    H1: "Get verified."
    H1: "Get hired."     ← each line animates in with stagger
    subtext: "Real tasks. Real PRs. Real proof."
    [Start Contributing →]  [Watch demo]

[HOW IT WORKS — 3 steps]
  1 → Pick a task
  2 → Ship the PR
  3 → Get verified
  (Each step is a floating 3D card that appears on scroll)

[TASK SHOWCASE — Live task board]
  Animated scroll of real tasks (3D cards floating)
  Filter buttons: [JavaScript] [Python] [Rust] [Go]

[VERIFICATION TRUST SECTION]
  Show contributor profile → Badge progression → Hire signal

[FOR ORGANIZATIONS]
  Dark section with company logos (placeholder)
  "Stop guessing. Start hiring."

[MENTOR CALLOUT]
  "Senior dev? Get paid to review." → Apply as mentor

[FOOTER]
```

### 6.2 Dashboard Layout
```
[SIDEBAR — Fixed left, 240px]
  Logo
  ─────────────
  Overview
  My Tasks
  Submissions
  Leaderboard
  Profile
  ─────────────
  Settings
  Logout

[MAIN CONTENT — Right of sidebar]
  [Header: "Good morning, @username" | Streak: 🔥 7 days]

  [STATS ROW — 4 cards, 3D floating]
    Tasks Done: 12    Points: 480    Rank: #42    Level: Active

  [ACTIVE TASK — Full width]
    Currently claimed task with progress + 72h countdown

  [RECOMMENDED TASKS — 3 column grid]
    Task cards (personalized by stack)

  [ACTIVITY FEED — Right panel]
    Recent: badge earned, review received, new task available
```

### 6.3 Task Detail Page
```
[BREADCRUMB] Tasks / Fix auth middleware bug

[2-column layout: 70% content | 30% sidebar]

LEFT:
  [Task title — large]
  [Tags row] [Difficulty badge] [Type badge]
  ─────────────────────────────
  [Description — markdown rendered]
  [Linked issue button → GitHub]
  [Repo button → GitHub]

  [Submission form — appears when claimed]
    PR URL input
    Description textarea
    [Submit for Review]

RIGHT (sticky):
  [Reward card]
    +25 points
    $5.00 bounty (Phase 2)

  [Requirements]
    ✓ GitHub account linked
    ✓ Stack matches
    ✗ 3+ approved tasks (locked)

  [Claim Task button]
    or [72h countdown if already claimed by someone]

  [Who's worked on this]
    Avatar stack of past submitters
```

### 6.4 Mentor Review Interface
```
[Split screen: 50/50]

LEFT — Submission:
  Contributor: @username (Beginner)
  Task: "Fix README typo"
  PR: [View on GitHub ↗]
  Description: "Found 3 typos, fixed all three..."

  [DIFF VIEW — Terminal-style]
  - README.md
  ─────────────
  - This is a recieving demo       ← red (deleted)
  + This is a receiving demo       ← green (added)

RIGHT — Review Panel:
  [Score: ★★★★☆]

  Quick feedback buttons:
  [Good PR format] [Clean commit message] [Tests added]
  [Needs more tests] [Typo in PR title] [Wrong branch]

  [Detailed feedback textarea]

  [Request Changes]  [Reject]  [Approve ✓]
  (Approve = green glow, fires badge + points)
```

---

## 7. ANIMATIONS & MOTION

### Animation Tokens
```css
--ease-smooth:  cubic-bezier(0.23, 1, 0.32, 1);      /* Framer-style */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);   /* Overshoot */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);

--duration-fast:   150ms
--duration-base:   250ms
--duration-slow:   400ms
--duration-page:   600ms
```

### Key Animations

**Page Load Sequence (Landing):**
```
0ms:   Background renders (instant)
100ms: Navbar fades in (opacity 0→1, 250ms)
300ms: 3D scene starts loading
600ms: Hero text animates in (stagger per line, 300ms each)
900ms: CTA button appears with glow pulse
1200ms: Task cards enter (slide up, stagger 100ms)
```

**Task Card Hover:**
```
translateY: 0 → -4px
box-shadow: base → glow
border-color: subtle → blue-glow
duration: 250ms ease-smooth
```

**Badge Award Animation (on approval):**
```
1. Screen flash (rgba(0,255,136,0.05) for 300ms)
2. Badge drops from top with spring physics
3. Glow rings pulse outward (3 rings, 600ms each)
4. Points counter increments with easing
5. "Approved!" toast slides in from right
```

**Contribution graph:**
```
On page load: cubes render left-to-right, top-to-bottom
Each cube: scale 0→1, opacity 0→1, 20ms per cube
Total: ~1.7s for full 84-cube grid
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .hero-3d-scene { display: none; }
  .hero-static-fallback { display: block; }
}
```

---

## 8. RESPONSIVE BREAKPOINTS

```css
--screen-sm:  640px   /* Mobile landscape */
--screen-md:  768px   /* Tablet */
--screen-lg:  1024px  /* Desktop (primary design target) */
--screen-xl:  1280px  /* Wide desktop */
--screen-2xl: 1536px  /* Ultra-wide */
```

### Mobile Adaptations
- Sidebar collapses to bottom tab bar (5 icons)
- Task grid: 1 column (not 3)
- 3D effects reduced (performance)
- Hero 3D scene replaced with static contribution graph image
- Mentor review goes to full-screen stacked view

---

## 9. ICONOGRAPHY

Primary icon library: **Lucide React** (consistent stroke weight)
Secondary: Custom SVG icons for:
- OpenCraft logo (stylized `< >` with contribution cube)
- Badge icons (custom hexagonal token shapes)
- Difficulty indicators (signal strength bars)

### Logo Mark
```
[  <✦>  ]
OpenCraft

Concept: code brackets < > with a cube/diamond in center
Colors: white bracket, neon blue cube
Usage: never distort; min size 24px
```

---

## 10. DESIGN TOKENS (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // Always dark by default
  theme: {
    extend: {
      colors: {
        'void':     '#050810',
        'base':     '#0A0F1E',
        'surface':  '#111827',
        'elevated': '#1A2235',
        'blue-neon':'#00D4FF',
        'green-neon':'#00FF88',
        'gold':     '#FFD700',
        'red-neon': '#FF4466',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        display:['Space Grotesk', 'Inter', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-blue':  '0 0 30px rgba(0,212,255,0.3)',
        'glow-green': '0 0 30px rgba(0,255,136,0.3)',
        'glow-gold':  '0 0 30px rgba(255,215,0,0.3)',
        'card':       '0 4px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,42,58,1)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.15), 0 0 30px rgba(0,212,255,0.08)',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'badge-drop': 'badgeDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(0,212,255,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        badgeDrop: {
          '0%':   { transform: 'translateY(-60px) scale(0.5)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        }
      }
    }
  }
}
```

---

## 11. DESIGN DON'TS

- ❌ No white or light backgrounds (ever)
- ❌ No rounded corners > 16px (feels too friendly/consumer)
- ❌ No stock photography (use code, terminals, PRs)
- ❌ No excessive animation on functional UI (only on celebration moments)
- ❌ No sans-serif for code elements (always monospace)
- ❌ No gradients that don't start/end with dark colors
- ❌ No colored text on colored backgrounds (accessibility)
- ❌ No more than 2 neon colors visible at once

---

## 12. DESIGN INSPIRATION REFERENCES

| Aspect | Reference | What to steal |
|--------|-----------|---------------|
| Dark developer aesthetic | Vercel.com, Linear.app | Layout, whitespace |
| 3D depth system | Stripe.com 3D cards | Card hover physics |
| Code terminals | Carbon.now.sh | Terminal component styling |
| Contribution graph | GitHub profile | The concept (but 3D) |
| Neon accents | Raycast.com | Color restraint |
| Motion design | Framer.com | Spring-based animations |

---

*This design system is the source of truth. All components must derive from these tokens.*
*When in doubt: darker, simpler, more code-like.*
