// ─────────────────────────────────────────────────────────
//  XyberLabs Link Scanner AI — server.js
//  Node.js + Express backend
// ─────────────────────────────────────────────────────────
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const mongoose    = require('mongoose');

const analyzeRoute   = require('./routes/analyze');
const chatRoute      = require('./routes/chat');
const linksRoute     = require('./routes/links');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ──────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ── CORS ──────────────────────────────────────────────────
// ALLOWED_ORIGINS nel .env: lista separata da virgola
// es: https://tuosito.altervista.org,https://tuosito.netlify.app
const ALLOWED = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permetti richieste senza origin (es. Postman, curl, stesso server)
    if (!origin) return cb(null, true);
    if (ALLOWED.length === 0 || ALLOWED.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origine non autorizzata → ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
// ── Body parser ───────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Global rate limiter ───────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' }
});
app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────
app.use('/analyze-url',   analyzeRoute);
app.use('/chat',          chatRoute);
app.use('/links',         linksRoute);

// ── Health check ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'XyberLabs Link Scanner API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Global error handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── MongoDB + Start ───────────────────────────────────────
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DB] MongoDB Atlas connesso ✓');
  } catch (err) {
    console.warn('[DB] MongoDB non disponibile — modalità in-memory attiva:', err.message);
    // L'app funziona anche senza DB (dati non persistiti)
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] XyberLabs Link Scanner API → http://localhost:${PORT}`);
  });
}

start();
