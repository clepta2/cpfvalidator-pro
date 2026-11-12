/**
 * worker.js
 * Cloudflare Worker Anycast para CpfValidator Pro API (maputo2.workers.dev)
 * Validação do Módulo 11 da Receita Federal, dedução de Região Fiscal e LGPD.
 *
 * Rate limiter local por isolate; não define cota diária global. Lotes reduzem chamadas.
 *
 * @license MIT
 * @see https://github.com/clepta2/cpfvalidator-pro
 */

import { CpfValidatorPro } from './cpfvalidator-pro.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Max-Age': '86400'
};

const ipBuckets = new Map();

function checkRateLimit(ipOrKey, limit = 60, windowMs = 60000) {
  const now = Date.now();
  let entry = ipBuckets.get(ipOrKey);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    ipBuckets.set(ipOrKey, entry);
    if (ipBuckets.size > 10000) {
      for (const [k, v] of ipBuckets) {
        if (now > v.resetAt) ipBuckets.delete(k);
      }
    }
    return { ok: true, remaining: limit - 1, resetAt: entry.resetAt };
  }
  entry.count++;
  if (entry.count > limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    const wantsJson = url.searchParams.get('format') === 'json' ||
      (request.headers.get('Accept') && request.headers.get('Accept').includes('application/json'));

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Blindagem HTTP (Apenas GET e POST)
    if (request.method !== 'GET' && request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Método não permitido.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
      });
    }

    let bodyJson = null;
    if (request.method === 'POST') {
      try {
        bodyJson = await request.json();
      } catch (_) {}
    }

    // 3. Autenticação & Rate Limiting
    const apiKey = request.headers.get('x-api-key') ||
                   request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
                   url.searchParams.get('api_key') ||
                   url.searchParams.get('key') || '';
    const isPro = String(apiKey).trim().length >= 16;
    const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-real-ip') || '127.0.0.1';
    const maxReqs = isPro ? 300 : 60;
    const rl = checkRateLimit(isPro ? apiKey : clientIp, maxReqs, 60000);

    if (!rl.ok && path !== '/health' && path !== '/status' && path !== '/' && path !== '/demo') {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Limite temporário de requisições excedido. Aguarde o período indicado em Retry-After.',
        retryAfterSeconds: Math.ceil((rl.resetAt - Date.now()) / 1000)
      }, null, 2), {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...CORS_HEADERS,
          'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))),
          'X-RateLimit-Limit': String(maxReqs),
          'X-RateLimit-Remaining': String(rl.remaining)
        }
      });
    }

    // 4. Healthcheck
    if (path === '/health' || path === '/status') {
      return new Response(JSON.stringify({
        ok: true,
        service: 'CpfValidator Pro API',
        version: env?.API_VERSION || '1.0.0',
        cluster: 'Cloudflare Edge Anycast (maputo2.workers.dev)',
        status: 'online',
        autenticado: isPro,
        algoritmo: 'Módulo 11 (RFC Receita Federal)',
        github: 'https://github.com/clepta2/cpfvalidator-pro'
      }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
      });
    }

    // 5. Landing Page / Interface Web
    if (path === '' || path === '/' || path === '/demo' || path === '/index.html') {
      if (wantsJson) {
        return new Response(JSON.stringify({
          ok: true,
          service: 'CpfValidator Pro API',
          cluster: 'Cloudflare Edge Anycast',
          rotas: {
            validar: 'GET /api/validar-cpf?cpf=... ou POST /api/validar-cpf',
            lote: 'POST /api/cpf/lote (até 100 CPFs Pro ou 10 gratuitos)'
          },
          github: 'https://github.com/clepta2/cpfvalidator-pro'
        }, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
        });
      }
      return new Response(getHtmlDemo(), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 6. Validação em Lote de CPFs (POST /api/cpf/lote ou /api/validar-cpf/lote)
    if (path === '/api/cpf/lote' || path === '/api/validar-cpf/lote' || path === '/api/cpf/validar-lote') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ ok: false, error: 'Use POST com um array "cpfs".' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
        });
      }

      const lista = bodyJson && Array.isArray(bodyJson.cpfs) ? bodyJson.cpfs : null;
      if (!lista || lista.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: 'Envie um array não vazio "cpfs" no corpo JSON.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
        });
      }

      const maxItems = isPro ? 100 : 10;
      if (lista.length > maxItems) {
        return new Response(JSON.stringify({
          ok: false,
          error: `O lote aceita até ${maxItems} CPFs por requisição neste plano.`,
          maxItems
        }), {
          status: 413,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
        });
      }

      const resultados = lista.map((item) => {
        const res = CpfValidatorPro.validarLocal(item);
        return {
          cpfInformado: String(item),
          ok: res.valido,
          ...res
        };
      });

      return new Response(JSON.stringify({
        ok: true,
        totalSolicitado: lista.length,
        totalValidos: resultados.filter((item) => item.valido).length,
        totalInvalidos: resultados.filter((item) => !item.valido).length,
        resultados
      }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
      });
    }

    // 7. Rota Principal de Validação de CPF (GET & POST)
    if (path === '/api/validar-cpf' || path === '/api/cpf/validar' || path === '/api/validar' || path.startsWith('/api/cpf/')) {
      let cpfInput = url.searchParams.get('cpf') || url.searchParams.get('valor') || '';

      if (!cpfInput && bodyJson) {
        cpfInput = bodyJson.cpf || bodyJson.valor || '';
      }

      if (!cpfInput && path.startsWith('/api/cpf/')) {
        cpfInput = path.replace('/api/cpf/', '').split('/')[0];
      }

      if (!cpfInput) {
        return new Response(JSON.stringify({
          ok: false,
          valido: false,
          error: 'Informe o CPF via parâmetro ?cpf=123.456.789-00 ou no corpo JSON {"cpf": "..."}'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
        });
      }

      const res = CpfValidatorPro.validarLocal(cpfInput);
      return new Response(JSON.stringify({
        ok: res.valido,
        ...res,
        plano: isPro ? 'Pro' : 'Gratuito (1 req/s)',
        edge: 'maputo2.workers.dev',
        audit: { timestamp: new Date().toISOString() }
      }, null, 2), {
        status: res.valido ? 200 : 422,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...CORS_HEADERS,
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Endpoint não encontrado. Use /api/validar-cpf' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
    });
  }
};

