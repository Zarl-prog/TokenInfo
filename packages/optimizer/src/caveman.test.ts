import { describe, it, expect } from 'vitest';
import { cavemanTrim } from './caveman.js';
import { optimizePrompt } from './index.js';

describe('cavemanTrim', () => {
  it('strips hedging language', () => {
    const result = cavemanTrim(
      'Please could you kindly write a function that sorts an array. Thank you in advance.',
    );
    expect(result.optimized.toLowerCase()).not.toContain('please');
    expect(result.optimized.toLowerCase()).not.toContain('kindly');
    expect(result.optimized.toLowerCase()).not.toContain('thank you in advance');
    expect(result.optimizedTokens).toBeLessThan(result.originalTokens);
  });

  it('compresses filler phrases', () => {
    const result = cavemanTrim(
      'In order to deploy, due to the fact that the pipeline failed, fix the build.',
    );
    expect(result.optimized.toLowerCase()).toContain('to deploy');
    expect(result.optimized.toLowerCase()).toContain('because');
    expect(result.optimized.toLowerCase()).not.toContain('in order to');
    expect(result.optimized.toLowerCase()).not.toContain('due to the fact that');
  });

  it('removes duplicate sentences', () => {
    const result = cavemanTrim(
      'Return JSON only. Use snake_case keys. Return JSON only. Include a status field.',
    );
    const count = (result.optimized.match(/Return JSON only/gi) ?? []).length;
    expect(count).toBe(1);
  });

  it('leaves tight prompts mostly alone', () => {
    const prompt = 'List open TCP ports on localhost.';
    const result = cavemanTrim(prompt);
    expect(result.optimized.length).toBeGreaterThan(10);
    expect(result.reductionRatio).toBeLessThan(0.3);
  });
});

describe('optimizePrompt', () => {
  it('mode none is a no-op', async () => {
    const result = await optimizePrompt('Hello world', { mode: 'none' });
    expect(result.applied).toBe(false);
    expect(result.optimized).toBe('Hello world');
  });

  it('mode caveman applies trim', async () => {
    const result = await optimizePrompt('Please could you help me write code.', {
      mode: 'caveman',
    });
    expect(result.mode).toBe('caveman');
    expect(result.optimized.toLowerCase()).not.toContain('please');
  });

  it('mode ai-rewrite falls back to caveman in Phase 1', async () => {
    const result = await optimizePrompt('Please write a haiku about tokens.', {
      mode: 'ai-rewrite',
    });
    expect(result.mode).toBe('ai-rewrite');
    expect(result.changes?.some((c) => c.includes('fell back'))).toBe(true);
  });
});
