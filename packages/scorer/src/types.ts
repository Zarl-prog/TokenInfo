/** Waste flags the scorer can raise on a prompt. */
export type ScoreFlag =
  | 'redundant_context'
  | 'bloated_system'
  | 'hedging_language'
  | 'verbose_phrasing'
  | 'duplicate_sentences'
  | 'unnecessary_examples';

export type ScoreBand = 'efficient' | 'moderate' | 'high' | 'critical';

export interface FlagDetail {
  flag: ScoreFlag;
  severity: 'low' | 'medium' | 'high';
  message: string;
  /** Approximate token waste attributed to this flag (estimate). */
  estimatedWasteTokens?: number;
}

export interface ScoreResult {
  /** 0–100. Lower = more wasteful. */
  score: number;
  band: ScoreBand;
  flags: FlagDetail[];
  /** Rough input token estimate (whitespace-based heuristic). */
  estimatedTokens: number;
  suggestions: string[];
}

export interface ScoreInput {
  /** User / human message content. */
  prompt: string;
  /** Optional system prompt. */
  system?: string;
  /** Optional conversation history messages. */
  messages?: Array<{ role: string; content: string }>;
}
