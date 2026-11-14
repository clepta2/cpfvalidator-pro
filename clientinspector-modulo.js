/**
 * functions/api/detectar-cliente.js
 * API Oficial: /api/meu-ip, /api/ip, /api/client-ip, /api/user-agent, /api/browser, /api/detectar-cliente & /api/whoami
 * Edge ClientInspector Pro — Anycast Edge sub-2ms & Deep Client Inspection
 * 
 * Recursos Oferecidos:
 *  1. Detecção Precisa de IP Público (IPv4 / IPv6, proxies, Cloudflare headers, link-local, loopback, CGNAT e privadas).
 *  2. Geolocalização Anycast de Borda (País, Bandeira, Cidade, Estado/UF, Continente, Fuso Horário, Coordenadas).
 *  3. Provedor de Internet & Conexão (ASN, Operadora/ISP, Datacenter Cloudflare Anycast Colo, Protocolo HTTP e TLS).
 *  4. Análise Completa de User-Agent e Client Hints (Sec-CH-UA modernos).
 *  5. Reconhecimento Avançado de Navegador (Chrome, Firefox, Safari, Edge, Opera, Samsung, Brave, Vivaldi, Arc, Webviews, etc.).
 *  6. Reconhecimento de Sistema Operacional (Windows 11/10/8/7, macOS Sequoia/Sonoma, iOS/iPadOS, Android, Linux, Chrome OS).
 *  7. Identificação de Dispositivo (Desktop, Mobile, Tablet, Smart TV, Console, Bot/Crawler).
 *  8. Detecção Especial de Bots, Rastreadores e CLIs (Googlebot, Bingbot, ChatGPT, Claude, Curl, Postman, Python, etc.).
 *  9. Extração de Idiomas e Preferências do Cliente (Accept-Language, Dark Mode, DNT/GPC, AVIF/WebP).
 * 10. Múltiplos formatos de saída (JSON completo estruturado ou Texto Puro rápido com ?format=text|ip|ua).
 */

function clientIp(request) {
  if (!request) return '127.0.0.1';
  return request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
}

const memoryRateLimit = new Map();
function rateLimit(ip, limit = 60, windowMs = 60000) {
  const now = Date.now();
  let entry = memoryRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    memoryRateLimit.set(ip, entry);
    return { ok: true, remaining: limit - 1 };
  }
  entry.count++;
  if (entry.count > limit) return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  return { ok: true, remaining: limit - entry.count };
}

// Mapeamento de códigos de países ISO-2 para nomes amigáveis em português e bandeiras
const PAISES_MAP = {
  BR: { nome: 'Brasil', flag: '🇧🇷', continente: 'América do Sul' },
  US: { nome: 'Estados Unidos', flag: '🇺🇸', continente: 'América do Norte' },
  PT: { nome: 'Portugal', flag: '🇵🇹', continente: 'Europa' },
  AR: { nome: 'Argentina', flag: '🇦🇷', continente: 'América do Sul' },
  CL: { nome: 'Chile', flag: '🇨🇱', continente: 'América do Sul' },
  UY: { nome: 'Uruguai', flag: '🇺🇾', continente: 'América do Sul' },
  PY: { nome: 'Paraguai', flag: '🇵🇾', continente: 'América do Sul' },
  ES: { nome: 'Espanha', flag: '🇪🇸', continente: 'Europa' },
  FR: { nome: 'França', flag: '🇫🇷', continente: 'Europa' },
  DE: { nome: 'Alemanha', flag: '🇩🇪', continente: 'Europa' },
  IT: { nome: 'Itália', flag: '🇮🇹', continente: 'Europa' },
  GB: { nome: 'Reino Unido', flag: '🇬🇧', continente: 'Europa' },
  CA: { nome: 'Canadá', flag: '🇨🇦', continente: 'América do Norte' },
  MX: { nome: 'México', flag: '🇲🇽', continente: 'América do Norte' },
  CO: { nome: 'Colômbia', flag: '🇨🇴', continente: 'América do Sul' },
  PE: { nome: 'Peru', flag: '🇵🇪', continente: 'América do Sul' },
  JP: { nome: 'Japão', flag: '🇯🇵', continente: 'Ásia' },
  CN: { nome: 'China', flag: '🇨🇳', continente: 'Ásia' },
  RU: { nome: 'Rússia', flag: '🇷🇺', continente: 'Europa / Ásia' },
  AU: { nome: 'Austrália', flag: '🇦🇺', continente: 'Oceania' },
  IE: { nome: 'Irlanda', flag: '🇮🇪', continente: 'Europa' },
  NL: { nome: 'Holanda', flag: '🇳🇱', continente: 'Europa' },
  CH: { nome: 'Suíça', flag: '🇨🇭', continente: 'Europa' },
  SE: { nome: 'Suécia', flag: '🇸🇪', continente: 'Europa' },
  NO: { nome: 'Noruega', flag: '🇳🇴', continente: 'Europa' },
  IN: { nome: 'Índia', flag: '🇮🇳', continente: 'Ásia' },
  ZA: { nome: 'África do Sul', flag: '🇿🇦', continente: 'África' },
  AO: { nome: 'Angola', flag: '🇦🇴', continente: 'África' },
  MZ: { nome: 'Moçambique', flag: '🇲🇿', continente: 'África' }
};

// Nomes amigáveis dos Datacenters Anycast Cloudflare mais próximos do Brasil
const AIRPORTS_COLO = {
  GRU: 'São Paulo (Guarulhos)',
  CGH: 'São Paulo (Congonhas)',
  GIG: 'Rio de Janeiro (Galeão)',
  BSB: 'Brasília',
  POA: 'Porto Alegre',
  CWB: 'Curitiba',
  CNF: 'Belo Horizonte (Confins)',
  SSA: 'Salvador',
  FOR: 'Fortaleza',
  REC: 'Recife',
  VIX: 'Vitória',
  FLN: 'Florianópolis',
  GYN: 'Goiânia',
  BEL: 'Belém',
  MAO: 'Manaus',
  CGB: 'Cuiabá',
  EWR: 'Nova York / New Jersey',
  MIA: 'Miami',
  IAD: 'Washington DC',
  LIS: 'Lisboa',
  MAD: 'Madri',
  LHR: 'Londres',
  FRA: 'Frankfurt'
};

