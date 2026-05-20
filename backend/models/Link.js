// ─────────────────────────────────────────────────────────
//  models/Link.js — Schema MongoDB per i link analizzati
// ─────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2048,
  },
  domain: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['safe', 'suspicious', 'dangerous', 'unknown', 'tracker', 'ads', 'phishing'],
    default: 'unknown',
  },
  label: {
    type: String,
    trim: true,
    maxlength: 120,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 40,
  }],
  // Posizione sulla board interattiva
  boardPosition: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },
  },
  // Connessioni ad altri link (ID dei link collegati)
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
  }],
  // Cartella/gruppo sulla board
  folder: {
    type: String,
    default: null,
  },
  // Dati estratti dal sito
  extractedData: {
    title:          { type: String, default: '' },
    description:    { type: String, default: '' },
    metaTags:       [{ name: String, content: String }],
    scripts:        [{ type: String }],
    externalDomains:[{ type: String }],
    redirectChain:  [{ type: String }],
    cookies:        [{ name: String, value: String, flags: String }],
    keywords:       [{ type: String }],
    statusCode:     { type: Number },
    contentType:    { type: String },
    server:         { type: String },
    httpHeaders:    { type: mongoose.Schema.Types.Mixed },
    hasForms:       { type: Boolean, default: false },
    hasLogin:       { type: Boolean, default: false },
    hasTrackers:    { type: Boolean, default: false },
    scriptCount:    { type: Number, default: 0 },
    externalCount:  { type: Number, default: 0 },
  },
  // Report Groq
  report: {
    summary:    { type: String, default: '' },
    riskScore:  { type: Number, min: 0, max: 10, default: 0 },
    riskLevel:  { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    sections:   [{ title: String, content: String, icon: String, color: String }],
    rawReport:  { type: String, default: '' },
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indice per ricerche rapide per URL
LinkSchema.index({ url: 1 });
LinkSchema.index({ domain: 1 });
LinkSchema.index({ category: 1 });
LinkSchema.index({ analyzedAt: -1 });

module.exports = mongoose.model('Link', LinkSchema);
