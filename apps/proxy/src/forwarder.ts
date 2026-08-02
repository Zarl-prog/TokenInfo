import { getEnv } from './env.js';

export type UpstreamProvider = 'openai' | 'anthropic';

export interface ForwardRequest {
  provider: UpstreamProvider;
  /** Path on the upstream API, e.g. /v1/chat/completions */
  path: string;
  method: string;
  body: unknown;
  /** Caller's upstream provider key, if provided. */
  providerKey?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ForwardResult {
  status: number;
  headers: Headers;
  body: ArrayBuffer;
  json: unknown | null;
}

const OPENAI_BASE = 'https://api.openai.com';
const ANTHROPIC_BASE = 'https://api.anthropic.com';

function resolveProviderKey(provider: UpstreamProvider, explicit?: string | null): string | null {
  if (explicit) return explicit;
  const env = getEnv();
  if (provider === 'openai') return env.OPENAI_API_KEY ?? null;
  if (provider === 'anthropic') return env.ANTHROPIC_API_KEY ?? null;
  return null;
}

/**
 * Forward a request to the real LLM provider.
 */
export async function forwardToProvider(req: ForwardRequest): Promise<ForwardResult> {
  const apiKey = resolveProviderKey(req.provider, req.providerKey);
  if (!apiKey) {
    const err = new Error(
      `No API key for provider "${req.provider}". Pass X-Provider-Key or set OPENAI_API_KEY / ANTHROPIC_API_KEY.`,
    );
    (err as Error & { status: number }).status = 401;
    throw err;
  }

  const base = req.provider === 'openai' ? OPENAI_BASE : ANTHROPIC_BASE;
  const url = `${base}${req.path.startsWith('/') ? req.path : `/${req.path}`}`;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(req.headers ?? {}),
  };

  if (req.provider === 'openai') {
    headers['authorization'] = `Bearer ${apiKey}`;
  } else {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = headers['anthropic-version'] ?? '2023-06-01';
  }

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
    signal: req.signal,
  });

  const body = await res.arrayBuffer();
  let json: unknown | null = null;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    try {
      json = JSON.parse(new TextDecoder().decode(body));
    } catch {
      json = null;
    }
  }

  return {
    status: res.status,
    headers: res.headers,
    body,
    json,
  };
}

/** Extract usage tokens from OpenAI or Anthropic response shapes. */
export function extractUsage(json: unknown): { tokensIn: number; tokensOut: number } {
  if (!json || typeof json !== 'object') return { tokensIn: 0, tokensOut: 0 };
  const obj = json as Record<string, unknown>;

  // OpenAI: usage.prompt_tokens / completion_tokens
  if (obj.usage && typeof obj.usage === 'object') {
    const u = obj.usage as Record<string, unknown>;
    if (typeof u.prompt_tokens === 'number' || typeof u.completion_tokens === 'number') {
      return {
        tokensIn: Number(u.prompt_tokens ?? 0),
        tokensOut: Number(u.completion_tokens ?? 0),
      };
    }
    // Anthropic-style nested in some proxies, or OpenAI new shape
    if (typeof u.input_tokens === 'number' || typeof u.output_tokens === 'number') {
      return {
        tokensIn: Number(u.input_tokens ?? 0),
        tokensOut: Number(u.output_tokens ?? 0),
      };
    }
  }

  // Anthropic top-level usage
  if (typeof obj.usage === 'undefined' && 'input_tokens' in obj) {
    return {
      tokensIn: Number(obj.input_tokens ?? 0),
      tokensOut: Number(obj.output_tokens ?? 0),
    };
  }

  return { tokensIn: 0, tokensOut: 0 };
}
