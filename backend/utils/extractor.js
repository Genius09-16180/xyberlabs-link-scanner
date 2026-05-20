// ─────────────────────────────────────────────────────────
//  utils/extractor.js
//  Estrae dati rilevanti dall'HTML raw:
//  meta tag, script, domini esterni, cookie, testo, form
// ─────────────────────────────────────────────────────────

// Regex-based parser leggero — nessuna dipendenza da browser/DOM
// Sicuro da usare su HTML arbitrario

/**
 * @param {string} html  - HTML grezzo
 * @param {string} baseUrl - URL originale
 * @param {Object} headers - HTTP headers già estratti
 * @returns {Object} extractedData
 */
function extractData(html, baseUrl, headers = {}) {
  const baseDomain = getDomain(baseUrl);

  return {
    title:          extractTitle(html),
    description:    extractMetaContent(html, 'description'),
    keywords:       extractKeywords(html),
    metaTags:       extractAllMetaTags(html),
    scripts:        extractScripts(html),
    externalDomains:extractExternalDomains(html, baseDomain),
    externalLinks:  extractExternalLinks(html, baseDomain),
    inlineScripts:  countInlineScripts(html),
    scriptCount:    countAllScripts(html),
    hasForms:       /<form[\s>]/i.test(html),
    hasLogin:       hasLoginForm(html),
    hasTrackers:    detectTrackers(html),
    trackerList:    identifyTrackers(html),
    hasObfuscation: detectObfuscation(html),
    iframes:        extractIframes(html),
    cookies:        parseCookieHeader(headers['set-cookie'] || ''),
    httpHeaders:    headers,
    server:         headers['server'] || headers['x-powered-by'] || 'Non dichiarato',
    cspPresent:     !!headers['content-security-policy'],
    hstsPresent:    !!headers['strict-transport-security'],
    xFrameOptions:  headers['x-frame-options'] || null,
    referrerPolicy: headers['referrer-policy'] || null,
    textSnippet:    extractTextSnippet(html, 800),
    robotsMeta:     extractMetaContent(html, 'robots'),
    ogTitle:        extractOgTag(html, 'og:title'),
    ogDescription:  extractOgTag(html, 'og:description'),
    canonicalUrl:   extractCanonical(html),
    favicon:        extractFavicon(html, baseUrl),
    wordCount:      estimateWordCount(html),
  };
}

// ── Helpers ───────────────────────────────────────────────

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? cleanText(m[1]) : '';
}

function extractMetaContent(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return cleanText(m[1]);
  }
  return '';
}

function extractOgTag(html, property) {
  const m = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'));
  return m ? cleanText(m[1]) : '';
}

function extractAllMetaTags(html) {
  const tags = [];
  const re = /<meta([^>]+)>/gi;
  let m;
  while ((m = re.exec(html)) !== null && tags.length < 40) {
    const attrs = m[1];
    const name    = (attrs.match(/name=["']([^"']+)["']/i) || [])[1];
    const prop    = (attrs.match(/property=["']([^"']+)["']/i) || [])[1];
    const content = (attrs.match(/content=["']([^"']+)["']/i) || [])[1];
    const key = name || prop;
    if (key && content) tags.push({ name: key, content: cleanText(content).slice(0, 300) });
  }
  return tags;
}

function extractScripts(html) {
  const scripts = [];
  const re = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null && scripts.length < 50) {
    scripts.push(m[1]);
  }
  return scripts;
}

function countInlineScripts(html) {
  return (html.match(/<script(?![^>]+src=)[^>]*>[\s\S]*?<\/script>/gi) || []).length;
}

function countAllScripts(html) {
  return (html.match(/<script/gi) || []).length;
}

function extractExternalDomains(html, baseDomain) {
  const domains = new Set();
  // src e href con domini
  const re = /(?:src|href|action)=["'](https?:\/\/([^"'\/\s]+))/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const domain = m[2].toLowerCase().replace(/^www\./, '');
    if (domain && domain !== baseDomain && !domain.includes(baseDomain)) {
      domains.add(domain);
    }
  }
  return [...domains].slice(0, 60);
}

