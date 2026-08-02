/**
 * Rough USD cost estimates per 1M tokens (input / output).
 * Update as pricing changes — used for dashboards, not billing.
 */
const PRICING: Record<string, { in: number; out: number }> = {
  'gpt-4o': { in: 2.5, out: 10 },
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gpt-4.1': { in: 2.0, out: 8.0 },
  'gpt-4.1-mini': { in: 0.4, out: 1.6 },
  'gpt-3.5-turbo': { in: 0.5, out: 1.5 },
  'claude-3-5-sonnet': { in: 3.0, out: 15 },
  'claude-3-5-haiku': { in: 0.8, out: 4 },
  'claude-3-opus': { in: 15, out: 75 },
  'claude-sonnet-4': { in: 3.0, out: 15 },
  default: { in: 1.0, out: 3.0 },
};

function lookup(model: string) {
  const key = Object.keys(PRICING).find((k) => model.toLowerCase().includes(k));
  return PRICING[key ?? 'default'] ?? PRICING.default!;
}

export function estimateCost(model: string, tokensIn: number, tokensOut: number): number {
  const p = lookup(model);
  return (tokensIn / 1_000_000) * p.in + (tokensOut / 1_000_000) * p.out;
}
