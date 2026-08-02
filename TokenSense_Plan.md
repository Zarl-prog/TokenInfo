# TokenSense — Project Plan
> *See what you're spending. Cut what you're wasting.*

---

## 📌 Overview

**TokenSense** is a B2B SaaS middleware platform that sits between users and their LLM API calls. It scores, optimizes, and tracks prompt token usage — saving companies real money with full visibility into where waste happens.

---

## 🎯 Core Goals

| Goal | Description |
|---|---|
| **Proxy** | Intercept LLM API calls, log token usage, forward to provider |
| **Score** | Rate every prompt for token efficiency in real time |
| **Optimize** | Rule-based instant trim + optional AI rewrite pass |
| **Analyze** | Dashboard with history, trends, and waste leaderboards |
| **Scale** | Support individuals and enterprise orgs with RBAC |
| **Mobile** | iOS + Android app for monitoring and controls on the go |

---

## 🏗️ Tech Stack

```
Frontend (Web)     →  Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
Backend / Proxy    →  Node.js + Hono
Primary DB         →  PostgreSQL (via Prisma ORM)
Cache / Rate Limit →  Redis
Analytics DB       →  ClickHouse
Auth & RBAC        →  Clerk (orgs, roles, SSO)
Mobile App         →  React Native (Expo)
AI Rewrite Pass    →  Anthropic / OpenAI API (on-demand)
Frontend Deploy    →  Vercel
Backend Deploy     →  Railway
Monorepo Tool      →  Turborepo
```

---

## 📁 Project Structure

```
tokensense/
├── apps/
│   ├── web/                        # Next.js dashboard
│   │   ├── app/
│   │   │   ├── (landing)/          # Public marketing pages
│   │   │   ├── (dashboard)/        # Individual user dashboard
│   │   │   └── (enterprise)/       # Org admin portal
│   │   └── components/
│   │
│   ├── proxy/                      # Hono middleman server
│   │   ├── src/
│   │   │   ├── routes/             # /v1/chat, /v1/completions etc.
│   │   │   ├── middleware/         # Auth, logging, scoring hooks
│   │   │   └── forwarder.ts        # Forward call to actual LLM
│   │
│   └── mobile/                     # Expo React Native app
│       ├── screens/
│       │   ├── Dashboard.tsx
│       │   ├── Alerts.tsx
│       │   └── Settings.tsx
│
├── packages/
│   ├── scorer/                     # Prompt efficiency scoring engine
│   │   └── index.ts                # Returns score 0–100 + flags
│   │
│   ├── optimizer/                  # Prompt optimization logic
│   │   ├── caveman.ts              # Rule-based trim (instant, free)
│   │   └── ai-rewrite.ts          # AI-powered deep compression
│   │
│   ├── db/                         # Prisma schema + migrations
│   │   └── schema.prisma
│   │
│   └── analytics/                  # ClickHouse query helpers
│       └── queries.ts
│
├── turbo.json
└── package.json
```

---

## 🔁 Core Proxy Flow

```
User's App / Tool
  └──► POST https://proxy.tokensense.io/v1/chat/completions
            │
            ├── 1. Authenticate user via API key
            ├── 2. Score prompt (scorer package — instant)
            ├── 3. Log request + token estimate to ClickHouse
            ├── 4. Optional: Apply caveman trim or AI rewrite
            ├── 5. Forward to real LLM (OpenAI / Anthropic / etc.)
            ├── 6. Receive response, log actual tokens used
            └── 7. Return response to user's app
```

---

## 🧠 Scoring Engine (scorer package)

Every prompt gets a **TokenSense Score (0–100)**. Lower = more wasteful.

### Flags the scorer detects:
- ❌ Redundant context (same info repeated multiple times)
- ❌ Bloated system prompts (boilerplate, disclaimers, filler)
- ❌ Hedging language ("please", "could you", "I was wondering if")
- ❌ Verbose phrasing (long sentences that say little)
- ❌ Duplicate sentences or near-duplicate paragraphs
- ❌ Unnecessary examples when none were asked for

### Score Bands:
| Score | Label | Action |
|---|---|---|
| 85–100 | ✅ Efficient | No action needed |
| 60–84 | ⚠️ Moderate Waste | Suggest caveman trim |
| 30–59 | 🔴 High Waste | Auto-flag + recommend AI rewrite |
| 0–29 | 💀 Critical Waste | Block or force optimize (enterprise setting) |

---

## ✂️ Optimizer (optimizer package)

### 1. Caveman Trim (Free, Instant, Rule-Based)
- Strips hedging words and filler phrases
- Removes duplicate sentences
- Shortens verbose clauses
- Collapses redundant context
- **Target: 20–40% token reduction, zero AI cost**

### 2. AI Rewrite Pass (Optional, Paid)
- Sends prompt to Claude/GPT with a compression system prompt
- Rewrites for maximum semantic density
- Preserves intent and tone
- **Target: 40–70% token reduction**

