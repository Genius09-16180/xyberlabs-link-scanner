// ─────────────────────────────────────────────────────────
//  routes/links.js — CRUD link per la board interattiva
//  GET    /links           → tutti i link
//  POST   /links/save      → salva/aggiorna link
//  PUT    /links/:id       → aggiorna posizione/label/categoria
//  DELETE /links/:id       → elimina link
//  POST   /links/classify  → classifica link via Groq
// ─────────────────────────────────────────────────────────
const express        = require('express');
const { classifyLink } = require('../utils/groq');
const Link           = require('../models/Link');

const router = express.Router();

// ── GET /links ────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const links = await Link.find({})
      .sort({ analyzedAt: -1 })
      .limit(200)
      .select('-extractedData.httpHeaders -report.rawReport');
    return res.json({ links });
  } catch (err) {
    // Fallback se DB non disponibile
    console.warn('[DB] get links fallito:', err.message);
    return res.json({ links: [] });
  }
});

// ── POST /links/save ──────────────────────────────────────
router.post('/save', async (req, res) => {
  const { url, domain, category, label, tags, boardPosition, report, extractedData } = req.body;
  if (!url) return res.status(400).json({ error: 'url richiesto.' });

  try {
    // Upsert basato su URL
    const link = await Link.findOneAndUpdate(
      { url },
      {
        $set: {
          domain:        domain || '',
          category:      category || 'unknown',
          label:         label   || '',
          tags:          Array.isArray(tags) ? tags.slice(0,10) : [],
          boardPosition: boardPosition || { x: 100, y: 100 },
          ...(report        ? { report }        : {}),
          ...(extractedData ? { extractedData } : {}),
        }
      },
      { upsert: true, new: true }
    );
    return res.json({ link });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── PUT /links/:id — aggiorna posizione board, label, connessioni ──
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { boardPosition, label, category, tags, connections, folder } = req.body;

  const updates = {};
  if (boardPosition)          updates.boardPosition = boardPosition;
  if (label !== undefined)    updates.label         = String(label).slice(0, 120);
  if (category)               updates.category      = category;
  if (Array.isArray(tags))    updates.tags          = tags.slice(0, 10);
  if (Array.isArray(connections)) updates.connections = connections;
  if (folder !== undefined)   updates.folder        = folder;

  try {
    const link = await Link.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!link) return res.status(404).json({ error: 'Link non trovato.' });
    return res.json({ link });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /links/:id ─────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Link.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /links/classify — classifica singolo link ────────
router.post('/classify', async (req, res) => {
  const { url, extractedData } = req.body;
  if (!url) return res.status(400).json({ error: 'url richiesto.' });

  try {
    const result = await classifyLink(url, extractedData || {});
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
