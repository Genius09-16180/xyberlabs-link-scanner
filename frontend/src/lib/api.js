// ─────────────────────────────────────────────────────────
//  lib/api.js — Chiamate centralizzate al backend
// ─────────────────────────────────────────────────────────
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 45_000, // 45s per analisi
  headers: { 'Content-Type': 'application/json' },
})

/** Analizza un URL */
export async function analyzeUrl(url) {
  const { data } = await api.post('/analyze-url', { url })
  return data
}

/** Invia messaggio alla chat */
export async function sendChatMessage(messages, context) {
  const { data } = await api.post('/chat', { messages, context })
  return data.reply
}

/** Recupera tutti i link per la board */
export async function getLinks() {
  const { data } = await api.get('/links')
  return data.links
}

/** Salva/aggiorna link */
export async function saveLink(linkData) {
  const { data } = await api.post('/links/save', linkData)
  return data.link
}

/** Aggiorna link (posizione, label, etc.) */
export async function updateLink(id, updates) {
  const { data } = await api.put(`/links/${id}`, updates)
  return data.link
}

/** Elimina link */
export async function deleteLink(id) {
  await api.delete(`/links/${id}`)
}

/** Health check */
export async function checkHealth() {
  const { data } = await api.get('/health')
  return data
}