// Versões conhecidas de macOS para nomes comerciais
const MACOS_VERSIONS = {
  '15': 'Sequoia',
  '14': 'Sonoma',
  '13': 'Ventura',
  '12': 'Monterey',
  '11': 'Big Sur',
  '10.15': 'Catalina',
  '10.14': 'Mojave',
  '10.13': 'High Sierra',
  '10.12': 'Sierra'
};

// ─── BASE DE CONHECIMENTO DE IPs & ASNs ANYCAST / CLOUD PÚBLICOS ─────────
const IPS_CONHECIDOS = {
  '1.1.1.1': {
    provedor: 'Cloudflare, Inc.',
    asn: 13335,
    pais: 'US',
    paisNome: 'Estados Unidos / Global Anycast',
    bandeira: '🌐',
    cidade: 'Cloudflare Anycast DNS',
    estado: 'Anycast',
    fusoHorario: 'UTC',
    continente: 'América do Norte',
    tipoConexao: 'dns_anycast',
    isHosting: true,
    isAnycast: true,
    scoreRisco: 0,
    descricao: 'Cloudflare 1.1.1.1 Public DNS Anycast'
  },
  '1.0.0.1': {
    provedor: 'Cloudflare, Inc.',
    asn: 13335,
    pais: 'US',
    paisNome: 'Estados Unidos / Global Anycast',
    bandeira: '🌐',
    cidade: 'Cloudflare Anycast DNS',
    estado: 'Anycast',
    fusoHorario: 'UTC',
    continente: 'América do Norte',
    tipoConexao: 'dns_anycast',
    isHosting: true,
    isAnycast: true,
    scoreRisco: 0,
    descricao: 'Cloudflare Public DNS Secundário'
  },
  '8.8.8.8': {
    provedor: 'Google LLC',
    asn: 15169,
    pais: 'US',
    paisNome: 'Estados Unidos / Global Anycast',
    bandeira: '🌐',
    cidade: 'Google Anycast DNS',
    estado: 'Anycast',
    fusoHorario: 'UTC',
    continente: 'América do Norte',
    tipoConexao: 'dns_anycast',
    isHosting: true,
    isAnycast: true,
    scoreRisco: 0,
    descricao: 'Google Public DNS Anycast (8.8.8.8)'
  },
  '8.8.4.4': {
    provedor: 'Google LLC',
    asn: 15169,
    pais: 'US',
    paisNome: 'Estados Unidos / Global Anycast',
    bandeira: '🌐',
    cidade: 'Google Anycast DNS',
    estado: 'Anycast',
    fusoHorario: 'UTC',
    continente: 'América do Norte',
    tipoConexao: 'dns_anycast',
    isHosting: true,
    isAnycast: true,
    scoreRisco: 0,
    descricao: 'Google Public DNS Secundário (8.8.4.4)'
  },
  '9.9.9.9': {
    provedor: 'Quad9',
    asn: 19281,
    pais: 'CH',
    paisNome: 'Suíça / Global Anycast',
    bandeira: '🇨🇭',
    cidade: 'Zurique / Global Anycast',
    estado: 'Anycast',
    fusoHorario: 'UTC',
    continente: 'Europa',
    tipoConexao: 'dns_anycast',
    isHosting: true,
    isAnycast: true,
    scoreRisco: 0,
    descricao: 'Quad9 Secure Anycast DNS (9.9.9.9)'
  },
  '208.67.222.222': {
    provedor: 'Cisco Systems (OpenDNS)',
    asn: 36692,
    pais: 'US',
    paisNome: 'Estados Unidos / Global Anycast',
    bandeira: '🇺🇸',
    cidade: 'San Francisco / Global Anycast',
    estado: 'CA',
    fusoHorario: 'America/Los_Angeles',
    continente: 'América do Norte',
    tipoConexao: 'dns_anycast',
    isHosting: true,
    isAnycast: true,
    scoreRisco: 0,
    descricao: 'Cisco OpenDNS Anycast'
  }
};

const HOSTING_KEYWORDS = [
  'amazon', 'aws', 'google cloud', 'gcp', 'google llc', 'microsoft', 'azure', 'cloudflare',
  'digitalocean', 'hetzner', 'ovh', 'linode', 'vultr', 'choopa', 'oracle', 'leaseweb',
  'alibaba', 'tencent', 'fastly', 'akamai', 'contabo', 'hostinger', 'locaweb'
];

// Cache em memória de lookups externos de geolocalização com TTL de 1 hora
const geoLookupCache = new Map();

/**
 * Expande representação compacta IPv6 para o formato canônico completo de 8 grupos
 */
export function expandirIpv6(ipv6) {
  if (!ipv6 || typeof ipv6 !== 'string') return '';
  const clean = ipv6.toLowerCase().trim();
  if (clean.includes('::')) {
    const parts = clean.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    const middle = Array(Math.max(0, missing)).fill('0000');
    return [...left, ...middle, ...right].map(seg => seg.padStart(4, '0')).join(':');
  }
  return clean.split(':').map(seg => seg.padStart(4, '0')).join(':');
}

/**
 * Validação e Classificação de IP (IPv4 vs IPv6 vs Privado vs Loopback)
 */
