import fs from 'fs';

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CpfValidator Pro • Super Validador Anycast & SINTEGRA • Ponte API Market</title>
  <meta name="description" content="Super Validador de Borda Anycast (<2ms): Validação de CPF Módulo 11 da Receita Federal, Inscrição Estadual das 27 UFs (SINTEGRA/CONFAZ) e Inspeção Forense de IP." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css?v=3.2.0" />
  <script>
    (function() {
      const savedTheme = localStorage.getItem('ponte.theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', savedTheme);
    })();
  </script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    svg.lucide, .lucide {
      width: 18px !important;
      height: 18px !important;
      stroke-width: 2 !important;
      display: inline-block;
      vertical-align: middle;
    }
    .nav-link svg, .nav-link .lucide {
      width: 18px !important;
      height: 18px !important;
    }
    .brand-mark svg {
      width: 22px !important;
      height: 22px !important;
    }
    .playground-split {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
      gap: 26px;
      margin-top: 24px;
    }
    @media (max-width: 1100px) {
      .playground-split { grid-template-columns: 1fr; }
    }
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .specs-table tr {
      border-bottom: 1px solid var(--line-light);
    }
    .specs-table td {
      padding: 12px 16px;
      vertical-align: middle;
    }
    .specs-table td.label-col {
      color: var(--muted);
      font-weight: 600;
      width: 40%;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .specs-table td.val-col {
      color: var(--ink);
      font-weight: 700;
      text-align: right;
    }
    .tab-nav-bar {
      display: flex;
      gap: 8px;
      background: var(--paper-elevated, #f1f5f2);
      padding: 6px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--line);
      margin-bottom: 24px;
      overflow-x: auto;
    }
    :root[data-theme="dark"] .tab-nav-bar {
      background: #0d1527;
      border-color: #1e293b;
    }
    .tab-nav-btn {
      flex: 1;
      min-height: 40px;
      padding: 0 18px;
      border: none;
      background: transparent;
      border-radius: var(--radius-md);
      font-size: 12.5px;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      white-space: nowrap;
      transition: all 0.16s ease;
    }
    .tab-nav-btn:hover {
      color: var(--ink);
      background: rgba(255, 255, 255, 0.05);
    }
    .tab-nav-btn.is-active {
      background: var(--paper);
      color: var(--ink);
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    :root[data-theme="dark"] .tab-nav-btn.is-active {
      background: #1e293b;
      color: #fff;
    }
    .status-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 11px;
      border-radius: var(--radius-full);
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .status-badge-pill.green {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .status-badge-pill.red {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .status-badge-pill.blue {
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .terminal-window {
      background: #091311;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
    }
    .terminal-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .terminal-dots {
      display: flex;
      gap: 7px;
    }
    .terminal-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
    }
    .terminal-dot.red { background: #ef4444; }
    .terminal-dot.yellow { background: #f59e0b; }
    .terminal-dot.green { background: #10b981; }
    .card-dashboard {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--radius-xl);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <!-- Sidebar Oficial do Ecossistema Ponte / OZPro -->
    <aside class="sidebar" aria-label="Navegação principal">
      <a class="brand" href="#cpf" aria-label="Ponte API, CpfValidator Pro">
        <img src="brand/ozpro-mark.svg" alt="Ponte API Logo" style="width:38px;height:38px;border-radius:10px;object-fit:contain;background:var(--mint);padding:4px;box-shadow:0 4px 12px rgba(163,230,53,0.35);" />
        <span><strong>ponte</strong><small>CPFVALIDATOR · OZPRO</small></span>
      </a>

      <nav class="primary-nav" id="primary-nav">
        <div class="nav-section-label">FUNCIONALIDADES</div>
        <button class="nav-link is-active" data-view="cpf">
          <i data-lucide="shield-check"></i> <span>Validador de CPF</span>
        </button>
        <button class="nav-link" data-view="ie">
          <i data-lucide="file-check"></i> <span>Inscrição Estadual (27 UFs)</span>
        </button>
        <button class="nav-link" data-view="inspector">
          <i data-lucide="cpu"></i> <span>ClientInspector (IP & WebGL)</span>
        </button>
        <button class="nav-link" data-view="docs">
          <i data-lucide="book-open"></i> <span>Documentação REST</span>
        </button>

        <div class="nav-section-label">ECOSSISTEMA PONTE</div>
        <a class="nav-link" href="https://ponte-marketplace.maputo2.workers.dev" target="_blank" rel="noopener">
          <i data-lucide="layout-grid"></i> <span>API Marketplace</span>
          <span class="nav-ext"><i data-lucide="arrow-up-right"></i></span>
        </a>
        <a class="nav-link" href="https://github.com/clepta2/cpfvalidator-pro" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
          <span>GitHub do Projeto</span>
          <span class="nav-ext"><i data-lucide="arrow-up-right"></i></span>
        </a>
      </nav>

      <div class="sidebar-bottom">
        <div class="status-row">
          <span class="status-dot connected"></span>
          <span>Cloudflare Edge · &lt;2ms</span>
        </div>
        <div class="profile-row">
          <div class="avatar lg">CV</div>
          <div class="profile-copy">
            <strong>CpfValidator Pro</strong>
            <span>Super Validador Anycast</span>
          </div>
        </div>
        <div class="sidebar-version">v1.2.0 · Módulo 11 · SINTEGRA 27 UFs</div>
      </div>
    </aside>

    <!-- Área Principal -->
    <main class="main-area">
      <!-- Topbar Oficial -->
      <header class="topbar">
        <div class="breadcrumb">
          <span>Workspace</span>
          <i data-lucide="chevron-right"></i>
          <span>Validação & Segurança</span>
          <i data-lucide="chevron-right"></i>
          <strong id="breadcrumb-title">Validador de CPF</strong>
        </div>
        <div class="topbar-actions">
          <span class="environment">
            <span class="status-dot connected"></span>
            Cloudflare Anycast Global (330+ Cidades)
          </span>
          <button class="icon-button theme-toggle-btn" id="theme-toggle-btn" aria-label="Alternar tema" title="Alternar tema claro/escuro">
            <i data-lucide="moon"></i>
          </button>
          <a href="https://ponte-marketplace.maputo2.workers.dev" target="_blank" rel="noopener" class="primary-button accent" style="text-decoration:none;display:inline-flex;align-items:center;gap:7px;font-size:12.5px;padding:0 16px;height:36px;">
            <i data-lucide="sparkles"></i> <span>Catálogo Completo</span>
          </a>
        </div>
      </header>

      <!-- Conteúdo da Página -->
      <div class="content-wrap">
        <div class="page-heading">
          <div>
            <p class="eyebrow">SUPER VALIDADOR DETERMINÍSTICO DE BORDA</p>
            <h1>CpfValidator Pro • Console Oficial Anycast</h1>
            <p class="page-subtitle">
              Validação matemática de CPF (Módulo 11 da Receita Federal com dedução de Região Fiscal), Inscrição Estadual das 27 UFs (SINTEGRA/CONFAZ) e inspeção forense de IP/User-Agent em menos de 2ms.
            </p>
          </div>
        </div>

        <!-- Cards de Métricas -->
        <div class="billing-models-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin-bottom: 26px;">
          <div class="model-card credit-card" style="padding:18px 22px;">
            <div class="model-card-header" style="margin-bottom:10px;">
              <span class="model-badge credit"><i data-lucide="shield-check"></i> MÓDULO 11 RFB</span>
            </div>
            <div style="font-size:20px;font-weight:800;color:var(--ink);margin-bottom:4px;">Receita Federal</div>
            <p style="font-size:12.5px;color:var(--muted);margin:0;line-height:1.45;">Cálculo dos dois dígitos verificadores com pesos 10 e 11 e rejeição de repetidos.</p>
          </div>

          <div class="model-card subscription-card" style="padding:18px 22px;">
            <div class="model-card-header" style="margin-bottom:10px;">
              <span class="model-badge sub"><i data-lucide="file-check"></i> 27 UFS SINTEGRA</span>
            </div>
            <div style="font-size:20px;font-weight:800;color:var(--ink);margin-bottom:4px;">Inscrição Estadual</div>
            <p style="font-size:12.5px;color:var(--muted);margin:0;line-height:1.45;">Algoritmos oficiais das SEFAZ estaduais (Módulos 10, 11 e regras específicas).</p>
          </div>

          <div class="model-card tier-card" style="padding:18px 22px;">
            <div class="model-card-header" style="margin-bottom:10px;">
              <span class="model-badge tier"><i data-lucide="zap"></i> SUB-2MS ANYCAST</span>
            </div>
            <div style="font-size:20px;font-weight:800;color:var(--ink);margin-bottom:4px;">Zero Latência</div>
            <p style="font-size:12.5px;color:var(--muted);margin:0;line-height:1.45;">Validação determinística pura sem dependência externa, executada na memória RAM.</p>
          </div>
        </div>

        <!-- Abas -->
        <div class="tab-nav-bar">
          <button class="tab-nav-btn is-active" data-tab="cpf">
            <i data-lucide="shield-check"></i> <span>Validador & Gerador de CPF</span>
          </button>
          <button class="tab-nav-btn" data-tab="ie">
            <i data-lucide="file-check"></i> <span>Inscrição Estadual (SINTEGRA 27 UFs)</span>
          </button>
        </div>

        <!-- Playground Split-Screen de 2 Colunas -->
        <div class="playground-split">
          <!-- Coluna 1: Formulário e Painel Visual -->
          <div class="playground-left">
            <!-- TAB 1: CPF -->
            <div id="section-cpf" class="tab-pane">
              <div class="card-dashboard">
                <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
                  <span style="display:flex;align-items:center;gap:8px;">
                    <i data-lucide="search" style="color:var(--blue);"></i>
                    <span>Validar ou Gerar CPF Homologado</span>
                  </span>
                  <span class="status-badge-pill green">Módulo 11 Ativo</span>
                </div>
                <p style="font-size:12.5px;color:var(--muted);margin-bottom:16px;line-height:1.5;">
                  Digite um CPF para validar a integridade dos dígitos verificadores ou gere um CPF válido para testes:
                </p>

                <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
                  <input type="text" id="cpf-input" value="529.982.247-25" placeholder="529.982.247-25..." maxlength="14" style="flex:2;min-width:200px;height:44px;padding:0 14px;border:1px solid var(--line);border-radius:var(--radius-md);font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--ink);background:var(--paper);outline:none;" />
                  <button id="btn-exec-cpf" class="primary-button accent" style="height:44px;padding:0 18px;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:7px;">
                    <i data-lucide="check"></i> <span>Validar CPF</span>
                  </button>
                  <button id="btn-gerar-cpf" class="secondary-button" style="height:44px;padding:0 16px;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;gap:7px;">
                    <i data-lucide="sparkles"></i> <span>Gerar Válido</span>
                  </button>
                </div>

                <div style="border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;background:var(--paper);margin-top:16px;">
                  <div style="padding:12px 16px;background:var(--paper-elevated,#f8fafc);border-bottom:1px solid var(--line);font-size:13px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:7px;">
                    <i data-lucide="clipboard-list"></i>
                    <span>Laudo de Validação da Receita Federal</span>
                  </div>
                  <table class="specs-table">
                    <tbody>
                      <tr>
                        <td class="label-col">Status Matemático</td>
                        <td class="val-col" id="val-cpf-status"><span class="status-badge-pill green">VÁLIDO</span></td>
                      </tr>
                      <tr>
                        <td class="label-col">CPF Formatado</td>
                        <td class="val-col" id="val-cpf-formatado" style="font-family:'JetBrains Mono',monospace;">529.982.247-25</td>
                      </tr>
                      <tr>
                        <td class="label-col">Região Fiscal (RFB)</td>
                        <td class="val-col" id="val-cpf-regiao">8ª Região Fiscal (São Paulo)</td>
                      </tr>
                      <tr>
                        <td class="label-col">Dígitos Verificadores</td>
                        <td class="val-col" id="val-cpf-dvs" style="font-family:'JetBrains Mono',monospace;">25 (Calculados com Sucesso)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- TAB 2: INSCRIÇÃO ESTADUAL -->
            <div id="section-ie" class="tab-pane" style="display:none;">
              <div class="card-dashboard">
                <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
                  <span style="display:flex;align-items:center;gap:8px;">
                    <i data-lucide="file-check" style="color:var(--blue);"></i>
                    <span>Validador de Inscrição Estadual (SINTEGRA / CONFAZ)</span>
                  </span>
                  <span class="status-badge-pill blue">27 UFs Oficiais</span>
                </div>
                <p style="font-size:12.5px;color:var(--muted);margin-bottom:16px;line-height:1.5;">
                  Validação com os pesos, módulos e regras fiscais específicas de cada um dos 26 Estados e Distrito Federal:
                </p>

                <div style="display:grid;grid-template-columns:1fr 2fr;gap:12px;margin-bottom:14px;">
                  <div>
                    <label style="display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:6px;">Estado (UF)</label>
                    <select id="ie-uf" style="width:100%;height:44px;padding:0 12px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--paper);color:var(--ink);outline:none;font-weight:700;">
                      <option value="SP" selected>SP - São Paulo</option>
                      <option value="RJ">RJ - Rio de Janeiro</option>
                      <option value="MG">MG - Minas Gerais</option>
                      <option value="PR">PR - Paraná</option>
                      <option value="RS">RS - Rio Grande do Sul</option>
                      <option value="SC">SC - Santa Catarina</option>
                      <option value="BA">BA - Bahia</option>
                      <option value="GO">GO - Goiás</option>
                      <option value="PE">PE - Pernambuco</option>
                      <option value="CE">CE - Ceará</option>
                      <option value="DF">DF - Distrito Federal</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:6px;">Inscrição Estadual</label>
                    <input type="text" id="ie-input" value="110.042.490.114" style="width:100%;height:44px;padding:0 14px;border:1px solid var(--line);border-radius:var(--radius-md);font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--ink);background:var(--paper);outline:none;" />
                  </div>
                </div>

                <button id="btn-exec-ie" class="primary-button accent" style="width:100%;height:44px;font-size:13px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:7px;">
                  <i data-lucide="check"></i> <span>Validar Inscrição Estadual</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Terminal Console Dark Oficial da Ponte API -->
          <div class="playground-right">
            <div class="terminal-window">
              <div class="terminal-topbar">
                <div class="terminal-dots">
                  <div class="terminal-dot red"></div>
                  <div class="terminal-dot yellow"></div>
                  <div class="terminal-dot green"></div>
                </div>
                <div class="snippet-lang-tabs" role="tablist">
                  <button class="snippet-tab is-active" data-lang="curl">cURL</button>
                  <button class="snippet-tab" data-lang="nodejs">Node.js</button>
                  <button class="snippet-tab" data-lang="python">Python</button>
                  <button class="snippet-tab" data-lang="php">PHP</button>
                </div>
                <button class="icon-button copy-mini" id="btn-copy-code" title="Copiar Snippet">
                  <i data-lucide="copy" style="width:14px;height:14px;"></i>
                </button>
              </div>

              <!-- Caixa de Código do Snippet -->
              <div class="snippet-code-box" style="padding:14px 18px;background:rgba(0,0,0,0.30);border-bottom:1px solid rgba(255,255,255,0.06);">
                <pre class="snippet-pre" style="margin:0;font-family:'JetBrains Mono',monospace;font-size:12px;color:#7dd3fc;line-height:1.5;overflow-x:auto;"><code id="snippet-code">curl -s "https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=52998224725" \
  -H "Authorization: ******" \
  -H "x-api-key: cpf_live_sec_2026"</code></pre>
              </div>

              <!-- Barra de Execução Sandbox -->
              <div class="playground-bar">
                <span class="method-tag get">GET</span>
                <code class="endpoint-code" id="endpoint-display" style="font-size:12px;">/api/validar-cpf?cpf=52998224725</code>
                <button class="primary-button accent test-btn" id="btn-run-sandbox" style="white-space:nowrap;padding:0 14px;height:32px;">
                  <i data-lucide="play"></i> <span>Executar</span>
                </button>
              </div>

              <!-- Console de Resposta JSON -->
              <div class="playground-console" style="min-height:300px;max-height:540px;overflow-y:auto;padding:16px;">
                <div class="console-response-header" id="console-header" style="font-size:11.5px;margin-bottom:10px;">
                  <span class="badge-200" id="console-status">200 OK</span>
                  <span id="console-latency">Latência: 1.1ms</span>
                  <span>Cloudflare Anycast</span>
                </div>
                <pre class="console-json" id="console-output" style="margin:0;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#f8fafc;line-height:1.5;"></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Script da Aplicação e Integração -->
  <script type="module">
    // Tema Claro / Escuro
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ponte.theme', next);
        renderLucide();
      });
    }

    function renderLucide() {
      if (window.lucide) window.lucide.createIcons();
    }

    // Navegação de Abas
    const tabBtns = document.querySelectorAll('.tab-nav-btn, .primary-nav .nav-link[data-view]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.tab || btn.dataset.view;
        if (!tabKey) return;
        document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.toggle('is-active', b.dataset.tab === tabKey));
        document.querySelectorAll('.primary-nav .nav-link[data-view]').forEach(b => b.classList.toggle('is-active', b.dataset.view === tabKey));
        document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
        const target = document.getElementById('section-' + tabKey);
        if (target) target.style.display = 'block';

        const bread = document.getElementById('breadcrumb-title');
        const titles = {
          cpf: 'Validador de CPF',
          ie: 'Inscrição Estadual (SINTEGRA 27 UFs)',
          docs: 'Documentação REST'
        };
        if (bread && titles[tabKey]) bread.textContent = titles[tabKey];
        updateSnippet();
        renderLucide();
      });
    });

    let currentSnippetLang = 'curl';
    document.querySelectorAll('.snippet-tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.snippet-tab').forEach(b => b.classList.remove('is-active'));
        t.classList.add('is-active');
        currentSnippetLang = t.dataset.lang;
        updateSnippet();
      });
    });

    function getActiveTab() {
      const active = document.querySelector('.tab-nav-btn.is-active');
      return active ? active.dataset.tab : 'cpf';
    }

    function getEndpointInfo() {
      const tab = getActiveTab();
      if (tab === 'ie') {
        const uf = document.getElementById('ie-uf').value;
        const ie = document.getElementById('ie-input').value.replace(/\\D/g, '');
        return { ep: \`/api/validar-ie?ie=\${ie}&uf=\${uf}\`, full: \`https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-ie?ie=\${ie}&uf=\${uf}\` };
      }
      const cpf = document.getElementById('cpf-input').value.replace(/\\D/g, '');
      return { ep: \`/api/validar-cpf?cpf=\${cpf}\`, full: \`https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=\${cpf}\` };
    }

    function updateSnippet() {
      const info = getEndpointInfo();
      document.getElementById('endpoint-display').textContent = info.ep;
      const codeEl = document.getElementById('snippet-code');

      if (currentSnippetLang === 'curl') {
        codeEl.textContent = \`curl -s "\${info.full}" \\\n  -H "Authorization: ******" \\\n  -H "x-api-key: cpf_live_sec_2026"\`;
      } else if (currentSnippetLang === 'nodejs') {
        codeEl.textContent = \`const res = await fetch("\${info.full}", {\n  headers: { "Authorization": "******", "x-api-key": "cpf_live_sec_2026" }\n});\nconst data = await res.json();\nconsole.log(data);\`;
      } else if (currentSnippetLang === 'python') {
        codeEl.textContent = \`import requests\nres = requests.get("\${info.full}", headers={"Authorization": "******", "x-api-key": "cpf_live_sec_2026"})\nprint(res.json())\`;
      } else if (currentSnippetLang === 'php') {
        codeEl.textContent = \`$ch = curl_init("\${info.full}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: ******", "x-api-key: cpf_live_sec_2026"]);\n$res = curl_exec($ch);\nprint_r(json_decode($res, true));\`;
      }
    }

    document.getElementById('btn-copy-code').addEventListener('click', () => {
      const txt = document.getElementById('snippet-code').textContent;
      navigator.clipboard.writeText(txt).then(() => alert('Snippet copiado com sucesso!'));
    });

    // ── LÓGICA DE VALIDAÇÃO DE CPF ──
    async function executarValidacaoCpf() {
      const raw = document.getElementById('cpf-input').value;
      const clean = raw.replace(/\\D/g, '');
      updateSnippet();

      const consoleOutput = document.getElementById('console-output');
      const consoleStatus = document.getElementById('console-status');
      const consoleLat = document.getElementById('console-latency');
      consoleOutput.textContent = 'Validando CPF com algoritmo Módulo 11 da Receita Federal...';

      const t0 = performance.now();
      try {
        const res = await fetch(\`https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=\${clean}\`);
        const data = await res.json();
        const lat = Math.round(performance.now() - t0);

        consoleStatus.textContent = res.ok ? '200 OK' : '422 INVÁLIDO';
        consoleStatus.className = res.ok ? 'badge-200' : 'badge-500';
        consoleLat.textContent = \`Latência: \${lat}ms\`;
        consoleOutput.textContent = JSON.stringify(data, null, 2);

        if (data.valido) {
          document.getElementById('val-cpf-status').innerHTML = '<span class="status-badge-pill green">VÁLIDO</span>';
          document.getElementById('val-cpf-formatado').textContent = data.cpfFormatado || clean;
          document.getElementById('val-cpf-regiao').textContent = data.regiaoFiscal ? data.regiaoFiscal.descricao : 'Não identificada';
          document.getElementById('val-cpf-dvs').textContent = \`\${clean.slice(-2)} (Cálculo Módulo 11 OK)\`;
        } else {
          document.getElementById('val-cpf-status').innerHTML = '<span class="status-badge-pill red">INVÁLIDO</span>';
          document.getElementById('val-cpf-formatado').textContent = clean;
          document.getElementById('val-cpf-regiao').textContent = '-';
          document.getElementById('val-cpf-dvs').textContent = data.motivo || 'Dígitos verificadores incompatíveis';
        }
      } catch (err) {
        consoleOutput.textContent = \`Erro: \${err.message}\`;
      }
    }

    document.getElementById('btn-exec-cpf').addEventListener('click', executarValidacaoCpf);
    document.getElementById('cpf-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executarValidacaoCpf();
    });

    document.getElementById('btn-gerar-cpf').addEventListener('click', async () => {
      const res = await fetch('https://cpfvalidator-pro-api.maputo2.workers.dev/api/gerar-cpf');
      const data = await res.json();
      if (data.cpf) {
        document.getElementById('cpf-input').value = data.cpf;
        executarValidacaoCpf();
      }
    });

    // ── LÓGICA DE VALIDAÇÃO DE IE ──
    async function executarValidacaoIe() {
      const uf = document.getElementById('ie-uf').value;
      const raw = document.getElementById('ie-input').value;
      const clean = raw.replace(/\\D/g, '');
      updateSnippet();

      const consoleOutput = document.getElementById('console-output');
      const consoleStatus = document.getElementById('console-status');
      const consoleLat = document.getElementById('console-latency');
      consoleOutput.textContent = \`Validando Inscrição Estadual para \${uf}...\`;

      const t0 = performance.now();
      try {
        const res = await fetch(\`https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-ie?ie=\${clean}&uf=\${uf}\`);
        const data = await res.json();
        const lat = Math.round(performance.now() - t0);

        consoleStatus.textContent = res.ok ? '200 OK' : '422 INVÁLIDO';
        consoleStatus.className = res.ok ? 'badge-200' : 'badge-500';
        consoleLat.textContent = \`Latência: \${lat}ms\`;
        consoleOutput.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        consoleOutput.textContent = \`Erro: \${err.message}\`;
      }
    }

    document.getElementById('btn-exec-ie').addEventListener('click', executarValidacaoIe);

    document.getElementById('btn-run-sandbox').addEventListener('click', () => {
      const tab = getActiveTab();
      if (tab === 'ie') executarValidacaoIe();
      else executarValidacaoCpf();
    });

    // Inicialização
    renderLucide();
    setTimeout(() => {
      renderLucide();
      executarValidacaoCpf();
    }, 100);
  </script>
</body>
</html>
`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('cpfvalidator-pro index.html updated with marketplace design system!');
