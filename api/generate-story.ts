// Vercel Edge Function — suporta Anthropic, Groq (gratuito), OpenAI, DeepSeek, Gemini
// Defina AI_PROVIDER + a API key correspondente nas variáveis de ambiente do Vercel.
//
// Provedores disponíveis:
//   AI_PROVIDER=anthropic   → ANTHROPIC_API_KEY  (claude-haiku)
//   AI_PROVIDER=groq        → GROQ_API_KEY       (llama-3.1-8b — GRATUITO)
//   AI_PROVIDER=openai      → OPENAI_API_KEY     (gpt-4o-mini — muito barato)
//   AI_PROVIDER=deepseek    → DEEPSEEK_API_KEY   (deepseek-chat — muito barato)
//   AI_PROVIDER=gemini      → GEMINI_API_KEY     (gemini-1.5-flash — gratuito com limite)

export const config = { runtime: 'edge' };

const SYSTEM_PROMPT =
  'Você é um assistente que cria histórias infantis em português brasileiro para crianças de 5 a 8 anos aprendendo a ler.\n' +
  'Regras: use vocabulário simples; nível 1 = frases 4-6 palavras curtas; nível 2 = frases 6-8 palavras; nível 3 = frases 8-10 palavras.\n' +
  'Crie exatamente 4 frases. Cada frase termina com ponto. Responda APENAS com JSON válido.';

function userPrompt(theme: string, difficulty: number) {
  return `Crie uma história infantil sobre "${theme}" de nível ${difficulty}.\n\nJSON:\n{"title":"...","emoji":"...","sentences":["frase 1.","frase 2.","frase 3.","frase 4."]}`;
}

type Provider = 'anthropic' | 'groq' | 'openai' | 'deepseek' | 'gemini';

interface OpenAICompatConfig {
  url: string;
  model: string;
  authHeader: (key: string) => Record<string, string>;
}

const OPENAI_COMPAT: Record<string, OpenAICompatConfig> = {
  openai:   { url: 'https://api.openai.com/v1/chat/completions',          model: 'gpt-4o-mini',          authHeader: k => ({ Authorization: `Bearer ${k}` }) },
  groq:     { url: 'https://api.groq.com/openai/v1/chat/completions',     model: 'llama-3.1-8b-instant', authHeader: k => ({ Authorization: `Bearer ${k}` }) },
  deepseek: { url: 'https://api.deepseek.com/chat/completions',           model: 'deepseek-chat',        authHeader: k => ({ Authorization: `Bearer ${k}` }) },
};

async function callOpenAICompat(cfg: OpenAICompatConfig, apiKey: string, theme: string, difficulty: number): Promise<string> {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cfg.authHeader(apiKey) },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt(theme, difficulty) },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${cfg.model}: ${res.status} — ${err.slice(0, 200)}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey: string, theme: string, difficulty: number): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(theme, difficulty) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json() as { content: { type: string; text: string }[] };
  return data.content.find(b => b.type === 'text')?.text ?? '';
}

async function callGemini(apiKey: string, theme: string, difficulty: number): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt(theme, difficulty)}` }] }],
      generationConfig: { maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
  return data.candidates[0].content.parts[0].text;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body: { theme?: string; difficulty?: number };
  try { body = await req.json() as { theme?: string; difficulty?: number }; }
  catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 }); }

  const { theme, difficulty = 1 } = body;
  if (!theme?.trim()) return new Response(JSON.stringify({ error: 'Tema obrigatório' }), { status: 400 });

  const provider = (process.env.AI_PROVIDER ?? 'anthropic') as Provider;

  // Resolve API key
  const keyMap: Record<Provider, string | undefined> = {
    anthropic: process.env.ANTHROPIC_API_KEY,
    groq:      process.env.GROQ_API_KEY,
    openai:    process.env.OPENAI_API_KEY,
    deepseek:  process.env.DEEPSEEK_API_KEY,
    gemini:    process.env.GEMINI_API_KEY,
  };
  const apiKey = keyMap[provider];
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: `Variável de ambiente não configurada para provider "${provider}". Veja o comentário no topo do arquivo api/generate-story.ts.` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let rawText: string;
    if (provider === 'anthropic') {
      rawText = await callAnthropic(apiKey, theme, difficulty);
    } else if (provider === 'gemini') {
      rawText = await callGemini(apiKey, theme, difficulty);
    } else {
      rawText = await callOpenAICompat(OPENAI_COMPAT[provider], apiKey, theme, difficulty);
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta sem JSON válido');
    const parsed = JSON.parse(jsonMatch[0]) as { title: string; emoji: string; sentences: string[] };
    if (!parsed.title || !Array.isArray(parsed.sentences) || parsed.sentences.length === 0) {
      throw new Error('Formato de resposta inválido');
    }

    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Erro interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
