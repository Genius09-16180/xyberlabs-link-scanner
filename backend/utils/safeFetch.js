// ─────────────────────────────────────────────────────────
//  utils/safeFetch.js
//  Fetch "sicuro" di un URL: solo HTML + headers.
//  Nessuna esecuzione JS, nessun redirect infinito,
//  timeout aggressivo, dimensione risposta limitata.
// ─────────────────────────────────────────────────────────
const fetch = require('node-fetch');

const MAX_BODY_SIZE  = 512 * 1024;
const TIMEOUT_MS     = 12_000;
const MAX_REDIRECTS  = 5;

const UA = 'XyberLabs-LinkScanner/1.0 (+https://xyberlabs.it/scanner)';

/**
 * Esegue un fetch sicuro e restituisce HTML + metadati.
 * @param {string} rawUrl
 * @returns {Promise<{html: string, headers: Object, status: number, finalUrl: string, redirectChain: string[]}>}
 */
async function safeFetch(rawUrl) {
  const url = normalizeUrl(rawUrl);
  const redirectChain = [];
  let currentUrl = url;
  let response;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
          'Connection': 'close',
        },
        redirect: 'manual', // gestione redirect manuale
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('Timeout: il sito non risponde entro 12 secondi.');
      throw new Error(`Fetch fallito: ${err.message}`);
    }
    clearTimeout(timer);

    // Gestione redirect manuale
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) break;
      redirectChain.push(currentUrl);
      currentUrl = resolveUrl(location, currentUrl);
      continue;
    }
    break;
  }

  if (!response) throw new Error('Nessuna risposta dal server.');

  // Leggi solo la parte che ci serve, non tutto il body
  const contentType = response.headers.get('content-type') || '';
  let html = '';

  if (contentType.includes('text/html') || contentType.includes('text/plain') || contentType.includes('application/xhtml')) {
    const buffer = [];
    let totalSize = 0;

    try {
      for await (const chunk of response.body) {
        totalSize += chunk.length;
        if (totalSize > MAX_BODY_SIZE) {
          // Leggiamo solo i primi 512KB
          buffer.push(chunk.slice(0, MAX_BODY_SIZE - (totalSize - chunk.length)));
          break;
        }
        buffer.push(chunk);
      }
      html = Buffer.concat(buffer).toString('utf-8');
    } catch {
      html = '';
    }
  }

  // Raccoglie gli header rilevanti (senza quelli sensibili del server)
  const safeHeaders = {};
  const interestingHeaders = [
    'content-type', 'server', 'x-powered-by', 'content-security-policy',
    'x-frame-options', 'strict-transport-security', 'x-content-type-options',
    'set-cookie', 'cache-control', 'referrer-policy', 'permissions-policy',
    'access-control-allow-origin', 'x-xss-protection',
  ];
  for (const h of interestingHeaders) {
    const val = response.headers.get(h);
    if (val) safeHeaders[h] = val;
  }

  return {
    html,
    headers:       safeHeaders,
    status:        response.status,
    finalUrl:      currentUrl,
    redirectChain,
    contentType,
  };
}

function normalizeUrl(url) {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  // Valida URL
  try { new URL(u); } catch { throw new Error('URL non valido.'); }
  // Blocca IPs privati e localhost per sicurezza SSRF
  const hostname = new URL(u).hostname;
  if (isPrivateHost(hostname)) throw new Error('Scan di indirizzi privati/localhost non permesso.');
  return u;
}

function resolveUrl(location, base) {
  try { return new URL(location, base).href; } catch { return location; }
}

function isPrivateHost(host) {
  const privatePatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^::1$/,
    /^0\.0\.0\.0$/,
    /^169\.254\./,
  ];
  return privatePatterns.some(p => p.test(host));
}

module.exports = { safeFetch };
