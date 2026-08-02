# TokenInfo — Core Build Plan
> Focus: Get the product working end-to-end

---

## Phase 1: Foundation (Days 1-3)
**Goal:** Install deps, verify everything runs

- [ ] Run `pnpm install`
- [ ] Start proxy server (`pnpm dev` in apps/proxy)
- [ ] Start web app (`pnpm dev` in apps/web)
- [ ] Verify both servers start without errors
- [ ] Test proxy health endpoint: `GET /health`

**Deliverable:** Both apps running locally

---

## Phase 2: Proxy Core (Days 4-7)
**Goal:** Proxy intercepts and forwards LLM calls

- [ ] Implement `/v1/chat/completions` route
- [ ] Forward requests to OpenAI/Anthropic
- [ ] Return response to user (passthrough mode)
- [ ] Add request logging (token count, latency)
- [ ] Test with curl: send prompt → get response

**Deliverable:** Working proxy that forwards API calls

---

## Phase 3: Scoring Engine (Days 8-10)
**Goal:** Score every prompt in real-time

- [ ] Wire scorer package into proxy middleware
- [ ] Detect: redundant context, hedging, filler words
- [ ] Return score (0-100) with response headers
- [ ] Log score with each request
- [ ] Test: send bloated prompt → see low score

**Deliverable:** Every request scored and logged

---

## Phase 4: Optimizer (Days 11-13)
**Goal:** Auto-trim prompts before forwarding

- [ ] Wire optimizer into proxy (optional per-request)
- [ ] Implement caveman trim: strip filler, dedupe
- [ ] Compare original vs optimized token count
- [ ] Return savings in response headers
- [ ] Test: send verbose prompt → get trimmed version

**Deliverable:** Prompts optimized before hitting LLM

---

## Phase 5: Data Layer (Days 14-16)
**Goal:** Persist request logs to database

- [ ] Set up PostgreSQL (local or Supabase)
- [ ] Run Prisma migrations
- [ ] Log each request to `prompt_logs` table
- [ ] Store: prompt hash, score, tokens, cost, timestamp
- [ ] Query: "show me last 10 requests"

**Deliverable:** Request history persisted in DB

---

## Phase 6: Dashboard MVP (Days 17-21)
**Goal:** Basic UI to view token usage

- [ ] Build layout: sidebar + main content
- [ ] Table: recent requests with scores
- [ ] Chart: tokens over time (line chart)
- [ ] Stats: total tokens, avg score, estimated cost
- [ ] Filter: by date range, score threshold

**Deliverable:** Working dashboard showing real data

---

## Phase 7: API Key Auth (Days 22-24)
**Goal:** Users authenticate with their own API keys

- [ ] Generate unique API keys per user
- [ ] Validate keys on proxy requests
- [ ] Store encrypted keys in database
- [ ] UI: add/remove API keys
- [ ] Test: use generated key → proxy works

**Deliverable:** Multi-user support with API keys

---

## Phase 8: Polish & Deploy (Days 25-28)
**Goal:** Production-ready MVP

- [ ] Error handling (invalid keys, rate limits)
- [ ] Loading states, empty states
- [ ] Deploy proxy to Railway
- [ ] Deploy web to Vercel
- [ ] Connect production DB
- [ ] Basic README with setup instructions

**Deliverable:** Live MVP at tokensense.io

---

## Success Metrics
- Proxy forwards calls with <50ms overhead
- Scorer identifies waste in <10ms
- Dashboard loads in <2s
- 100% of requests logged

---

*Focus on working software over perfect code.*
