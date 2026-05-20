// ─────────────────────────────────────────────────────────
//  routes/analyze.js — POST /analyze-url
// ─────────────────────────────────────────────────────────
const express    = require('express');
const rateLimit  = require('express-rate-limit');
const validator  = require('validator');
const { safeFetch }      = require('../utils/safeFetch');
const { extractData }    = require('../utils/extractor');
const { generateReport } = require('../utils/groq');
const Link               = require('../models/Link');

const router = express.Router();

// Rate limit specifico per analisi (operazione costosa)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,              // max 5 analisi al minuto
  message: { error: 'Troppe analisi. Aspetta un momento prima di riprovare.' },
  standardHeaders: true,
});

router.post('/', analyzeLimiter, async (req, res) => {
  const { url } = req.body;

  // ── Validazione ──────────────────────────────────────
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL richiesto.' });
  }

  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = 'https://' + normalizedUrl;

  if (!validator.isURL(normalizedUrl, {
    protocols: ['http', 'https'],
    require_protocol: true,
    allow_underscores: true,
  })) {
    return res.status(400).json({ error: 'URL non valido. Inserisci un URL completo (es. https://example.com).' });
  }

  try {
    // ── 1. Safe fetch ──────────────────────────────────
    console.log(`[ANALYZE] Fetching: ${normalizedUrl}`);
    let httpInfo;
    try {
      httpInfo = await safeFetch(normalizedUrl);
    } catch (fetchErr) {
      return res.status(422).json({
        error: `Impossibile raggiungere il sito: ${fetchErr.message}`,
        code: 'FETCH_FAILED',
      });
    }

    // ── 2. Estrazione dati ─────────────────────────────
    const domain = new URL(httpInfo.finalUrl).hostname.replace(/^www\./, '');
    const extracted = extractData(httpInfo.html, httpInfo.finalUrl, httpInfo.headers);

    // ── 3. Report Groq ─────────────────────────────────
    console.log(`[ANALYZE] Generating report via Groq...`);
    let report;
    try {
      report = await generateReport(extracted, normalizedUrl, httpInfo);
    } catch (groqErr) {
      console.error('[GROQ ERROR]', groqErr.message);
      // Fallback report di base se Groq fallisce
      report = {
        summary: 'Analisi HTML completata. Report AI non disponibile al momento.',
        riskScore: 5,
        riskLevel: 'MEDIUM',
        verdict: 'Verifica manuale consigliata.',
        sections: [{
          title: 'Dati Estratti',
          content: `Trovati ${extracted.scriptCount} script, ${extracted.externalDomains.length} domini esterni, ${extracted.cookies.length} cookie.`,
          icon: 'code',
          color: 'cyan',
        }],
        rawReport: '',
      };
    }

    // ── 4. Salvataggio MongoDB ─────────────────────────
    let savedLink = null;
    try {
      savedLink = await Link.create({
        url:    normalizedUrl,
        domain,
        category: mapRiskToCategory(report.riskScore),
        extractedData: {
          title:          extracted.title,
          description:    extracted.description,
          metaTags:       extracted.metaTags.slice(0, 20),
          scripts:        extracted.scripts.slice(0, 30),
          externalDomains:extracted.externalDomains.slice(0, 40),
          redirectChain:  httpInfo.redirectChain,
          cookies:        extracted.cookies,
          keywords:       extracted.keywords,
          statusCode:     httpInfo.status,
          contentType:    httpInfo.contentType,
          server:         extracted.server,
          httpHeaders:    extracted.httpHeaders,
          hasForms:       extracted.hasForms,
          hasLogin:       extracted.hasLogin,
          hasTrackers:    extracted.hasTrackers,
          scriptCount:    extracted.scriptCount,
          externalCount:  extracted.externalDomains.length,
        },
        report: {
          summary:   report.summary,
          riskScore: report.riskScore,
          riskLevel: report.riskLevel,
          sections:  report.sections,
          rawReport: report.rawReport,
        },
      });
    } catch (dbErr) {
      console.warn('[DB] Salvataggio non riuscito:', dbErr.message);
    }

    // ── 5. Risposta ────────────────────────────────────
    return res.json({
      id:     savedLink?._id || null,
      url:    normalizedUrl,
      domain,
      finalUrl:      httpInfo.finalUrl,
      redirectChain: httpInfo.redirectChain,
      status:        httpInfo.status,
      extractedData: extracted,
      report,
    });

  } catch (err) {
    console.error('[ANALYZE ERROR]', err);
    return res.status(500).json({ error: 'Errore interno durante l\'analisi.', detail: err.message });
  }
});

function mapRiskToCategory(score) {
  if (score <= 2) return 'safe';
  if (score <= 4) return 'suspicious';
  if (score <= 7) return 'dangerous';
  return 'phishing';
}

module.exports = router;
