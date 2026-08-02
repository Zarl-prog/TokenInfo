# TokenSense

> *See what you're spending. Cut what you're wasting.*

B2B SaaS middleware that sits between your app and LLM APIs. It **scores**, **optimizes**, and **tracks** prompt token usage so teams stop paying for waste.

## Status

**Phase 1 — Core Proxy + Scorer** (in progress)

| Piece | Package | Status |
|---|---|---|
| Monorepo | Turborepo + pnpm | ✅ |
| Scorer | `@tokensense/scorer` | ✅ |
| Optimizer (caveman) | `@tokensense/optimizer` | ✅ |
| DB schema | `@tokensense/db` | ✅ |
| Analytics helpers | `@tokensense/analytics` | ✅ (Postgres; ClickHouse later) |
| Proxy | `@tokensense/proxy` | ✅ |
| Web dashboard | `apps/web` | Phase 2 |
| Mobile | `apps/mobile` | Phase 4 |

## Monorepo layout

```
tokensense/
├── apps/
│   └── proxy/          # Hono LLM proxy
├── packages/
│   ├── scorer/         # TokenSense Score 0–100
│   ├── optimizer/      # Caveman trim + AI rewrite stub
│   ├── db/             # Prisma + PostgreSQL
│   └── analytics/      # Usage queries (Postgres for now)
├── turbo.json
└── package.json
```

## Quick start

```bash
# Install
pnpm install

# Build all packages
pnpm build

# Run unit tests
pnpm test

# Start proxy in dry-run mode (no Postgres required for /v1/score + /v1/optimize)
cp .env.example .env
PROXY_DRY_RUN=true pnpm --filter @tokensense/proxy dev
```

### Score a prompt

```bash
curl -s http://localhost:8787/v1/score \
  -H "Authorization: Bearer ts_dev_local_key" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Please could you kindly help me write a function? Thank you in advance."}' | jq
```

### Caveman-optimize a prompt

```bash
curl -s http://localhost:8787/v1/optimize \
  -H "Authorization: Bearer ts_dev_local_key" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Please could you kindly write a sort function. Thank you in advance.","mode":"caveman"}' | jq
```

### Proxy an OpenAI chat call

Point your OpenAI base URL at the proxy. Pass your **TokenSense** key as `Authorization`, and your real OpenAI key as `X-Provider-Key` (or set `OPENAI_API_KEY` on the server).

```bash
curl -s http://localhost:8787/v1/chat/completions \
  -H "Authorization: Bearer ts_dev_local_key" \
  -H "X-Provider-Key: sk-..." \
  -H "X-TokenSense-Optimize: caveman" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"Please could you write a haiku about tokens."}]
  }' | jq
```

Responses include a `tokensense` object:

```json
{
  "tokensense": {
    "score": 72,
    "band": "moderate",
    "flags": [...],
    "suggestions": [...],
    "recommendedAction": "Suggest caveman trim",
    "optimized": true,
    "cost": 0.00012,
    "latencyMs": 340
  }
}
```

## Score bands

| Score | Band | Action |
|---|---|---|
| 85–100 | Efficient | No action |
| 60–84 | Moderate | Suggest caveman trim |
| 30–59 | High waste | Recommend AI rewrite |
| 0–29 | Critical | Block / force optimize (enterprise) |

## Database

```bash
# Requires DATABASE_URL in .env
pnpm db:generate
pnpm db:push
```

Phase 1 stores analytics in Postgres (`TokenEvent`). ClickHouse is deferred until scale requires it (see plan risk mitigations).

## Auth notes

- **Proxy**: TokenSense API keys (`ts_…`), hashed at rest.
- **Dashboard (Phase 2)**: Clerk orgs + RBAC.
- Local dev accepts `DEV_API_KEY` (default `ts_dev_local_key`) without a database.

## Docs

Full product plan: [`TokenSense_Plan.md`](./TokenSense_Plan.md)

---

*Built with TokenSense. Every token counts.*
