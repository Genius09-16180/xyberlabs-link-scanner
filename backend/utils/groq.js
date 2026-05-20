// ─────────────────────────────────────────────────────────
//  utils/groq.js
//  Integrazione Groq API — report + chat contestuale
//  Modello: llama-3.1-8b-instant (gratuito su Groq)
// ─────────────────────────────────────────────────────────
const Groq = require('groq-sdk');

let _groq = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

// ── Modelli disponibili su Groq (gratuiti) ────────────────
const MODEL_ANALYSIS = 'llama-3.1-8b-instant';  // Veloce, ottimo per analisi
const MODEL_CHAT     = 'llama-3.1-8b-instant';  // Stessa famiglia per coerenza

// ─────────────────────────────────────────────────────────
//  generateReport — Analisi completa del sito
// ─────────────────────────────────────────────────────────
async function generateReport(extractedData, url, httpInfo) {
  const groq = getGroq();

  const systemPrompt = `Sei il motore di analisi di sicurezza di XyberLabs, un laboratorio di cybersecurity avanzato.
Il tuo compito è generare report di sicurezza precisi, diretti e tecnici ma comprensibili.

STILE DI RISPOSTA:
- Tono: tecnico ma accessibile, incisivo, mai generico
- NON usare frasi banali come "è importante ricordare" o "come possiamo vedere"
- Sii diretto e specifico: cita dati reali estratti, non supposizioni
- Se qualcosa è sospetto, dillo chiaramente senza giri di parole
- Se qualcosa è sicuro, affermalo con evidenza

FORMATO OUTPUT (JSON puro, nessun markdown wrapping):
{
  "summary": "Breve sintesi incisiva in 2-3 frasi (max 300 caratteri)",
  "riskScore": <numero 0-10, dove 0=sicuro, 10=pericoloso>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "verdict": "Una frase secca sul verdetto finale",
  "sections": [
    {
      "title": "Titolo sezione",
      "content": "Analisi dettagliata con dati specifici",
      "icon": "<nome icona tematico: shield|alert|eye|code|link|cookie|server|lock|globe|zap>",
      "color": "<cyan|violet|pink|orange|green|gold>"
    }
  ]
}

LOGICA PER riskScore:
- 0-2: Sito pulito, headers di sicurezza presenti, nessun tracker invasivo
- 3-4: Qualche tracker, headers parziali, alcuni script esterni
- 5-6: Tracker multipli, CSP assente, script da fonti sconosciute, form sospetti
- 7-8: Obfuscazione JS, molti redirect, cookie senza Secure/HttpOnly, iframe da terzi
- 9-10: Phishing patterns, login su HTTP, redirect a domini sospetti, obfuscazione pesante

Genera SEMPRE sezioni basate sui dati reali che trovi. Se non ci sono tracker, non ne parlare. Se ci sono header di sicurezza importanti, evidenziali. Adatta le sezioni a ciò che è stato trovato.`;

  const userPrompt = `Analizza questo sito e genera il report di sicurezza:

URL: ${url}
Status HTTP: ${httpInfo.status}
URL finale (dopo redirect): ${httpInfo.finalUrl}
Redirect chain: ${httpInfo.redirectChain.length > 0 ? httpInfo.redirectChain.join(' → ') : 'Nessun redirect'}

DATI ESTRATTI:
- Titolo: ${extractedData.title || 'N/D'}
- Descrizione: ${extractedData.description || 'N/D'}
- Server: ${extractedData.server || 'Non dichiarato'}
- Script totali: ${extractedData.scriptCount}
- Script inline: ${extractedData.inlineScripts}
- Domini esterni collegati: ${extractedData.externalDomains.length} → [${extractedData.externalDomains.slice(0, 15).join(', ')}]
- Tracker rilevati: ${extractedData.trackerList.length > 0 ? extractedData.trackerList.join(', ') : 'Nessuno'}
- Ha form di login: ${extractedData.hasLogin ? 'SÌ ⚠️' : 'No'}
- Ha iframe da terzi: ${extractedData.iframes.filter(Boolean).length > 0 ? extractedData.iframes.join(', ') : 'No'}
- Obfuscazione JS: ${extractedData.hasObfuscation ? 'RILEVATA ⚠️' : 'Non rilevata'}
- Cookie ricevuti: ${extractedData.cookies.length} → ${JSON.stringify(extractedData.cookies.slice(0, 5))}

HEADER HTTP SICUREZZA:
- Content-Security-Policy: ${extractedData.cspPresent ? '✓ Presente' : '✗ Assente'}
- HSTS: ${extractedData.hstsPresent ? '✓ Presente' : '✗ Assente'}
- X-Frame-Options: ${extractedData.xFrameOptions || '✗ Assente'}
- Referrer-Policy: ${extractedData.referrerPolicy || '✗ Assente'}

META TAG: ${JSON.stringify(extractedData.metaTags.slice(0, 10))}

TESTO ESTRATTO (primo snippet):
"${extractedData.textSnippet}"

Genera il report JSON ora. Minimo 4 sezioni, massimo 8. Ogni sezione deve essere specifica e contenere dati reali, non generici.`;

  const response = await groq.chat.completions.create({
    model: MODEL_ANALYSIS,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    max_tokens: 2500,
    temperature: 0.3, // Bassa per report più precisi e ripetibili
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(raw);
    // Validazione e sanitizzazione
    return {
      summary:   String(parsed.summary  || '').slice(0, 500),
      riskScore: Math.max(0, Math.min(10, Number(parsed.riskScore) || 0)),
      riskLevel: ['LOW','MEDIUM','HIGH','CRITICAL'].includes(parsed.riskLevel) ? parsed.riskLevel : 'LOW',
      verdict:   String(parsed.verdict  || '').slice(0, 300),
      sections:  (Array.isArray(parsed.sections) ? parsed.sections : []).slice(0, 8).map(s => ({
        title:   String(s.title   || '').slice(0, 80),
        content: String(s.content || '').slice(0, 1500),
        icon:    String(s.icon    || 'shield').slice(0, 20),
        color:   ['cyan','violet','pink','orange','green','gold'].includes(s.color) ? s.color : 'cyan',
      })),
      rawReport: raw,
    };
  } catch {
    return {
      summary: 'Report generato — analisi completata.',
      riskScore: 5,
      riskLevel: 'MEDIUM',
      verdict:  'Analisi completata.',
      sections: [],
      rawReport: raw,
    };
  }
}

// ─────────────────────────────────────────────────────────
//  chat — Risposta contestuale al report
// ─────────────────────────────────────────────────────────
async function chat(messages, context) {
  const groq = getGroq();

  const systemPrompt = `Sei l'assistente AI di XyberLabs Link Scanner, specializzato in sicurezza informatica.
Hai analizzato il sito ${context.url} e disponi dei seguenti dati:

REPORT GENERATO:
- Risk Score: ${context.riskScore}/10 (${context.riskLevel})
- Sommario: ${context.summary}
- Verdict: ${context.verdict}

DATI TECNICI:
- Tracker rilevati: ${context.trackerList?.join(', ') || 'nessuno'}
- Script totali: ${context.scriptCount}
- Domini esterni: ${context.externalDomains?.slice(0,10).join(', ') || 'nessuno'}
- Header sicurezza: CSP ${context.cspPresent ? '✓' : '✗'}, HSTS ${context.hstsPresent ? '✓' : '✗'}
- Form di login: ${context.hasLogin ? 'Sì' : 'No'}
- Obfuscazione JS: ${context.hasObfuscation ? 'Sì ⚠️' : 'No'}
- Cookie: ${context.cookies?.length || 0}

SEZIONI REPORT:
${context.sections?.map(s => `[${s.title}]: ${s.content.slice(0, 200)}`).join('\n') || 'N/D'}

REGOLE DI RISPOSTA:
- Rispondi in italiano
- Sii diretto e tecnico, evita giri di parole
- Cita sempre dati reali dall'analisi quando possibile
- Se l'utente chiede qualcosa che va oltre il sito analizzato, puoi rispondere in generale ma chiarisci che esuli dall'analisi specifica
- Mai inventare dati che non hai
- Tono: esperto di sicurezza, non saccente`;

  const response = await groq.chat.completions.create({
    model: MODEL_CHAT,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10), // Ultimi 10 messaggi per contesto
    ],
    max_tokens: 800,
    temperature: 0.6,
  });

  return response.choices[0]?.message?.content || 'Errore nella generazione della risposta.';
}

// ─────────────────────────────────────────────────────────
//  classifyLink — Classificazione rapida (per board)
// ─────────────────────────────────────────────────────────
async function classifyLink(url, extractedData) {
  const groq = getGroq();

  const response = await groq.chat.completions.create({
    model: MODEL_ANALYSIS,
    messages: [{
      role: 'user',
      content: `Classifica questo URL in una categoria sicurezza. Rispondi SOLO con JSON:
{"category": "<safe|suspicious|dangerous|tracker|ads|phishing|unknown>", "reason": "<max 80 caratteri>"}

URL: ${url}
Tracker: ${extractedData.trackerList?.join(',') || 'nessuno'}
HasLogin: ${extractedData.hasLogin}
Obfuscation: ${extractedData.hasObfuscation}
RiskScore: ${extractedData.riskScore || 0}`,
    }],
    max_tokens: 100,
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch {
    return { category: 'unknown', reason: 'Classificazione non disponibile' };
  }
}

module.exports = { generateReport, chat, classifyLink };
