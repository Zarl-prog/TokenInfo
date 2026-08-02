/**
 * Pull the primary user prompt + system text out of OpenAI/Anthropic-style bodies.
 */

export interface ExtractedPrompt {
  prompt: string;
  system?: string;
  messages?: Array<{ role: string; content: string }>;
  model: string;
}

function contentToString(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text: unknown }).text ?? '');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

export function extractFromOpenAI(body: Record<string, unknown>): ExtractedPrompt {
  const model = String(body.model ?? 'unknown');
  const messages = Array.isArray(body.messages) ? body.messages : [];

  let system: string | undefined;
  const normalized: Array<{ role: string; content: string }> = [];
  let lastUser = '';

  for (const raw of messages) {
    if (!raw || typeof raw !== 'object') continue;
    const m = raw as Record<string, unknown>;
    const role = String(m.role ?? 'user');
    const content = contentToString(m.content);
    if (role === 'system') {
      system = system ? `${system}\n${content}` : content;
    } else {
      normalized.push({ role, content });
      if (role === 'user') lastUser = content;
    }
  }

  // Completions API fallback
  if (!lastUser && typeof body.prompt === 'string') {
    lastUser = body.prompt;
  }

  return {
    prompt: lastUser || normalized.map((m) => m.content).join('\n'),
    system,
    messages: normalized,
    model,
  };
}

export function extractFromAnthropic(body: Record<string, unknown>): ExtractedPrompt {
  const model = String(body.model ?? 'unknown');
  let system: string | undefined;
  if (typeof body.system === 'string') system = body.system;
  else if (Array.isArray(body.system)) {
    system = contentToString(body.system);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const normalized: Array<{ role: string; content: string }> = [];
  let lastUser = '';

  for (const raw of messages) {
    if (!raw || typeof raw !== 'object') continue;
    const m = raw as Record<string, unknown>;
    const role = String(m.role ?? 'user');
    const content = contentToString(m.content);
    normalized.push({ role, content });
    if (role === 'user') lastUser = content;
  }

  return {
    prompt: lastUser || normalized.map((m) => m.content).join('\n'),
    system,
    messages: normalized,
    model,
  };
}

/**
 * Apply optimized user text back onto an OpenAI-style messages array.
 */
export function applyOptimizedUserMessage(
  body: Record<string, unknown>,
  optimized: string,
): Record<string, unknown> {
  const clone = structuredClone(body);
  if (Array.isArray(clone.messages)) {
    const messages = clone.messages as Array<Record<string, unknown>>;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') {
        messages[i] = { ...messages[i], content: optimized };
        return clone;
      }
    }
  }
  if (typeof clone.prompt === 'string') {
    clone.prompt = optimized;
  }
  return clone;
}
