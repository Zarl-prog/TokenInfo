export interface OptimizeResult {
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  reduction: number;
}

const FILLER_WORDS = [
  "please",
  "could you",
  "I was wondering if",
  "just",
  "actually",
  "basically",
  "literally",
  "in order to",
  "for the purpose of",
];

export function cavemanTrim(prompt: string): OptimizeResult {
  let optimized = prompt;

  // Remove filler words
  for (const word of FILLER_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    optimized = optimized.replace(regex, "");
  }

  // Remove duplicate sentences
  const sentences = optimized.split(/[.!?]+/).filter((s) => s.trim());
  const uniqueSentences = [...new Set(sentences.map((s) => s.trim()))];
  optimized = uniqueSentences.join(". ");

  // Clean up extra spaces
  optimized = optimized.replace(/\s+/g, " ").trim();

  // Rough token estimate (words / 1.3)
  const originalTokens = Math.ceil(prompt.split(/\s+/).length / 1.3);
  const optimizedTokens = Math.ceil(optimized.split(/\s+/).length / 1.3);
  const reduction = Math.round(
    ((originalTokens - optimizedTokens) / originalTokens) * 100
  );

  return {
    optimized,
    originalTokens,
    optimizedTokens,
    reduction,
  };
}
