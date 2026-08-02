import { cavemanTrim, OptimizeResult } from "./caveman";

export { cavemanTrim };
export type { OptimizeResult };

export async function aiRewrite(prompt: string): Promise<OptimizeResult> {
  // TODO: Implement AI-powered rewrite using Claude/GPT
  // For now, fall back to caveman trim
  return cavemanTrim(prompt);
}
