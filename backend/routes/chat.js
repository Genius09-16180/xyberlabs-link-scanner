// ─────────────────────────────────────────────────────────
//  routes/chat.js — POST /chat
// ─────────────────────────────────────────────────────────
const express   = require('express');
const rateLimit = require('express-rate-limit');
const { chat }  = require('../utils/groq');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 messaggi al minuto
  message: { error: 'Troppi messaggi. Aspetta un momento.' },
});

router.post('/', chatLimiter, async (req, res) => {
  const { messages, context } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array richiesto.' });
  }
  if (!context || !context.url) {
    return res.status(400).json({ error: 'context.url richiesto.' });
  }

  // Sanitizza messaggi (solo ruoli user/assistant)
  const sanitized = messages
    .filter(m => ['user','assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-12); // max 12 messaggi di storia

  try {
    const reply = await chat(sanitized, context);
    return res.json({ reply });
  } catch (err) {
    console.error('[CHAT ERROR]', err.message);
    return res.status(500).json({ error: 'Errore durante la generazione della risposta.' });
  }
});

module.exports = router;
