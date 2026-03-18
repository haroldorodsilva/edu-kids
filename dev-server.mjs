// Local dev server — port 3001 — mirrors api/generate-story.ts for Vite proxy
// Run: node dev-server.mjs  (from the repo root)
// Reads digiletras/.env for AI_PROVIDER and API keys

import http from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Parse .env manually (no extra deps)
function loadEnv() {
  try {
    const raw = readFileSync(join(__dir, 'digiletras', '.env'), 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

const ENV = loadEnv();

const SYSTEM_PROMPT =
  'Você é um assistente que cria histórias infantis em português brasileiro para crianças de 5 a 8 anos aprendendo a ler.\n' +
  'Regras: use vocabulário simples; nível 1 = frases 4-6 palavras curtas; nível 2 = frases 6-8 palavras; nível 3 = frases 8-10 palavras.\n' +
  'Crie exatamente 4 frases. Cada frase termina com ponto. Responda APENAS com JSON válido.';

function userPrompt(theme, difficulty) {
  return `Crie uma história infantil sobre "${theme}" de nível ${difficulty}.\n\nJSON:\n{"title":"...","emoji":"...","sentences":["frase 1.","frase 2.","frase 3.","frase 4."]}`;
}

async function callGroq(apiKey, theme, difficulty) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt(theme, difficulty) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey, theme, difficulty) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(theme, difficulty) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  return data.content.find(b => b.type === 'text')?.text ?? '';
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.url !== '/api/generate-story' || req.method !== 'POST') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { theme, difficulty = 1 } = JSON.parse(body);
      if (!theme?.trim()) { res.writeHead(400); res.end(JSON.stringify({ error: 'Tema obrigatório' })); return; }

      const provider = (ENV.AI_PROVIDER ?? 'groq').toLowerCase();
      let rawText;

      if (provider === 'groq' && ENV.GROQ_API_KEY) {
        rawText = await callGroq(ENV.GROQ_API_KEY, theme, difficulty);
      } else if (provider === 'anthropic' && ENV.ANTHROPIC_API_KEY) {
        rawText = await callAnthropic(ENV.ANTHROPIC_API_KEY, theme, difficulty);
      } else if (ENV.GROQ_API_KEY) {
        rawText = await callGroq(ENV.GROQ_API_KEY, theme, difficulty);
      } else if (ENV.ANTHROPIC_API_KEY) {
        rawText = await callAnthropic(ENV.ANTHROPIC_API_KEY, theme, difficulty);
      } else {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Nenhuma API key encontrada em digiletras/.env' }));
        return;
      }

      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Resposta sem JSON válido');
      const parsed = JSON.parse(match[0]);

      res.writeHead(200);
      res.end(JSON.stringify(parsed));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message ?? 'Erro interno' }));
    }
  });
});

server.listen(3001, () => {
  const provider = (ENV.AI_PROVIDER ?? 'groq').toUpperCase();
  console.log(`\n🚀 Dev API server rodando em http://localhost:3001`);
  console.log(`   Provedor: ${provider}`);
  console.log(`   Groq key: ${ENV.GROQ_API_KEY ? '✅ configurada' : '❌ não encontrada'}`);
  console.log(`   Anthropic key: ${ENV.ANTHROPIC_API_KEY ? '✅ configurada' : '❌ não encontrada'}`);
  console.log(`\n   Deixe este terminal aberto e use "npm run dev" no digiletras/ em outro terminal.\n`);
});
