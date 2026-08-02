### The Core Idea

**Problem:** As big tech companies lean harder on AI to speed up work, they're burning unnecessarily high token usage — and that's costing serious money, often without visibility into *why*.

**Solution:** A middleman app/web platform that sits between users and their LLM API calls, which:

1. **Scores every prompt** by how efficiently it uses tokens (flags redundant context, bloated system prompts, verbosity)
2. **Optimizes prompts on demand** — a free instant rule-based trim ("caveman" style: strip filler, hedging, duplicate sentences), plus an optional deeper AI rewrite pass for maximum compression
3. **Tracks analytics/history** — shows which prompts caused unusually high token usage over time
4. Has **two sides**: an Enterprise side (team budgets, RBAC, org-wide waste leaderboards) and a Normal/Individual user side (personal usage + savings)
5. Has a **mobile app** that mirrors the analytics and lets users/admins control settings and monitor spend on the go
6. Works by **users connecting their own LLM API keys** through the platform, which then has visibility/control over the token usage flowing through it

### Where This Stands Right Now

- **Branding:** working name **Tokli**
- **Build context:** originally scoped as a real MVP (full architecture with SDK, ingestion API, queue, workers, two databases, scoring, alerting), then reshaped into a **hackathon build** (36–48 hours) — first for a 5-person team, then adjusted for you building it **solo**
- **Approach for MVP/hackathon:** SDK-first (not full proxy-first) to avoid the trust barrier of routing API keys through a third party on day one — proxy mode, enterprise RBAC, and mobile app are explicitly deferred to Phase 2+
- **Deliverables built so far:** a technical architecture plan, a hackathon build plan, a solo technical blueprint (with the optimizer spec added), an execution guide, and a working minimalistic landing page/demo (`index.html`) with a live functional rule-based optimizer