function getHtmlDemo() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CpfValidator Pro — API e SDK na Cloudflare Edge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card: #111827;
      --accent: #10b981;
      --text: #f9fafb;
      --text-muted: #94a3b8;
      --border: rgba(255,255,255,0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .container { max-width: 820px; width: 100%; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 99px;
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.3);
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    h1 { font-size: 30px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
    p.lead { color: var(--text-muted); font-size: 14.5px; margin-bottom: 24px; line-height: 1.6; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .input-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    input {
      flex: 1;
      min-width: 240px;
      background: #040711;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      color: #fff;
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
      outline: none;
    }
    input:focus { border-color: var(--accent); }
    button {
      background: var(--accent);
      color: #040711;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-size: 14px;
      cursor: pointer;
    }
    .output-box {
      background: #040711;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #38bdf8;
      max-height: 380px;
      overflow-y: auto;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    footer { color: var(--text-muted); font-size: 12.5px; margin-top: 20px; text-align: center; }
    footer a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">⚡ Módulo 11 Oficial &bull; Região Fiscal da Receita Federal</div>
    <h1>CpfValidator Pro — API Oficial</h1>
    <p class="lead">Validação matemática de CPF na borda Anycast com dedução automática do Estado e Região Fiscal emissora.</p>
    <div class="card">
      <div class="input-row">
        <input type="text" id="cpfInput" placeholder="ex: 529.982.247-25" value="529.982.247-25">
        <button onclick="validar()">Validar CPF</button>
      </div>
      <div class="output-box" id="resultOutput">Clique em "Validar CPF" para testar.</div>
    </div>
    <footer>
      Documentação Técnica &bull; <a href="https://github.com/clepta2/cpfvalidator-pro" target="_blank">GitHub (clepta2/cpfvalidator-pro)</a>
    </footer>
  </div>
  <script>
    async function validar() {
      const val = document.getElementById('cpfInput').value.trim();
      const out = document.getElementById('resultOutput');
      out.innerText = 'Validando Módulo 11 na borda...';
      try {
        const res = await fetch('/api/validar-cpf?cpf=' + encodeURIComponent(val));
        const data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
      } catch (e) {
        out.innerText = 'Erro: ' + e.message;
      }
    }
  </script>
</body>
</html>`;
}