function extractExternalLinks(html, baseDomain) {
  const links = [];
  const re = /href=["'](https?:\/\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null && links.length < 30) {
    const url = m[1];
    const domain = getDomain(url);
    if (domain && domain !== baseDomain) links.push(url);
  }
  return links;
}

function detectTrackers(html) {
  return TRACKER_PATTERNS.some(p => p.pattern.test(html));
}

function identifyTrackers(html) {
  return TRACKER_PATTERNS
    .filter(p => p.pattern.test(html))
    .map(p => p.name);
}

function detectObfuscation(html) {
  return /eval\s*\(|unescape\s*\(|String\.fromCharCode|atob\s*\(|btoa\s*\(|\\\x[0-9a-f]{2}|\\u[0-9a-f]{4}/i.test(html);
}

function extractIframes(html) {
  const iframes = [];
  const re = /<iframe([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null && iframes.length < 10) {
    const src = (m[1].match(/src=["']([^"']+)["']/i) || [])[1] || '';
    iframes.push(src);
  }
  return iframes;
}

function hasLoginForm(html) {
  return /type=["']password["']/i.test(html) ||
    /name=["'](?:password|passwd|pwd|pass)["']/i.test(html);
}

function parseCookieHeader(cookieStr) {
  if (!cookieStr) return [];
  const cookies = Array.isArray(cookieStr) ? cookieStr : [cookieStr];
  return cookies.map(c => {
    const parts = c.split(';').map(p => p.trim());
    const [name, value] = (parts[0] || '').split('=');
    const flags = parts.slice(1).join('; ');
    return { name: name || '', value: (value || '').slice(0, 40), flags };
  }).slice(0, 20);
}

function extractTextSnippet(html, maxLen = 800) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function extractKeywords(html) {
  const kw = extractMetaContent(html, 'keywords');
  return kw ? kw.split(',').map(k => k.trim()).filter(Boolean).slice(0, 20) : [];
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function extractFavicon(html, baseUrl) {
  const m = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i);
  if (!m) return '';
  try {
    return new URL(m[1], baseUrl).href;
  } catch {
    return m[1];
  }
}

function estimateWordCount(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(Boolean).length;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function cleanText(str) {
  return str.replace(/\s+/g, ' ').trim();
}

// ── Tracker patterns ──────────────────────────────────────
const TRACKER_PATTERNS = [
  { name: 'Google Analytics',   pattern: /google-analytics\.com|gtag\(|ga\('send/i },
  { name: 'Google Tag Manager', pattern: /googletagmanager\.com/i },
  { name: 'Facebook Pixel',     pattern: /connect\.facebook\.net|fbq\('track/i },
  { name: 'Hotjar',             pattern: /hotjar\.com|hj\('create/i },
  { name: 'Mixpanel',           pattern: /mixpanel\.com/i },
  { name: 'Segment',            pattern: /cdn\.segment\.com/i },
  { name: 'HubSpot',            pattern: /hs-scripts\.com|hubspot\.com/i },
  { name: 'Intercom',           pattern: /intercom\.io|widget\.intercom\.io/i },
  { name: 'Criteo',             pattern: /static\.criteo\.net/i },
  { name: 'DoubleClick',        pattern: /doubleclick\.net/i },
  { name: 'LinkedIn Insight',   pattern: /snap\.licdn\.com/i },
  { name: 'Twitter/X Pixel',    pattern: /static\.ads-twitter\.com/i },
  { name: 'TikTok Pixel',       pattern: /analytics\.tiktok\.com/i },
  { name: 'Yandex Metrica',     pattern: /mc\.yandex\.ru/i },
  { name: 'Clarity (Microsoft)',pattern: /clarity\.ms/i },
];

module.exports = { extractData };
