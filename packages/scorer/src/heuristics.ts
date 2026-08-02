/**
 * Shared heuristic helpers for prompt waste detection.
 * All estimates are intentionally lightweight (no model calls).
 */

/** ~4 chars per token — good enough for scoring, not billing. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Jaccard similarity over word sets (0–1). */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Average words per sentence. */
export function avgWordsPerSentence(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const words = text.split(/\s+/).filter(Boolean).length;
  return words / sentences.length;
}

export const HEDGING_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bplease\b/gi, label: 'please' },
  { pattern: /\bcould you\b/gi, label: 'could you' },
  { pattern: /\bwould you\b/gi, label: 'would you' },
  { pattern: /\bI was wondering (if|whether)\b/gi, label: 'I was wondering' },
  { pattern: /\bif you (could|wouldn't mind|don't mind)\b/gi, label: 'if you could' },
  { pattern: /\bkindly\b/gi, label: 'kindly' },
  { pattern: /\bjust (wanted|wondering|checking)\b/gi, label: 'just wanted/wondering' },
  { pattern: /\bI (would|I'd) (like|appreciate)\b/gi, label: "I'd like/appreciate" },
  { pattern: /\bif possible\b/gi, label: 'if possible' },
  { pattern: /\bthank you in advance\b/gi, label: 'thank you in advance' },
  { pattern: /\bsorry to bother\b/gi, label: 'sorry to bother' },
  { pattern: /\bI hope this (finds you|is okay|makes sense)\b/gi, label: 'I hope this…' },
];

export const FILLER_PHRASES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bin order to\b/gi, label: 'in order to → to' },
  { pattern: /\bdue to the fact that\b/gi, label: 'due to the fact that → because' },
  { pattern: /\bat this point in time\b/gi, label: 'at this point in time → now' },
  { pattern: /\bfor the purpose of\b/gi, label: 'for the purpose of → for' },
  { pattern: /\bin the event that\b/gi, label: 'in the event that → if' },
  { pattern: /\bit is important to note that\b/gi, label: 'it is important to note that' },
  { pattern: /\bas a matter of fact\b/gi, label: 'as a matter of fact' },
  { pattern: /\bneedless to say\b/gi, label: 'needless to say' },
  { pattern: /\bin my (humble )?opinion\b/gi, label: 'in my opinion' },
  { pattern: /\bthe fact of the matter is\b/gi, label: 'the fact of the matter is' },
];

export const SYSTEM_BOILERPLATE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\byou are (a |an )?(helpful|friendly|professional) (AI|assistant)\b/gi, label: 'generic helpful assistant' },
  { pattern: /\balways be (polite|respectful|courteous)\b/gi, label: 'politeness boilerplate' },
  { pattern: /\bdo not (make up|hallucinate|invent)\b/gi, label: 'anti-hallucination boilerplate' },
  { pattern: /\bif you (don't|do not) know,? (say so|admit)\b/gi, label: "don't know boilerplate" },
  { pattern: /\bI am an AI (language model|assistant)\b/gi, label: 'AI self-description' },
  { pattern: /\bas an AI\b/gi, label: 'as an AI disclaimer' },
];
