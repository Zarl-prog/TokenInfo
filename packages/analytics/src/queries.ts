import { prisma, type Provider, type Prisma } from '@tokensense/db';

export interface TokenEventInput {
  userId?: string | null;
  orgId?: string | null;
  provider?: Provider | null;
  model?: string | null;
  tokensIn: number;
  tokensOut?: number;
  cost?: number | string;
  score?: number | null;
  latencyMs?: number | null;
  path?: string | null;
}

/**
 * Record a single token event (hot path).
 * Phase 1: Postgres. Swap implementation for ClickHouse when scale demands it.
 */
export async function recordTokenEvent(input: TokenEventInput) {
  return prisma.tokenEvent.create({
    data: {
      userId: input.userId ?? undefined,
      orgId: input.orgId ?? undefined,
      provider: input.provider ?? undefined,
      model: input.model ?? undefined,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut ?? 0,
      cost: input.cost ?? 0,
      score: input.score ?? undefined,
      latencyMs: input.latencyMs ?? undefined,
      path: input.path ?? undefined,
    },
  });
}

export interface UsageSummary {
  totalTokensIn: number;
  totalTokensOut: number;
  totalCost: number;
  avgScore: number | null;
  callCount: number;
}

/**
 * Aggregate usage for a user or org over a date range.
 */
export async function getUsageSummary(opts: {
  userId?: string;
  orgId?: string;
  from: Date;
  to: Date;
}): Promise<UsageSummary> {
  const where: Prisma.TokenEventWhereInput = {
    timestamp: { gte: opts.from, lte: opts.to },
  };
  if (opts.userId) where.userId = opts.userId;
  if (opts.orgId) where.orgId = opts.orgId;

  const agg = await prisma.tokenEvent.aggregate({
    where,
    _sum: { tokensIn: true, tokensOut: true, cost: true },
    _avg: { score: true },
    _count: true,
  });

  return {
    totalTokensIn: agg._sum.tokensIn ?? 0,
    totalTokensOut: agg._sum.tokensOut ?? 0,
    totalCost: Number(agg._sum.cost ?? 0),
    avgScore: agg._avg.score,
    callCount: agg._count,
  };
}

/**
 * Waste leaderboard: lowest average scores first (org scope).
 */
export async function getWasteLeaderboard(opts: {
  orgId: string;
  from: Date;
  to: Date;
  limit?: number;
}) {
  const rows = await prisma.tokenEvent.groupBy({
    by: ['userId'],
    where: {
      orgId: opts.orgId,
      timestamp: { gte: opts.from, lte: opts.to },
      userId: { not: null },
      score: { not: null },
    },
    _avg: { score: true },
    _sum: { tokensIn: true, cost: true },
    _count: true,
    orderBy: { _avg: { score: 'asc' } },
    take: opts.limit ?? 10,
  });

  return rows.map((r) => ({
    userId: r.userId!,
    avgScore: r._avg.score ?? 0,
    totalTokensIn: r._sum.tokensIn ?? 0,
    totalCost: Number(r._sum.cost ?? 0),
    callCount: r._count,
  }));
}

/**
 * Daily rollup for charts.
 */
export async function getDailyUsage(opts: {
  userId?: string;
  orgId?: string;
  from: Date;
  to: Date;
}) {
  const where: Prisma.TokenEventWhereInput = {
    timestamp: { gte: opts.from, lte: opts.to },
  };
  if (opts.userId) where.userId = opts.userId;
  if (opts.orgId) where.orgId = opts.orgId;

  const events = await prisma.tokenEvent.findMany({
    where,
    select: {
      timestamp: true,
      tokensIn: true,
      tokensOut: true,
      cost: true,
      score: true,
    },
    orderBy: { timestamp: 'asc' },
  });

  const byDay = new Map<
    string,
    { date: string; tokensIn: number; tokensOut: number; cost: number; scoreSum: number; count: number }
  >();

  for (const e of events) {
    const date = e.timestamp.toISOString().slice(0, 10);
    const row = byDay.get(date) ?? {
      date,
      tokensIn: 0,
      tokensOut: 0,
      cost: 0,
      scoreSum: 0,
      count: 0,
    };
    row.tokensIn += e.tokensIn;
    row.tokensOut += e.tokensOut;
    row.cost += Number(e.cost);
    if (e.score != null) {
      row.scoreSum += e.score;
      row.count += 1;
    } else {
      row.count += 1;
    }
    byDay.set(date, row);
  }

  return [...byDay.values()].map((r) => ({
    date: r.date,
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
    cost: r.cost,
    avgScore: r.count > 0 ? r.scoreSum / r.count : null,
    callCount: r.count,
  }));
}
