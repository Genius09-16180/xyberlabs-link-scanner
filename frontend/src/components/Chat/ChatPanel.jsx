// ChatPanel.jsx — top: 64px per non stare sotto navbar, X visibile, border-radius ripristinati
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Bot, User, Loader2, X, ChevronRight } from 'lucide-react'
import { sendChatMessage } from '../../lib/api'

const PANEL_W = 380
const NAVBAR_H = 64
const QUICK_Q = [
  'È sicuro visitare questo sito?',
  'Cosa fanno i tracker rilevati?',
  'Come valuti gli header di sicurezza?',
  'Spiega i cookie trovati',
  'Ci sono rischi per la privacy?',
]

export default function ChatPanel({ analysisData, isOpen, onToggle }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const endRef   = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 350) }, [isOpen])
  useEffect(() => {
    if (analysisData && messages.length === 0) {
      setMessages([{ role: 'assistant', content: `Ho analizzato **${analysisData.domain}** — Risk Score ${analysisData.report.riskScore}/10 (${analysisData.report.riskLevel}).\n\n${analysisData.report.summary}\n\nHai domande sul report?` }])
    }
  }, [analysisData])

  const ctx = () => !analysisData ? {} : {
    url: analysisData.url, riskScore: analysisData.report.riskScore,
    riskLevel: analysisData.report.riskLevel, summary: analysisData.report.summary,
    verdict: analysisData.report.verdict, trackerList: analysisData.extractedData.trackerList,
    scriptCount: analysisData.extractedData.scriptCount,
    externalDomains: analysisData.extractedData.externalDomains,
    cspPresent: analysisData.extractedData.cspPresent,
    hstsPresent: analysisData.extractedData.hstsPresent,
    hasLogin: analysisData.extractedData.hasLogin,
    hasObfuscation: analysisData.extractedData.hasObfuscation,
    cookies: analysisData.extractedData.cookies,
    sections: analysisData.report.sections,
  }

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading || !analysisData) return
    setInput('')
    const userMsg = { role: 'user', content: msg }
    setMessages(p => [...p, userMsg])
    setLoading(true)
    try {
      const reply = await sendChatMessage([...messages, userMsg], ctx())
      setMessages(p => [...p, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: `Errore: ${e.message}` }])
    } finally { setLoading(false) }
  }

  const renderMsg = (msg, i) => (
    <div key={i} style={{ display: 'flex', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: msg.role === 'user' ? 'rgba(0,229,255,.1)' : 'rgba(155,95,255,.1)',
        border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,255,.25)' : 'rgba(155,95,255,.25)'}`,
      }}>
        {msg.role === 'user' ? <User size={11} color="#00E5FF" /> : <Bot size={11} color="#9B5FFF" />}
      </div>
      <div style={{
        maxWidth: '80%', padding: '9px 13px',
        background: msg.role === 'user' ? 'rgba(0,229,255,.07)' : 'rgba(24,24,40,.85)',
        border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,255,.18)' : 'rgba(255,255,255,.05)'}`,
        borderRadius: '12px',
        borderTopRightRadius: msg.role === 'user' ? '3px' : '12px',
        borderTopLeftRadius:  msg.role === 'user' ? '12px' : '3px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
        color: 'rgba(255,255,255,.7)', lineHeight: 1.7,
      }}>
        {msg.content.split('\n').map((line, j) => (
          <span key={j}>
            {line.replace(/\*\*(.*?)\*\*/g, '§$1§').split('§').map((p, k) =>
              k % 2 === 1
                ? <strong key={k} style={{ color: msg.role === 'user' ? '#00E5FF' : '#9B5FFF' }}>{p}</strong>
                : p
            )}
            {j < msg.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Toggle FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={onToggle}
            style={{
              position: 'fixed', right: '24px', bottom: '32px', zIndex: 30,
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 18px', borderRadius: '14px',
              background: 'rgba(155,95,255,.12)',
              border: '1px solid rgba(155,95,255,.3)',
              color: '#9B5FFF', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 0 30px rgba(155,95,255,.15)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,95,255,.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(155,95,255,.12)'}
          >
            <MessageSquare size={14} />
            <span>Chat AI</span>
            <ChevronRight size={12} />
            {analysisData && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '9px', height: '9px', borderRadius: '50%', background: '#9B5FFF',
              }} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel — parte da SOTTO la navbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: PANEL_W }}
            animate={{ x: 0 }}
            exit={{ x: PANEL_W }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: `${NAVBAR_H}px`,
              right: 0,
              bottom: 0,
              width: `min(${PANEL_W}px, 100vw)`,
              zIndex: 35,
              display: 'flex', flexDirection: 'column',
              background: 'rgba(11,11,20,.98)',
              backdropFilter: 'blur(28px)',
              borderLeft: '1px solid rgba(255,255,255,.07)',
              borderTop:  '1px solid rgba(255,255,255,.07)',
              boxShadow: '-24px 0 60px rgba(0,0,0,.65)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '0 16px', height: '52px', flexShrink: 0,
              borderBottom: '1px solid rgba(255,255,255,.06)',
            }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                background: 'rgba(155,95,255,.12)', border: '1px solid rgba(155,95,255,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={14} color="#9B5FFF" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#9B5FFF', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Chat AI</div>
                {analysisData && (
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {analysisData.domain}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '8px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#9B5FFF', display: 'inline-block' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(155,95,255,.5)' }}>online</span>
              </div>

              {/* X — grande, colorato */}
              <button
                onClick={onToggle}
                style={{
                  width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                  background: 'rgba(255,59,139,.1)',
                  border: '1px solid rgba(255,59,139,.3)',
                  color: '#FF3B8B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 10,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,139,.25)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(255,59,139,.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,59,139,.1)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!analysisData && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', textAlign: 'center', padding: '20px' }}>
                  <Bot size={30} color="rgba(155,95,255,.25)" />
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,.2)', lineHeight: 1.7 }}>
                    Analizza prima un URL per attivare la chat contestuale.
                  </p>
                </div>
              )}
              {messages.map(renderMsg)}
              {loading && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(155,95,255,.1)', border: '1px solid rgba(155,95,255,.25)' }}>
                    <Bot size={11} color="#9B5FFF" />
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(24,24,40,.85)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '12px', borderTopLeftRadius: '3px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <motion.span key={i}
                        style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(155,95,255,.5)', display: 'block' }}
                        animate={{ opacity: [.3, 1, .3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * .2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick questions */}
            {analysisData && messages.length <= 1 && (
              <div style={{ padding: '8px 14px 6px' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,.18)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '7px' }}>Domande rapide</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {QUICK_Q.slice(0, 3).map(q => (
                    <button key={q} onClick={() => send(q)} style={{
                      padding: '5px 9px', borderRadius: '6px', cursor: 'pointer',
                      background: 'rgba(155,95,255,.06)', border: '1px solid rgba(155,95,255,.18)',
                      color: 'rgba(155,95,255,.65)', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,95,255,.15)'; e.currentTarget.style.color = '#9B5FFF' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(155,95,255,.06)'; e.currentTarget.style.color = 'rgba(155,95,255,.65)' }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 14px 18px', borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder={analysisData ? 'Fai una domanda...' : 'Analizza prima un URL'}
                  disabled={!analysisData || loading} rows={1}
                  style={{
                    flex: 1, minWidth: 0,
                    background: 'rgba(20,20,34,.8)',
                    border: '1px solid rgba(255,255,255,.09)',
                    borderRadius: '10px',
                    padding: '9px 12px',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                    color: 'rgba(255,255,255,.75)', outline: 'none',
                    resize: 'none', lineHeight: 1.6, maxHeight: '90px',
                    opacity: (!analysisData || loading) ? .35 : 1,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(155,95,255,.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.09)'}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || !analysisData || loading}
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(155,95,255,.12)', border: '1px solid rgba(155,95,255,.28)',
                    color: '#9B5FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: (!input.trim() || !analysisData || loading) ? 'not-allowed' : 'pointer',
                    opacity: (!input.trim() || !analysisData || loading) ? .35 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (input.trim() && analysisData && !loading) e.currentTarget.style.background = 'rgba(155,95,255,.25)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(155,95,255,.12)'}
                >
                  {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                </button>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,.1)', textAlign: 'center', marginTop: '5px' }}>
                Enter invia · Shift+Enter va a capo
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
