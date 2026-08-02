import type { FlagDetail } from './types.js';
import {
  estimateTokens,
  jaccardSimilarity,
  splitSentences,
  splitParagraphs,
  avgWordsPerSentence,
  HEDGING_PATTERNS,
  FILLER_PHRASES,
  SYSTEM_BOILERPLATE_PATTERNS,
  normalizeWhitespace,
} from './heuristics.js';

export function detectHedging(text: string): FlagDetail | null {
  const hits: string[] = [];
  for (const { pattern, label } of HEDGING_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      hits.push(`${label} (×${matches.length})`);
    }
  }
  if (hits.length === 0) return null;

  const severity = hits.length >= 4 ? 'high' : hits.length >= 2 ? 'medium' : 'low';
  return {
    flag: 'hedging_language',
    severity,
    message: `Hedging / politeness filler detected: ${hits.slice(0, 5).join(', ')}`,
    estimatedWasteTokens: Math.min(30, hits.length * 4),
  };
}

export function detectVerbosePhrasing(text: string): FlagDetail | null {
  const fillerHits: string[] = [];
  for (const { pattern, label } of FILLER_PHRASES) {
    if (pattern.test(text)) {
      fillerHits.push(label);
      pattern.lastIndex = 0;
    }
  }

  const avgWords = avgWordsPerSentence(text);
  const longSentences = avgWords > 28;
  const hasFiller = fillerHits.length > 0;

  if (!longSentences && !hasFiller) return null;

  const parts: string[] = [];
  if (longSentences) {
    parts.push(`avg ${avgWords.toFixed(0)} words/sentence (target < 20)`);
  }
  if (hasFiller) {
    parts.push(`filler: ${fillerHits.slice(0, 3).join('; ')}`);
  }

  return {
    flag: 'verbose_phrasing',
    severity: longSentences && hasFiller ? 'high' : 'medium',
    message: `Verbose phrasing: ${parts.join('; ')}`,
    estimatedWasteTokens: Math.round(estimateTokens(text) * 0.15),
  };
}

export function detectDuplicateSentences(text: string): FlagDetail | null {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return null;

  const duplicates: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < sentences.length; i++) {
    const normalized = normalizeWhitespace(sentences[i]!.toLowerCase());
    if (seen.has(normalized)) {
      duplicates.push(sentences[i]!.slice(0, 60));
      continue;
    }
    seen.add(normalized);

    for (let j = i + 1; j < sentences.length; j++) {
      const sim = jaccardSimilarity(sentences[i]!, sentences[j]!);
      if (sim >= 0.85) {
        duplicates.push(`~${sentences[i]!.slice(0, 40)}…`);
        break;
      }
    }
  }

  if (duplicates.length === 0) return null;

  return {
    flag: 'duplicate_sentences',
    severity: duplicates.length >= 3 ? 'high' : 'medium',
    message: `Duplicate / near-duplicate sentences found (${duplicates.length})`,
    estimatedWasteTokens: duplicates.length * 15,
  };
}

export function detectRedundantContext(
  prompt: string,
  system?: string,
  messages?: Array<{ role: string; content: string }>,
): FlagDetail | null {
  const chunks: string[] = [];
  if (system) chunks.push(...splitParagraphs(system));
  chunks.push(...splitParagraphs(prompt));
  if (messages) {
    for (const m of messages) {
      if (m.content) chunks.push(...splitParagraphs(m.content));
    }
  }

  if (chunks.length < 2) return null;

  let redundantPairs = 0;
  let wasteTokens = 0;

  for (let i = 0; i < chunks.length; i++) {
    for (let j = i + 1; j < chunks.length; j++) {
      const sim = jaccardSimilarity(chunks[i]!, chunks[j]!);
      if (sim >= 0.7) {
        redundantPairs++;
        wasteTokens += Math.min(estimateTokens(chunks[i]!), estimateTokens(chunks[j]!));
      }
    }
  }

  if (redundantPairs === 0) return null;

  return {
    flag: 'redundant_context',
    severity: redundantPairs >= 3 ? 'high' : 'medium',
    message: `Redundant context: ${redundantPairs} near-duplicate paragraph pair(s)`,
    estimatedWasteTokens: wasteTokens,
  };
}

export function detectBloatedSystem(system?: string): FlagDetail | null {
  if (!system || system.trim().length === 0) return null;

  const tokens = estimateTokens(system);
  const boilerplateHits: string[] = [];

  for (const { pattern, label } of SYSTEM_BOILERPLATE_PATTERNS) {
    if (pattern.test(system)) {
      boilerplateHits.push(label);
      pattern.lastIndex = 0;
    }
  }

  const isLong = tokens > 400;
  const hasBoilerplate = boilerplateHits.length >= 2;

  if (!isLong && !hasBoilerplate) return null;

  const parts: string[] = [];
  if (isLong) parts.push(`~${tokens} tokens (consider < 300)`);
  if (hasBoilerplate) parts.push(`boilerplate: ${boilerplateHits.slice(0, 3).join(', ')}`);

  return {
    flag: 'bloated_system',
    severity: isLong && hasBoilerplate ? 'high' : isLong ? 'medium' : 'low',
    message: `Bloated system prompt: ${parts.join('; ')}`,
    estimatedWasteTokens: isLong ? Math.round(tokens * 0.25) : boilerplateHits.length * 10,
  };
}

export function detectUnnecessaryExamples(text: string): FlagDetail | null {
  // Look for multi-example blocks when the user didn't ask for examples.
  const exampleMarkers =
    text.match(/\b(for example|e\.g\.|eg\.|example\s*\d|here('s| is) an example)\b/gi) ?? [];
  const codeBlocks = text.match(/```[\s\S]*?```/g) ?? [];
  const bulletExamples = text.match(/^(\s*[-*•]\s+.+\n){4,}/gm) ?? [];

  const askedForExamples = /\b(give|provide|show|include|with)\b.{0,40}\bexamples?\b/i.test(text);

  if (askedForExamples) return null;

  const exampleCount = exampleMarkers.length + (codeBlocks.length > 2 ? codeBlocks.length - 1 : 0);
  if (exampleCount < 2 && bulletExamples.length === 0) return null;

  return {
    flag: 'unnecessary_examples',
    severity: exampleCount >= 4 ? 'high' : 'medium',
    message: `Possible unnecessary examples (${exampleCount} markers, ${codeBlocks.length} code blocks)`,
    estimatedWasteTokens:
      codeBlocks.slice(1).reduce((sum, b) => sum + estimateTokens(b), 0) + exampleCount * 20,
  };
}
