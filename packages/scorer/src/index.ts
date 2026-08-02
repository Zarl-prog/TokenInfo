export interface ScoreResult {
  score: number;
  flags: string[];
  efficiency: "efficient" | "moderate" | "high_waste" | "critical";
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

const HEDGING_PHRASES = [
  "I think",
  "maybe",
  "perhaps",
  "it seems like",
  "I guess",
  "sort of",
  "kind of",
];

export function scorePrompt(prompt: string): ScoreResult {
  const flags: string[] = [];
  let penalty = 0;

  // Check for redundant context
  const sentences = prompt.split(/[.!?]+/).filter((s) => s.trim());
  const uniqueSentences = new Set(sentences.map((s) => s.trim().toLowerCase()));
  if (uniqueSentences.size < sentences.length * 0.8) {
    flags.push("redundant_context");
    penalty += 15;
  }

  // Check for hedging language
  const lowerPrompt = prompt.toLowerCase();
  for (const phrase of HEDGING_PHRASES) {
    if (lowerPrompt.includes(phrase.toLowerCase())) {
      flags.push("hedging_language");
      penalty += 5;
      break;
    }
  }

  // Check for filler words
  let fillerCount = 0;
  for (const word of FILLER_WORDS) {
    if (lowerPrompt.includes(word.toLowerCase())) {
      fillerCount++;
    }
  }
  if (fillerCount > 2) {
    flags.push("filler_words");
    penalty += 10;
  }

  // Check for verbose phrasing
  const words = prompt.split(/\s+/);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  if (avgWordsPerSentence > 25) {
    flags.push("verbose_phrasing");
    penalty += 10;
  }

  // Calculate score (100 = perfect, 0 = worst)
  const score = Math.max(0, Math.min(100, 100 - penalty));

  // Determine efficiency level
  let efficiency: ScoreResult["efficiency"];
  if (score >= 85) {
    efficiency = "efficient";
  } else if (score >= 60) {
    efficiency = "moderate";
  } else if (score >= 30) {
    efficiency = "high_waste";
  } else {
    efficiency = "critical";
  }

  return { score, flags, efficiency };
}
