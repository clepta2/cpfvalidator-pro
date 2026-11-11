/**
 * CpfValidator Pro — Cloudflare Edge API Gateway
 *
 * Responsável por:
 * 1. Validação matemática do Módulo 11 da Receita Federal na borda Anycast (<5ms)
 * 2. Dedução instantânea de Regiões Fiscais e Estados (UF)
 * 3. Playground e Demonstração Interativa
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    // 1. Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Healthcheck
    if (path === '/health' || path === '/status') {
      return new Response(JSON.stringify({
        ok: true,
        service: 'CpfValidator Pro — Cloudflare Edge API Gateway',
        status: 'operational',
        version: env.API_VERSION || '1.0.0',
        latency: 'edge-sub-5ms',
        algoritmo: 'Módulo 11 (RFC Receita Federal)',
        edgeLocation: request.cf ? request.cf.colo : 'Edge',
        docs: 'https://github.com/clepta2/cpfvalidator-pro',
        marketplace: env.MARKETPLACE_URL || 'https://ponte.ozpro.com.br'
      }, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...CORS_HEADERS
        }
      });
    }

    // 3. Validação de CPF (/api/validar-cpf, /api/cpf/validar, /api/cpf/:numero)
    if (path === '/api/validar-cpf' || path === '/api/cpf/validar' || path === '/validar' || path.startsWith('/api/cpf/')) {
      let cpfInput = null;

      if (request.method === 'GET') {
        cpfInput = url.searchParams.get('cpf') || url.searchParams.get('numero') || url.searchParams.get('q');
        if (!cpfInput && path.startsWith('/api/cpf/')) {
          const parts = path.split('/').filter(Boolean);
          cpfInput = parts[parts.length - 1];
        }
      } else if (request.method === 'POST') {
        try {
          const body = await request.json();
          cpfInput = body.cpf || body.numero || body.documento;
        } catch (_) {
          return new Response(JSON.stringify({ ok: false, error: 'JSON inválido no corpo da requisição.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
          });
        }
      }

      if (!cpfInput) {
        return new Response(JSON.stringify({
          ok: false,
          error: 'Parâmetro CPF não informado. Use: GET /api/validar-cpf?cpf=123.456.789-00 ou POST com {"cpf": "..."}'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
        });
      }

      const res = CpfValidatorPro.validarLocal(cpfInput);

      return new Response(JSON.stringify({
        ok: true,
        ...res,
        timestamp: new Date().toISOString()
      }, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...CORS_HEADERS,
          'Cache-Control': res.valido ? 'public, max-age=604800, s-maxage=604800' : 'no-cache'
        }
      });
    }

    // 4. Gerador de CPF válido para testes (/api/gerar)
    if (path === '/api/gerar' || path === '/gerar') {
      const uf = url.searchParams.get('uf') || url.searchParams.get('regiao');
      const cpfGerado = CpfValidatorPro.gerarTeste(uf);
      const res = CpfValidatorPro.validarLocal(cpfGerado);

      return new Response(JSON.stringify({
        ok: true,
        cpf: cpfGerado,
        ...res,
        aviso: 'CPF gerado estritamente para testes matemáticos de software.'
      }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
      });
    }

    // 5. Landing / Playground (Root ou /demo)
    return new Response(getHtmlDemo(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

function getHtmlDemo() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CpfValidator Pro — API e SDK em Cloudflare Edge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card: #111827;
      --accent: #10b981;
      --accent-glow: rgba(16, 185, 129, 0.25);
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
    .container { max-width: 800px; width: 100%; }
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
    h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
    p.lead { color: var(--text-muted); font-size: 15px; margin-bottom: 28px; line-height: 1.6; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .input-group { display: flex; gap: 12px; margin-bottom: 16px; }
    input {
      flex: 1;
      background: #040711;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 16px;
      color: #fff;
      font-size: 16px;
      font-family: 'JetBrains Mono', monospace;
      outline: none;
      transition: all 0.2s;
    }
    input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
    button {
      background: var(--accent);
      color: #040711;
      font-weight: 700;
      font-size: 14px;
      padding: 0 24px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover { opacity: 0.9; transform: translateY(-1px); }
    .actions { display: flex; gap: 10px; margin-bottom: 20px; }
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      color: var(--text);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
    }
    .output-box {
      background: #040711;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #38bdf8;
      white-space: pre-wrap;
      word-break: break-all;
      min-height: 140px;
      line-height: 1.5;
    }
    footer { text-align: center; color: var(--text-muted); font-size: 13px; margin-top: auto; padding-top: 40px; }
    footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">⚡ Cloudflare Anycast Edge &bull; Latência sub-5ms</div>
    <h1>CpfValidator Pro — API & SDK</h1>
    <p class="lead">Validação algorítmica matemática (Módulo 11) com detecção instantânea da Região Fiscal da Receita Federal e sanitização.</p>

    <div class="card">
      <div class="input-group">
        <input type="text" id="cpfInput" placeholder="Digite o CPF (ex: 529.982.247-25)" value="529.982.247-25">
        <button onclick="validar()">Validar Agora</button>
      </div>
      <div class="actions">
        <button class="btn-secondary" onclick="gerarAleatorio()">🎲 Gerar CPF Válido para Teste</button>
        <button class="btn-secondary" onclick="testarInvalido()">❌ Testar CPF Repetido</button>
      </div>
      <div class="output-box" id="resultOutput">Aguardando validação...</div>
    </div>

    <footer>
      Parte oficial do <a href="https://ponte.ozpro.com.br" target="_blank">Ponte API Marketplace</a> &bull; Código aberto no <a href="https://github.com/clepta2/cpfvalidator-pro" target="_blank">GitHub</a>
    </footer>
  </div>

  <script>
    async function validar() {
      const val = document.getElementById('cpfInput').value;
      const out = document.getElementById('resultOutput');
      out.innerText = 'Processando na borda...';
      try {
        const res = await fetch('/api/validar-cpf?cpf=' + encodeURIComponent(val));
        const data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        out.innerText = 'Erro: ' + err.message;
      }
    }

    async function gerarAleatorio() {
      const res = await fetch('/api/gerar');
      const data = await res.json();
      document.getElementById('cpfInput').value = data.cpf;
      validar();
    }

    function testarInvalido() {
      document.getElementById('cpfInput').value = '111.111.111-11';
      validar();
    }

    window.onload = validar;
  </script>
</body>
</html>`;
}
