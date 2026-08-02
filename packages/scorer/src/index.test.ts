import { describe, it, expect } from 'vitest';
import { scorePrompt, estimateTokens, recommendedAction } from './index.js';

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('estimates roughly 1 token per 4 chars', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('a'.repeat(40))).toBe(10);
  });
});

describe('scorePrompt', () => {
  it('scores a tight prompt as efficient', () => {
    const result = scorePrompt({
      prompt: 'Summarize this PR diff in 3 bullets. Focus on API changes.',
    });
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.band).toBe('efficient');
    expect(result.flags).toHaveLength(0);
  });

  it('flags hedging language', () => {
    const result = scorePrompt({
      prompt:
        'Please could you kindly help me? I was wondering if you could possibly write a function. Thank you in advance.',
    });
    expect(result.flags.some((f) => f.flag === 'hedging_language')).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it('flags verbose filler phrases', () => {
    const result = scorePrompt({
      prompt:
        'In order to complete this task, due to the fact that we need clarity, at this point in time it is important to note that we should refactor the module.',
    });
    expect(result.flags.some((f) => f.flag === 'verbose_phrasing')).toBe(true);
  });

  it('flags duplicate sentences', () => {
    const result = scorePrompt({
      prompt:
        'The API must return JSON. The database uses Postgres. The API must return JSON. Deploy on Railway.',
    });
    expect(result.flags.some((f) => f.flag === 'duplicate_sentences')).toBe(true);
  });

  it('flags bloated system prompts', () => {
    const system = [
      'You are a helpful AI assistant.',
      'Always be polite and respectful.',
      'Do not make up information or hallucinate.',
      'If you do not know, say so.',
      'As an AI language model you should follow all policies.',
      'A'.repeat(2000),
    ].join(' ');

    const result = scorePrompt({
      prompt: 'List open ports.',
      system,
    });
    expect(result.flags.some((f) => f.flag === 'bloated_system')).toBe(true);
  });

  it('includes suggestions for moderate/high waste', () => {
    const result = scorePrompt({
      prompt:
        'Please could you kindly, I was wondering if you could help. In order to proceed due to the fact that we need this.',
    });
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('returns estimated tokens > 0', () => {
    const result = scorePrompt({ prompt: 'Hello world, write a haiku.' });
    expect(result.estimatedTokens).toBeGreaterThan(0);
  });
});

describe('recommendedAction', () => {
  it('maps bands to actions', () => {
    expect(recommendedAction('efficient')).toContain('No action');
    expect(recommendedAction('moderate')).toContain('caveman');
    expect(recommendedAction('high')).toContain('AI rewrite');
    expect(recommendedAction('critical')).toContain('Block');
  });
});
