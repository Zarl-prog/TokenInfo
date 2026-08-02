import { describe, it, expect } from 'vitest';
import {
  extractFromOpenAI,
  extractFromAnthropic,
  applyOptimizedUserMessage,
} from './messages.js';

describe('extractFromOpenAI', () => {
  it('pulls system + last user message', () => {
    const result = extractFromOpenAI({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Be concise.' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' },
        { role: 'user', content: 'Summarize the logs.' },
      ],
    });
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.system).toBe('Be concise.');
    expect(result.prompt).toBe('Summarize the logs.');
  });

  it('handles content parts arrays', () => {
    const result = extractFromOpenAI({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'Part A' }, { type: 'text', text: 'Part B' }],
        },
      ],
    });
    expect(result.prompt).toContain('Part A');
    expect(result.prompt).toContain('Part B');
  });
});

describe('extractFromAnthropic', () => {
  it('reads system string + messages', () => {
    const result = extractFromAnthropic({
      model: 'claude-3-5-haiku-latest',
      system: 'You are terse.',
      messages: [{ role: 'user', content: 'Ping' }],
    });
    expect(result.system).toBe('You are terse.');
    expect(result.prompt).toBe('Ping');
  });
});

describe('applyOptimizedUserMessage', () => {
  it('replaces the last user message', () => {
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Please could you help' },
        { role: 'assistant', content: 'Sure' },
        { role: 'user', content: 'Please write code' },
      ],
    };
    const next = applyOptimizedUserMessage(body, 'Write code');
    const messages = next.messages as Array<{ role: string; content: string }>;
    expect(messages[2]!.content).toBe('Write code');
    expect(messages[0]!.content).toBe('Please could you help');
  });
});
