/**
 * AI rewrite pass — optional paid deep compression.
 * Sends prompt to Claude/GPT with a compression system prompt.
 * Target: 40–70% token reduction while preserving intent and tone.
 *
 * Phase 1: interface + stub. Real provider calls land in Phase 3.
 */

export interface AiRewriteOptions {
  /** Provider to use for the rewrite. */
  provider?: 'anthropic' | 'openai';
  /** Model id override. */
  model?: string;
  /** Preserve original tone (formal / casual / technical). Default true. */
  preserveTone?: boolean;
  /** Max output tokens for the rewrite model. */
  maxTokens?: number;
  /** API key for the rewrite provider (caller's key or platform key). */
  apiKey?: string;
}

export interface AiRewriteResult {
  original: string;
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  reductionRatio: number;
  provider: string;
  model: string;
  /** True when this was a real model call; false for stub/passthrough. */
  applied: boolean;
}

const COMPRESSION_SYSTEM = `You are a prompt compressor. Rewrite the user's prompt to maximize semantic density.
Rules:
- Preserve intent, constraints, and required output format exactly.
- Remove hedging, filler, redundancy, and unsolicited examples.
- Keep technical terms and proper nouns unchanged.
- Do not add new requirements.
- Output ONLY the compressed prompt, nothing else.`;

/**
 * AI-powered deep compression.
 * Currently returns a not-implemented result unless a future provider is wired.
 * Callers should fall back to cavemanTrim when `applied === false`.
 */
export async function aiRewrite(
  prompt: string,
  options: AiRewriteOptions = {},
): Promise<AiRewriteResult> {
  const provider = options.provider ?? 'anthropic';
  const model = options.model ?? (provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-haiku-latest');

  // Phase 1 stub — no network. Phase 3 wires real calls.
  void COMPRESSION_SYSTEM;
  void options;

  const { estimateTokens } = await import('@tokensense/scorer');
  const tokens = estimateTokens(prompt);

  return {
    original: prompt,
    optimized: prompt,
    originalTokens: tokens,
    optimizedTokens: tokens,
    reductionRatio: 0,
    provider,
    model,
    applied: false,
  };
}

export { COMPRESSION_SYSTEM };