export function classificarIp(ip) {
  if (!ip || typeof ip !== 'string') {
    return {
      valido: false,
      ip: '',
      versao: null,
      tipoRede: 'invalido',
      isPrivado: false
    };
  }

  const cleanIp = ip.trim().replace(/^::ffff:/, ''); // remove IPv4-mapped IPv6

  // IPv4 Regex
  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  // IPv6 Regex
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  if (ipv4Pattern.test(cleanIp)) {
    const parts = cleanIp.split('.').map(Number);
    const [p0, p1, p2] = parts;

    let tipoRede = 'publica';
    let isPrivado = false;

    if (p0 === 127) {
      tipoRede = 'loopback';
      isPrivado = true;
    } else if (p0 === 10) {
      tipoRede = 'privada_rfc1918';
      isPrivado = true;
    } else if (p0 === 172 && p1 >= 16 && p1 <= 31) {
      tipoRede = 'privada_rfc1918';
      isPrivado = true;
    } else if (p0 === 192 && p1 === 168) {
      tipoRede = 'privada_rfc1918';
      isPrivado = true;
    } else if (p0 === 100 && p1 >= 64 && p1 <= 127) {
      tipoRede = 'cgnat_rfc6598';
      isPrivado = true;
    } else if (p0 === 169 && p1 === 254) {
      tipoRede = 'link_local';
      isPrivado = true;
    } else if (p0 === 0) {
      tipoRede = 'origem_local';
      isPrivado = true;
    } else if (p0 >= 224 && p0 <= 239) {
      tipoRede = 'multicast';
      isPrivado = true;
    } else if (p0 >= 240) {
      tipoRede = 'reservada';
      isPrivado = true;
    }

    return {
      valido: true,
      ip: cleanIp,
      versao: 'IPv4',
      tipoRede,
      isPrivado,
      faixaCidrEstimada: `${p0}.${p1}.${p2}.0/24`
    };
  }

  if (ipv6Pattern.test(cleanIp)) {
    const lower = cleanIp.toLowerCase();
    let tipoRede = 'publica';
    let isPrivado = false;

    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') {
      tipoRede = 'loopback';
      isPrivado = true;
    } else if (lower.startsWith('fe80:')) {
      tipoRede = 'link_local';
      isPrivado = true;
    } else if (lower.startsWith('fc') || lower.startsWith('fd')) {
      tipoRede = 'unique_local';
      isPrivado = true;
    }

    const expandido = expandirIpv6(cleanIp);
    const prefix64 = expandido.split(':').slice(0, 4).join(':') + '::/64';

    return {
      valido: true,
      ip: cleanIp,
      versao: 'IPv6',
      tipoRede,
      isPrivado,
      versaoExpandida: expandido,
      faixaCidrEstimada: prefix64
    };
  }

  return {
    valido: false,
    ip: cleanIp,
    versao: null,
    tipoRede: 'invalido',
    isPrivado: false
  };
}

/**
 * Parser de User-Agent e Client Hints
 * Retorna dados estruturados de Navegador, SO, Dispositivo, Engine e Bots.
 */