---

## 🗄️ Database Design

### PostgreSQL (via Prisma) — Core Data

```
users                  → id, email, clerkId, plan, createdAt
organizations          → id, name, plan, tokenBudget, createdAt
org_members            → userId, orgId, role (admin/member/viewer)
api_keys               → id, userId, orgId, provider, encryptedKey
prompt_logs            → id, userId, orgId, promptHash, score, tokensIn, tokensOut, cost, createdAt
labels                 → id, promptLogId, name
budgets                → id, orgId, monthlyLimit, alertThreshold, currentUsage
```

### ClickHouse — Analytics

```
token_events           → timestamp, userId, orgId, provider, model, tokensIn, tokensOut, cost, score
daily_summaries        → date, userId, orgId, totalTokens, totalCost, avgScore, callCount
```

---

## 🔐 Auth & RBAC (Clerk)

### Individual Plan
- Sign up with email / Google / GitHub
- Personal API key vault
- Personal dashboard only

### Enterprise Plan
- Org creation with SSO support
- Roles: **Owner → Admin → Member → Viewer**
- Admins set team budgets, token limits, and alert thresholds
- RBAC controls who can use AI rewrite pass

---

## 📊 Dashboard Features

### Individual Dashboard
- [ ] Token usage over time (chart)
- [ ] Prompt history with scores
- [ ] Savings calculator (estimated $ saved)
- [ ] Optimize any past prompt on demand
- [ ] API key management

### Enterprise Dashboard
- [ ] Org-wide token spend (by team, by user)
- [ ] Waste Leaderboard (who's sending the worst prompts)
- [ ] Budget tracker with alerts
- [ ] RBAC management panel
- [ ] Export usage reports (CSV)
- [ ] Block or enforce optimization rules org-wide

---

## 📱 Mobile App (Expo)

### Screens
| Screen | Purpose |
|---|---|
| **Home** | Today's token spend, score snapshot |
| **Analytics** | Charts: spend over time, top wasters |
| **Alerts** | Budget threshold alerts, anomaly flags |
| **Prompt Log** | Scrollable history of recent prompts |
| **Settings** | Manage API keys, budget limits, notifications |

### Features
- Push notifications for budget alerts
- Read-only analytics (mirrors web dashboard)
- Admin controls for enterprise users
- Biometric login

---

## 🚀 Phases / Build Order

### Phase 1 — Core Proxy + Scorer (Weeks 1–4)
- [ ] Set up Turborepo monorepo
- [ ] Build Hono proxy server
- [ ] Implement scorer package (rule-based)
- [ ] Log token events to ClickHouse
- [ ] Basic auth with Clerk

### Phase 2 — Web Dashboard (Weeks 5–8)
- [ ] Individual dashboard (Next.js)
- [ ] Prompt history + scores
- [ ] Caveman optimizer UI
- [ ] API key vault UI

### Phase 3 — Enterprise Features (Weeks 9–12)
- [ ] Org creation + RBAC
- [ ] Team budgets + alerts
- [ ] Waste leaderboard
- [ ] AI rewrite pass (paid tier)

### Phase 4 — Mobile App (Weeks 13–16)
- [ ] Expo app scaffold
- [ ] Analytics screens
- [ ] Push notifications
- [ ] App Store + Play Store submission

### Phase 5 — Polish & Launch (Weeks 17–20)
- [ ] Landing page
- [ ] Pricing page (Individual / Pro / Enterprise)
- [ ] Onboarding flow
- [ ] Docs site (how to connect your API key)
- [ ] Beta launch

---

## 💰 Monetization

| Plan | Target | Price (est.) |
|---|---|---|
| **Free** | Individuals | $0 — 100 calls/day, caveman trim only |
| **Pro** | Power users | $19/mo — unlimited calls, AI rewrite pass |
| **Team** | Small teams | $49/mo per 5 seats, basic RBAC |
| **Enterprise** | Companies | Custom — full RBAC, SSO, budget controls, SLA |

---

## ⚠️ Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Users don't trust us with their API keys | Encrypt keys at rest (AES-256), never log key values, SOC2 roadmap |
| Proxy adds latency | Deploy on edge-close infra (Railway regions), benchmark < 50ms overhead |
| ClickHouse complexity too early | Start with PostgreSQL for analytics, migrate when scale demands it |
| Clerk pricing at scale | Build abstraction layer so auth can be swapped if needed |
| AI rewrite pass costs money | Only trigger on explicit user request, charge accordingly |

---

## 🧰 Dev Tools & DX

```
Linting          →  ESLint + Prettier
Testing          →  Vitest (unit), Playwright (e2e)
API Docs         →  Scalar (auto-generated from Hono routes)
Secret Management → Railway env vars + Doppler
CI/CD            →  GitHub Actions
Error Tracking   →  Sentry
```

---

*Built with TokenSense. Every token counts.*
