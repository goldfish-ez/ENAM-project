// Model router. Two tiers on Gemini's API (free tier works):
//   bulk   → cheap, fast model for extraction / classification / one-liners   (default gemini-3.5-flash-lite)
//   reason → stronger model only where judgement matters: guidance vs delivery, bull/bear (default gemini-3.8-flash)
// Every call is cached by content hash so the same transcript is never paid for twice.
import crypto from 'node:crypto';

export type Tier = 'bulk' | 'reason';
const MODELS: Record<Tier, string[]> = {
  bulk: [process.env.FINN_BULK_MODEL || 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite'],
  reason: [process.env.FINN_REASON_MODEL || 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'],
};
// USD per 1M tokens (input, output) — used to show the cost of each answer.
const PRICE: Record<string, [number, number]> = {
  'gemini-3.5-flash-lite': [0.3, 2.5], 'gemini-3.8-flash': [1.5, 7.5], 'gemini-3.6-flash': [1.5, 7.5], 'gemini-3.1-flash-lite': [0.25, 1.5],
};

export const llmEnabled = () => !!process.env.GEMINI_API_KEY;

export interface LlmUsage { model: string; inputTokens: number; outputTokens: number; costUsd: number; cached: boolean }
const memo = new Map<string, { text: string; usage: LlmUsage }>();

export async function generate(tier: Tier, system: string, prompt: string, opts: { json?: boolean; maxTokens?: number } = {}): Promise<{ text: string; usage: LlmUsage }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const h = crypto.createHash('sha256').update(tier + system + prompt).digest('hex');
  const hit = memo.get(h);
  if (hit) return { text: hit.text, usage: { ...hit.usage, cached: true, costUsd: 0 } };
  let lastErr: unknown;
  for (const model of MODELS[tier]) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: opts.maxTokens ?? 4096, ...(opts.json ? { responseMimeType: 'application/json' } : {}) },
        }),
        signal: AbortSignal.timeout(90_000),
      });
      if (res.status === 404 || res.status === 400) { lastErr = new Error(`${model}: ${res.status} ${await res.text()}`); continue; }
      if (!res.ok) throw new Error(`${model}: ${res.status} ${(await res.text()).slice(0, 300)}`);
      const data = await res.json();
      const text: string = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
      const u = data.usageMetadata ?? {};
      const [pi, po] = PRICE[model] ?? [0.3, 2.5];
      const usage: LlmUsage = { model, inputTokens: u.promptTokenCount ?? 0, outputTokens: u.candidatesTokenCount ?? 0, costUsd: ((u.promptTokenCount ?? 0) * pi + (u.candidatesTokenCount ?? 0) * po) / 1e6, cached: false };
      memo.set(h, { text, usage });
      return { text, usage };
    } catch (e) { lastErr = e; }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function generateJson<T>(tier: Tier, system: string, prompt: string, maxTokens?: number): Promise<{ data: T; usage: LlmUsage }> {
  const { text, usage } = await generate(tier, system, prompt, { json: true, maxTokens });
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  return { data: JSON.parse(cleaned) as T, usage };
}