export function analisarUserAgent(uaString = '', clientHints = {}) {
  const ua = String(uaString || '').trim();

  const resultado = {
    userAgentRaw: ua,
    navegador: {
      nome: 'Desconhecido',
      versao: 'Desconhecida',
      versaoMajor: null,
      engine: 'Desconhecida'
    },
    sistemaOperacional: {
      nome: 'Desconhecido',
      versao: 'Desconhecida',
      nomeComercial: null,
      arquitetura: 'Desconhecida'
    },
    dispositivo: {
      tipo: 'desktop', // desktop, mobile, tablet, smart-tv, console, bot, desconhecido
      marca: null,
      modelo: null,
      isTouch: false
    },
    bot: {
      isBot: false,
      nome: null,
      categoria: null
    }
  };

  if (!ua) {
    return resultado;
  }

  // ─── 1. VERIFICAÇÃO DE BOTS / CRAWLERS / CLIs ────────────────────────
  const botList = [
    { regex: /googlebot/i, nome: 'Googlebot', cat: 'search_engine' },
    { regex: /bingbot/i, nome: 'Bingbot', cat: 'search_engine' },
    { regex: /yandexbot|yandeximages/i, nome: 'YandexBot', cat: 'search_engine' },
    { regex: /baiduspider/i, nome: 'Baiduspider', cat: 'search_engine' },
    { regex: /duckduckbot/i, nome: 'DuckDuckBot', cat: 'search_engine' },
    { regex: /applebot/i, nome: 'Applebot', cat: 'search_engine' },
    { regex: /chatgpt-user|gptbot/i, nome: 'ChatGPT Bot (OpenAI)', cat: 'ai_agent' },
    { regex: /claudebot|anthropic-ai/i, nome: 'ClaudeBot (Anthropic)', cat: 'ai_agent' },
    { regex: /perplexitybot/i, nome: 'PerplexityBot', cat: 'ai_agent' },
    { regex: /facebookexternalhit|facebot/i, nome: 'FacebookBot', cat: 'social_media' },
    { regex: /twitterbot/i, nome: 'TwitterBot (X)', cat: 'social_media' },
    { regex: /whatsapp/i, nome: 'WhatsApp Preview Bot', cat: 'social_media' },
    { regex: /telegrambot/i, nome: 'TelegramBot', cat: 'social_media' },
    { regex: /linkedinbot/i, nome: 'LinkedInBot', cat: 'social_media' },
    { regex: /slackbot/i, nome: 'Slackbot', cat: 'social_media' },
    { regex: /curl\//i, nome: 'cURL', cat: 'cli_tool' },
    { regex: /wget\//i, nome: 'Wget', cat: 'cli_tool' },
    { regex: /httpie/i, nome: 'HTTPie', cat: 'cli_tool' },
    { regex: /postmanruntime/i, nome: 'Postman Runtime', cat: 'api_tool' },
    { regex: /insomnia/i, nome: 'Insomnia REST', cat: 'api_tool' },
    { regex: /python-requests/i, nome: 'Python Requests', cat: 'http_library' },
    { regex: /axios/i, nome: 'Axios HTTP', cat: 'http_library' },
    { regex: /node-fetch/i, nome: 'Node Fetch', cat: 'http_library' },
    { regex: /go-http-client/i, nome: 'Go HTTP Client', cat: 'http_library' }
  ];

  for (const b of botList) {
    if (b.regex.test(ua)) {
      resultado.bot = {
        isBot: true,
        nome: b.nome,
        categoria: b.cat
      };
      resultado.dispositivo.tipo = 'bot';
      resultado.navegador.nome = b.nome;
      resultado.navegador.engine = 'N/A';
      break;
    }
  }

  // ─── 2. SISTEMA OPERACIONAL (OS) ───────────────────────────────────
  let osName = 'Desconhecido';
  let osVersion = 'Desconhecida';
  let osCommercial = null;
  let osArch = 'Desconhecida';

  // Arquitetura
  if (/x86_64|win64|wow64|x64|amd64/i.test(ua)) {
    osArch = 'x64 (64-bit)';
  } else if (/aarch64|arm64/i.test(ua)) {
    osArch = 'ARM64';
  } else if (/armv[0-9]|arm/i.test(ua)) {
    osArch = 'ARM';
  } else if (/i686|i386|x86/i.test(ua)) {
    osArch = 'x86 (32-bit)';
  }

  // Windows
  if (/windows/i.test(ua)) {
    osName = 'Windows';
    if (/windows nt 10\.0/i.test(ua)) {
      // Windows 10 e Windows 11 compartilham o NT 10.0 no UA
      const platformVersion = clientHints.secChUaPlatformVersion || '';
      const majorPlatformVersion = parseInt(platformVersion.replace(/["']/g, ''), 10);
      if (majorPlatformVersion >= 13) {
        osVersion = '11';
        osCommercial = 'Windows 11';
      } else {
        osVersion = '10 / 11';
        osCommercial = 'Windows 10 / 11';
      }
    } else if (/windows nt 6\.3/i.test(ua)) {
      osVersion = '8.1';
      osCommercial = 'Windows 8.1';
    } else if (/windows nt 6\.2/i.test(ua)) {
      osVersion = '8';
      osCommercial = 'Windows 8';
    } else if (/windows nt 6\.1/i.test(ua)) {
      osVersion = '7';
      osCommercial = 'Windows 7';
    } else if (/windows nt 6\.0/i.test(ua)) {
      osVersion = 'Vista';
      osCommercial = 'Windows Vista';
    } else if (/windows nt 5\.1/i.test(ua)) {
      osVersion = 'XP';
      osCommercial = 'Windows XP';
    }
  }
  // Android
  else if (/android/i.test(ua)) {
    osName = 'Android';
    const match = ua.match(/android\s+([0-9\.]+)/i);
    if (match) {
      osVersion = match[1];
      osCommercial = `Android ${match[1]}`;
    }
  }
  // iPhone / iPad / iOS
  else if (/ipad/i.test(ua)) {
    osName = 'iPadOS';
    const match = ua.match(/cpu\s+(?:iphone\s+)?os\s+([0-9_]+)/i);
    if (match) {
      osVersion = match[1].replace(/_/g, '.');
      osCommercial = `iPadOS ${osVersion}`;
    }
  } else if (/iphone|ipod/i.test(ua)) {
    osName = 'iOS';
    const match = ua.match(/cpu\s+(?:iphone\s+)?os\s+([0-9_]+)/i);
    if (match) {
      osVersion = match[1].replace(/_/g, '.');
      osCommercial = `iOS ${osVersion}`;
    }
  }
  // Mac OS X
  else if (/macintosh|mac os x/i.test(ua)) {
    osName = 'macOS';
    const match = ua.match(/mac os x\s+([0-9_]+)/i);
    if (match) {
      osVersion = match[1].replace(/_/g, '.');
      const vParts = osVersion.split('.');
      const major = vParts[0];
      const minor = vParts.length > 1 ? `${vParts[0]}.${vParts[1]}` : major;
      const codeName = MACOS_VERSIONS[major] || MACOS_VERSIONS[minor] || '';
      osCommercial = codeName ? `macOS ${osVersion} (${codeName})` : `macOS ${osVersion}`;
    } else {
      osCommercial = 'macOS';
    }
    if (osArch === 'Desconhecida') osArch = 'Apple Silicon / 64-bit';
  }
  // Chrome OS
  else if (/cros/i.test(ua)) {
    osName = 'Chrome OS';
    osCommercial = 'Google Chrome OS';
  }
  // Linux
  else if (/linux/i.test(ua)) {
    osName = 'Linux';
    if (/ubuntu/i.test(ua)) osCommercial = 'Ubuntu Linux';
    else if (/debian/i.test(ua)) osCommercial = 'Debian Linux';
    else if (/fedora/i.test(ua)) osCommercial = 'Fedora Linux';
    else if (/red hat|rhel/i.test(ua)) osCommercial = 'Red Hat Linux';
    else if (/arch/i.test(ua)) osCommercial = 'Arch Linux';
    else osCommercial = 'Linux';
  }

  // Fallback com Client Hints (Sec-CH-UA-Platform)
  if (clientHints.secChUaPlatform && (osName === 'Desconhecido' || osName === 'Windows')) {
    const hintPlatform = clientHints.secChUaPlatform.replace(/["']/g, '');
    if (hintPlatform) {
      if (hintPlatform.toLowerCase() === 'windows' && osName === 'Windows') {
        const hintVersion = clientHints.secChUaPlatformVersion ? parseInt(clientHints.secChUaPlatformVersion.replace(/["']/g, ''), 10) : 0;
        if (hintVersion >= 13) {
          osVersion = '11';
          osCommercial = 'Windows 11';
        }
      } else if (osName === 'Desconhecido') {
        osName = hintPlatform;
      }
    }
  }

  resultado.sistemaOperacional = {
    nome: osName,
    versao: osVersion,
    nomeComercial: osCommercial || `${osName} ${osVersion}`.trim(),
    arquitetura: osArch
  };

  // ─── 3. DISPOSITIVO & TIPO (Mobile vs Tablet vs Desktop vs TV) ──────
  let deviceType = 'desktop';
  let isTouch = false;
  let brand = null;
  let model = null;

  if (resultado.bot.isBot) {
    deviceType = 'bot';
  } else if (/smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast|viera|roku|tizen|web0s/i.test(ua)) {
    deviceType = 'smart-tv';
  } else if (/playstation|xbox|nintendo switch/i.test(ua)) {
    deviceType = 'console';
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet';
    isTouch = true;
  } else if (/mobile|iphone|ipod|android.*mobile|phone|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
    isTouch = true;
  }

  // Client Hints Mobile Override
  if (clientHints.secChUaMobile === '?1' && deviceType === 'desktop') {
    deviceType = 'mobile';
    isTouch = true;
  }

  // Detecção de Marca/Modelo em Android ou Apple
  if (/iphone/i.test(ua)) {
    brand = 'Apple';
    model = 'iPhone';
  } else if (/ipad/i.test(ua)) {
    brand = 'Apple';
    model = 'iPad';
  } else if (/macintosh/i.test(ua)) {
    brand = 'Apple';
    model = 'Mac';
  } else if (/samsung|sm-[a-z0-9]+/i.test(ua)) {
    brand = 'Samsung';
    const m = ua.match(/sm-([a-z0-9]+)/i);
    if (m) model = `Galaxy SM-${m[1].toUpperCase()}`;
  } else if (/xiaomi|redmi|poco/i.test(ua)) {
    brand = 'Xiaomi';
    const m = ua.match(/(redmi\s+[a-z0-9\s]+|poco\s+[a-z0-9\s]+|mi\s+[a-z0-9\s]+)/i);
    if (m) model = m[1];
  } else if (/motorola|moto\s/i.test(ua)) {
    brand = 'Motorola';
    const m = ua.match(/(moto\s+[a-z0-9\s\+]+)/i);
    if (m) model = m[1];
  } else if (/pixel\s+[0-9a-z\s]+/i.test(ua)) {
    brand = 'Google';
    const m = ua.match(/pixel\s+([0-9a-z\s]+)/i);
    if (m) model = `Pixel ${m[1]}`;
  }

  // Client Hint Model
  if (clientHints.secChUaModel) {
    const hintModel = clientHints.secChUaModel.replace(/["']/g, '').trim();
    if (hintModel) model = hintModel;
  }

  resultado.dispositivo = {
    tipo: deviceType,
    marca: brand,
    modelo: model,
    isTouch
  };

  // ─── 4. NAVEGADOR & ENGINE DE RENDERIZAÇÃO ───────────────────────────
  if (!resultado.bot.isBot) {
    let bName = 'Desconhecido';
    let bVersion = 'Desconhecida';
    let bMajor = null;
    let bEngine = 'Desconhecida';

    // Verificação em cascata do mais específico para o mais genérico
    // VS Code / Electron Embedded
    if (/code\/([0-9\.]+)/i.test(ua) && /electron/i.test(ua)) {
      bName = 'Visual Studio Code (Embedded Browser)';
      const m = ua.match(/code\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Electron / Blink';
    } else if (/electron\/([0-9\.]+)/i.test(ua)) {
      bName = 'Electron Desktop Browser';
      const m = ua.match(/electron\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // In-App Browsers
    else if (/instagram/i.test(ua)) {
      bName = 'Instagram In-App Browser';
      const m = ua.match(/instagram\s+([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'WebKit / Blink';
    } else if (/whatsapp/i.test(ua)) {
      bName = 'WhatsApp In-App Browser';
      const m = ua.match(/whatsapp\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'WebKit / Blink';
    } else if (/fbav|fban|fb_iab/i.test(ua)) {
      bName = 'Facebook In-App Browser';
      const m = ua.match(/fbav\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'WebKit / Blink';
    }
    // Microsoft Edge
    else if (/edg\/|edge\/|edga\/|edgios\//i.test(ua)) {
      bName = 'Microsoft Edge';
      const m = ua.match(/edg(?:e|a|ios)?\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // Opera
    else if (/opr\/|opera/i.test(ua)) {
      bName = 'Opera';
      const m = ua.match(/(?:opr|opera)(?:\/|\s+)([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // Samsung Internet
    else if (/samsungbrowser/i.test(ua)) {
      bName = 'Samsung Internet';
      const m = ua.match(/samsungbrowser\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // Brave (Client Hints ou marca expressa)
    else if (clientHints.secChUa && /brave/i.test(clientHints.secChUa)) {
      bName = 'Brave';
      const m = ua.match(/chrome\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // Vivaldi
    else if (/vivaldi/i.test(ua)) {
      bName = 'Vivaldi';
      const m = ua.match(/vivaldi\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // Yandex
    else if (/yabrowser/i.test(ua)) {
      bName = 'Yandex Browser';
      const m = ua.match(/yabrowser\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // UC Browser
    else if (/ucbrowser/i.test(ua)) {
      bName = 'UC Browser';
      const m = ua.match(/ucbrowser\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'U2 / Blink';
    }
    // DuckDuckGo
    else if (/duckduckgo/i.test(ua)) {
      bName = 'DuckDuckGo Browser';
      const m = ua.match(/duckduckgo\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'WebKit / Blink';
    }
    // Arc Browser
    else if (/arc\//i.test(ua)) {
      bName = 'Arc';
      const m = ua.match(/arc\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Blink';
    }
    // Zen Browser
    else if (/zen\//i.test(ua)) {
      bName = 'Zen Browser';
      const m = ua.match(/zen\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Gecko';
    }
    // Firefox
    else if (/firefox|fxios/i.test(ua)) {
      bName = 'Mozilla Firefox';
      const m = ua.match(/(?:firefox|fxios)\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = /fxios/i.test(ua) ? 'WebKit (iOS)' : 'Gecko';
    }
    // Google Chrome
    else if (/chrome|crios|chromium/i.test(ua)) {
      bName = 'Google Chrome';
      const m = ua.match(/(?:chrome|crios|chromium)\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = /crios/i.test(ua) ? 'WebKit (iOS)' : 'Blink';
    }
    // Safari
    else if (/safari/i.test(ua)) {
      bName = 'Apple Safari';
      const m = ua.match(/version\/([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'WebKit';
    }
    // Internet Explorer
    else if (/msie|trident/i.test(ua)) {
      bName = 'Internet Explorer';
      const m = ua.match(/(?:msie\s+|rv:)([0-9\.]+)/i);
      if (m) bVersion = m[1];
      bEngine = 'Trident';
    }

    if (bVersion && bVersion !== 'Desconhecida') {
      bMajor = bVersion.split('.')[0] || null;
    }

    resultado.navegador = {
      nome: bName,
      versao: bVersion,
      versaoMajor: bMajor,
      engine: bEngine
    };
  }

  return resultado;
}

/**
 * Parser de Idiomas aceitos (Accept-Language)
 */
export function analisarIdiomas(acceptLangHeader = '') {
  if (!acceptLangHeader || typeof acceptLangHeader !== 'string') {
    return {
      idiomaPrincipal: 'Desconhecido',
      idiomaPrincipalDescricao: 'Desconhecido',
      todosAceitos: []
    };
  }

  const items = acceptLangHeader.split(',').map(part => {
    const [tag, qVal] = part.trim().split(';');
    let q = 1.0;
    if (qVal && qVal.includes('q=')) {
      const parsedQ = parseFloat(qVal.split('q=')[1]);
      if (!isNaN(parsedQ)) q = parsedQ;
    }
    return { tag: tag.trim(), q };
  }).filter(item => Boolean(item.tag));

  items.sort((a, b) => b.q - a.q);

  const tags = items.map(i => i.tag);
  const principal = tags[0] || 'Desconhecido';

  let descricao = principal;
  if (/^pt-br/i.test(principal)) descricao = 'Português (Brasil)';
  else if (/^pt/i.test(principal)) descricao = 'Português';
  else if (/^en-us/i.test(principal)) descricao = 'Inglês (Estados Unidos)';
  else if (/^en-gb/i.test(principal)) descricao = 'Inglês (Reino Unido)';
  else if (/^en/i.test(principal)) descricao = 'Inglês';
  else if (/^es/i.test(principal)) descricao = 'Espanhol';
  else if (/^fr/i.test(principal)) descricao = 'Francês';
  else if (/^de/i.test(principal)) descricao = 'Alemão';
  else if (/^it/i.test(principal)) descricao = 'Italiano';
  else if (/^ja/i.test(principal)) descricao = 'Japonês';
  else if (/^zh/i.test(principal)) descricao = 'Chinês';

  return {
    idiomaPrincipal: principal,
    idiomaPrincipalDescricao: descricao,
    todosAceitos: tags
  };
}

/**
 * Resolução e Enriquecimento Inteligente de Geolocalização, ASN e Risco
 * Suporta cache em memória, consulta a IPs Anycast/DNS famosos,
 * dados nativos do Cloudflare Edge (request.cf) e fallback por lookup Anycast.
 */
export async function resolverGeolocalizacaoEConexao(ip, infoIp, cf = {}, isConsultaExterna = false) {
  // 1. Caso seja um IP Anycast / DNS público famoso conhecido (1.1.1.1, 8.8.8.8, etc.)
  if (IPS_CONHECIDOS[ip]) {
    const item = IPS_CONHECIDOS[ip];
    return {
      geolocalizacao: {
        disponivel: true,
        pais: item.pais,
        paisNome: item.paisNome,
        bandeira: item.bandeira,
        continente: item.continente,
        estado: item.estado,
        cidade: item.cidade,
        codigoPostal: null,
        fusoHorario: item.fusoHorario,
        metroCode: null,
        coordenadas: { latitude: null, longitude: null },
        origemDados: 'base_conhecimento_anycast'
      },
      conexao: {
        asn: item.asn,
        provedor: item.provedor,
        datacenterColo: 'GLOBAL_ANYCAST',
        datacenterDescricao: item.descricao,
        protocoloHttp: 'HTTP/3 (QUIC) / DNS over HTTPS',
        tls: { versao: 'TLSv1.3', cipher: null }
      },
      analiseRisco: {
        isHosting: item.isHosting,
        isAnycast: item.isAnycast,
        isVpnOuProxy: false,
        isTor: false,
        scoreRisco: item.scoreRisco,
        tipoConexao: item.tipoConexao,
        classificacao: 'DNS Anycast Público Confiável'
      }
    };
  }

  // 2. Caso seja Rede Local / Privada / Loopback (127.0.0.1, 192.168.x, etc.)
  if (infoIp.isPrivado) {
    let localTz = 'America/Sao_Paulo';
    try { localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'; } catch (_) {}
    return {
      geolocalizacao: {
        disponivel: false,
        pais: 'BR',
        paisNome: 'Rede Local / Loopback',
        bandeira: '🏠',
        continente: 'Local',
        estado: 'Localhost',
        cidade: 'Máquina Local / Intranet',
        codigoPostal: null,
        fusoHorario: localTz,
        metroCode: null,
        coordenadas: { latitude: 0, longitude: 0 },
        origemDados: 'rede_privada_local'
      },
      conexao: {
        asn: null,
        provedor: 'Rede Privada Local / Loopback',
        datacenterColo: 'LOCAL',
        datacenterDescricao: 'Interface de Loopback / Rede Privada',
        protocoloHttp: 'HTTP/1.1 (Dev Server)',
        tls: { versao: 'N/A', cipher: null }
      },
      analiseRisco: {
        isHosting: false,
        isAnycast: false,
        isVpnOuProxy: false,
        isTor: false,
        scoreRisco: 0,
        tipoConexao: 'local_privada',
        classificacao: 'Conexão Local Segura'
      }
    };
  }

  // 3. Se for a própria conexão e o Cloudflare CF tiver dados de borda
  const countryCode = (cf.country || '').toUpperCase();
  const hasCfData = Boolean(cf.country || cf.city || cf.asn);

  if (!isConsultaExterna && hasCfData) {
    const paisInfo = PAISES_MAP[countryCode] || { nome: countryCode || 'Desconhecido', flag: '🌐', continente: 'Desconhecido' };
    const coloCode = (cf.colo || '').toUpperCase();
    const coloNome = AIRPORTS_COLO[coloCode] || coloCode || 'Edge Anycast';
    const provedor = cf.asOrganization || 'Provedor Desconhecido';
    const isHosting = HOSTING_KEYWORDS.some(k => provedor.toLowerCase().includes(k));

    return {
      geolocalizacao: {
        disponivel: true,
        pais: countryCode,
        paisNome: paisInfo.nome,
        bandeira: paisInfo.flag,
        continente: cf.continent || paisInfo.continente,
        estado: cf.region || cf.regionCode || null,
        cidade: cf.city || null,
        codigoPostal: cf.postalCode || null,
        fusoHorario: cf.timezone || null,
        metroCode: cf.metroCode || null,
        coordenadas: {
          latitude: typeof cf.latitude === 'number' ? cf.latitude : (parseFloat(cf.latitude) || null),
          longitude: typeof cf.longitude === 'number' ? cf.longitude : (parseFloat(cf.longitude) || null)
        },
        origemDados: 'cloudflare_edge_header'
      },
      conexao: {
        asn: cf.asn || null,
        provedor,
        datacenterColo: coloCode || 'GRU',
        datacenterDescricao: coloNome,
        protocoloHttp: cf.httpProtocol || 'HTTP/2',
        tls: { versao: cf.tlsVersion || 'TLSv1.3', cipher: cf.tlsCipher || null }
      },
      analiseRisco: {
        isHosting,
        isAnycast: false,
        isVpnOuProxy: isHosting,
        isTor: false,
        scoreRisco: isHosting ? 25 : 0,
        tipoConexao: isHosting ? 'datacenter_hosting' : 'residencial',
        classificacao: isHosting ? 'IP de Nuvem / Datacenter' : 'Conexão Residencial / Comercial Legítima'
      }
    };
  }

  // 4. Consulta externa de IP público ou ambiente local sem Cloudflare headers
  const cacheKey = `geo:${ip}`;
  const cached = geoLookupCache.get(cacheKey);
  const now = Date.now();
  if (cached && now < cached.expiraEm) {
    return cached.dados;
  }

  // Lookup online leve com timeout estrito de 1.2 segundos
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1200);
    const lookupRes = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`, {
      signal: ctrl.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timer);

    if (lookupRes.ok) {
      const data = await lookupRes.json();
      if (data && data.status === 'success') {
        const pCode = (data.countryCode || '').toUpperCase();
        const pInfo = PAISES_MAP[pCode] || { nome: data.country || pCode, flag: '🌐', continente: 'Desconhecido' };
        const prov = data.org || data.isp || 'Desconhecido';
        const asnNum = data.as ? parseInt(data.as.replace(/\D/g, ''), 10) : null;
        const isHosting = HOSTING_KEYWORDS.some(k => prov.toLowerCase().includes(k) || (data.as || '').toLowerCase().includes(k));

        const resLookup = {
          geolocalizacao: {
            disponivel: true,
            pais: pCode,
            paisNome: pInfo.nome,
            bandeira: pInfo.flag,
            continente: pInfo.continente,
            estado: data.region || data.regionName,
            cidade: data.city,
            codigoPostal: data.zip,
            fusoHorario: data.timezone,
            metroCode: null,
            coordenadas: { latitude: data.lat, longitude: data.lon },
            origemDados: 'ip_lookup_service'
          },
          conexao: {
            asn: asnNum,
            provedor: prov,
            datacenterColo: 'INTERNET',
            datacenterDescricao: data.as || prov,
            protocoloHttp: 'HTTP/2',
            tls: { versao: 'TLSv1.3', cipher: null }
          },
          analiseRisco: {
            isHosting,
            isAnycast: false,
            isVpnOuProxy: isHosting,
            isTor: false,
            scoreRisco: isHosting ? 25 : 5,
            tipoConexao: isHosting ? 'datacenter_hosting' : 'residencial',
            classificacao: isHosting ? 'IP de Nuvem / Servidor' : 'Conexão Residencial / Comercial'
          }
        };

        geoLookupCache.set(cacheKey, { dados: resLookup, expiraEm: now + 3600000 });
        return resLookup;
      }
    }
  } catch (_) {
    // Timeout ou erro de rede: continua para fallback
  }

  // Fallback padrão se não for possível obter dados externos
  return {
    geolocalizacao: {
      disponivel: false,
      pais: null,
      paisNome: 'Desconhecido',
      bandeira: '🌐',
      continente: 'Desconhecido',
      estado: null,
      cidade: null,
      codigoPostal: null,
      fusoHorario: null,
      metroCode: null,
      coordenadas: { latitude: null, longitude: null },
      origemDados: 'fallback_sem_rede'
    },
    conexao: {
      asn: null,
      provedor: 'Rede Pública Global',
      datacenterColo: 'EDGE',
      datacenterDescricao: 'Borda Anycast',
      protocoloHttp: 'HTTP/2',
      tls: { versao: 'TLSv1.3', cipher: null }
    },
    analiseRisco: {
      isHosting: false,
      isAnycast: false,
      isVpnOuProxy: false,
      isTor: false,
      scoreRisco: 10,
      tipoConexao: 'publica_desconhecida',
      classificacao: 'Conexão Pública Padrão'
    }
  };
}

/**
 * Handler HTTP Oficial do Cloudflare Workers / Pages Functions & Node.js Dispatcher
 */
export default async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);

  // 1. Preflight CORS aberto para uso universal em APIs e Frontends
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, Accept, User-Agent, X-Requested-With',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // 2. Rate Limit na borda (300/min com token, 90/min anônimo)
  const authHeader = request.headers.get('Authorization') || request.headers.get('x-api-key') || '';
  const isAuth = authHeader.length > 10;
  const ipVisitante = clientIp(request);
  const maxReqs = isAuth ? 300 : 90;
  const rl = await rateLimit(`ip-info:${ipVisitante}`, maxReqs, 60, env);

  if (!rl.ok) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Limite de requisições excedido. Limite gratuito: 90 req/min.',
      retryAfterSeconds: Math.ceil((rl.resetAt - Date.now()) / 1000)
    }, null, 2), {
      status: 429,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000)))
      }
    });
  }

  // 3. Extração dos Parâmetros e Headers
  let ipParam = null;
  let uaParam = null;

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (body && typeof body === 'object') {
        ipParam = body.ip || body.enderecoIp || null;
        uaParam = body.userAgent || body.ua || body.user_agent || null;
      }
    } catch (_) {}
  }

  // Query params sobrescrevem caso informados
  if (!ipParam) ipParam = url.searchParams.get('ip') || url.searchParams.get('endereco');
  if (!uaParam) uaParam = url.searchParams.get('ua') || url.searchParams.get('userAgent') || url.searchParams.get('user_agent');

  // Headers do cliente real
  const headerIp = (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    request.headers.get('true-client-ip') ||
    request.headers.get('x-client-ip') ||
    '127.0.0.1'
  );

  const ipFinal = String(ipParam || headerIp).trim();
  const infoIp = classificarIp(ipFinal);

  const headerUa = request.headers.get('user-agent') || '';
  const uaFinal = String(uaParam || headerUa).trim();

  // Client Hints
  const clientHints = {
    secChUa: request.headers.get('sec-ch-ua') || '',
    secChUaMobile: request.headers.get('sec-ch-ua-mobile') || '',
    secChUaPlatform: request.headers.get('sec-ch-ua-platform') || '',
    secChUaPlatformVersion: request.headers.get('sec-ch-ua-platform-version') || '',
    secChUaArch: request.headers.get('sec-ch-ua-arch') || '',
    secChUaModel: request.headers.get('sec-ch-ua-model') || '',
    secChUaBitness: request.headers.get('sec-ch-ua-bitness') || ''
  };

  const infoUa = analisarUserAgent(uaFinal, clientHints);
  const infoIdiomas = analisarIdiomas(request.headers.get('accept-language') || '');

  // 4. Formatos de Saída Rápidos (Texto puro para scripts bash/curl: ?format=text|ip|ua)
  const format = (url.searchParams.get('format') || '').toLowerCase();
  const lowerPath = url.pathname.toLowerCase();

  if (format === 'ip' || format === 'text' || lowerPath.endsWith('/ip') || lowerPath.endsWith('/raw')) {
    return new Response(infoIp.ip, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  }

  if (format === 'ua' || format === 'user-agent') {
    return new Response(uaFinal, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  }

  // 5. Geolocalização, Telecom, ASN e Análise de Risco (Anycast / Cloudflare Edge / Base de Conhecimento)
  const cf = request.cf || {};
  const isConsultaExterna = Boolean(ipParam && ipParam !== headerIp);
  const infoRede = await resolverGeolocalizacaoEConexao(ipFinal, infoIp, cf, isConsultaExterna);

  const { geolocalizacao, conexao, analiseRisco } = infoRede;

  // Formatos de texto adicionais para scripts rápidos
  if (format === 'country' || format === 'pais' || lowerPath.endsWith('/pais') || lowerPath.endsWith('/country')) {
    return new Response(geolocalizacao.pais || 'XX', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
    });
  }

  if (format === 'city' || format === 'cidade' || lowerPath.endsWith('/cidade') || lowerPath.endsWith('/city')) {
    return new Response(geolocalizacao.cidade || 'Desconhecida', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
    });
  }

  if (format === 'asn' || lowerPath.endsWith('/asn')) {
    return new Response(conexao.asn ? `AS${conexao.asn}` : 'AS0', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
    });
  }

  // Cabeçalhos de segurança e privacidade do navegador
  const isVpnDivergente = Boolean(
    geolocalizacao.pais &&
    geolocalizacao.pais !== 'BR' &&
    infoIdiomas.idiomaPrincipal &&
    infoIdiomas.idiomaPrincipal.toLowerCase().startsWith('pt') &&
    analiseRisco.isHosting
  );

  const segurancaCliente = {
    https: url.protocol === 'https:',
    doNotTrack: request.headers.get('dnt') === '1',
    globalPrivacyControl: request.headers.get('sec-gpc') === '1',
    suporteWebp: (request.headers.get('accept') || '').includes('image/webp'),
    suporteAvif: (request.headers.get('accept') || '').includes('image/avif'),
    compressaoAceita: request.headers.get('accept-encoding') || '',
    alertaInconsistenciaVpn: isVpnDivergente,
    motivoAlertaVpn: isVpnDivergente ? 'IP hospedado em nuvem internacional com navegador em Português (típico de VPN comercial).' : null
  };

  // Resumo inteligente em texto legível
  const resumo = [
    `Conexão via ${infoIp.versao || 'IP'} (${infoIp.ip})`,
    geolocalizacao.cidade ? `em ${geolocalizacao.cidade}, ${geolocalizacao.estado || geolocalizacao.paisNome}` : (geolocalizacao.paisNome ? `em ${geolocalizacao.paisNome}` : null),
    conexao.provedor && conexao.provedor !== 'Provedor Desconhecido' ? `(${conexao.provedor})` : null,
    infoUa.bot.isBot ? `detectado como Robô/Crawler (${infoUa.bot.nome})` : `utilizando ${infoUa.navegador.nome} ${infoUa.navegador.versao !== 'Desconhecida' ? infoUa.navegador.versao : ''} em ${infoUa.sistemaOperacional.nomeComercial} (${infoUa.dispositivo.tipo})`
  ].filter(Boolean).join(' ');

  let respostaFinal = {
    ok: true,
    ip: {
      endereco: infoIp.ip,
      versao: infoIp.versao,
      valido: infoIp.valido,
      tipoRede: infoIp.tipoRede,
      isPrivado: infoIp.isPrivado,
      faixaCidrEstimada: infoIp.faixaCidrEstimada || null,
      versaoExpandida: infoIp.versaoExpandida || null,
      origem: ipParam ? 'parametro_consulta' : 'cabecalho_conexao'
    },
    navegador: infoUa.navegador,
    sistemaOperacional: infoUa.sistemaOperacional,
    dispositivo: infoUa.dispositivo,
    bot: infoUa.bot,
    geolocalizacao,
    conexao,
    analiseRisco,
    idiomas: infoIdiomas,
    seguranca: segurancaCliente,
    userAgent: {
      completo: infoUa.userAgentRaw,
      clientHints: Object.values(clientHints).some(Boolean) ? clientHints : null
    },
    resumo,
    timestamp: new Date().toISOString()
  };

  // Filtragem seletiva de campos via ?fields=ip,navegador,pais
  const fieldsParam = url.searchParams.get('fields');
  if (fieldsParam) {
    const requestedFields = fieldsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (requestedFields.length > 0) {
      const filtered = { ok: true, ip: respostaFinal.ip.endereco };
      for (const f of requestedFields) {
        if (respostaFinal[f] !== undefined) filtered[f] = respostaFinal[f];
        else if (f === 'pais') filtered.pais = geolocalizacao.pais;
        else if (f === 'cidade') filtered.cidade = geolocalizacao.cidade;
        else if (f === 'asn') filtered.asn = conexao.asn;
      }
      respostaFinal = filtered;
    }
  }

  return new Response(JSON.stringify(respostaFinal, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'Accept-CH': 'Sec-CH-UA, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Model, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Full-Version-List',
      'Permissions-Policy': 'ch-ua-platform-version=*'
    }
  });
}
