// components/Chat/ChatPanel.jsx — Fix completo: z-index, input funzionante, no border bianchi
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Bot, User, Loader2, X, ChevronRight } from 'lucide-react'
import { sendChatMessage } from '../../lib/api'

const QUICK_QUESTIONS = [
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
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350)
  }, [isOpen])

  useEffect(() => {
    if (analysisData && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Ho analizzato **${analysisData.domain}** — Risk Score ${analysisData.report.riskScore}/10 (${analysisData.report.riskLevel}).\n\n${analysisData.report.summary}\n\nHai domande specifiche sul report?`,
      }])
    }
  }, [analysisData])

  const buildContext = () => {
    if (!analysisData) return {}
    return {
      url:             analysisData.url,
      riskScore:       analysisData.report.riskScore,
      riskLevel:       analysisData.report.riskLevel,
      summary:         analysisData.report.summary,
      verdict:         analysisData.report.verdict,
      trackerList:     analysisData.extractedData.trackerList,
      scriptCount:     analysisData.extractedData.scriptCount,
      externalDomains: analysisData.extractedData.externalDomains,
      cspPresent:      analysisData.extractedData.cspPresent,
      hstsPresent:     analysisData.extractedData.hstsPresent,
      hasLogin:        analysisData.extractedData.hasLogin,
      hasObfuscation:  analysisData.extractedData.hasObfuscation,
      cookies:         analysisData.extractedData.cookies,
      sections:        analysisData.report.sections,
    }
  }

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading || !analysisData) return
    setInput('')
    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const reply = await sendChatMessage([...messages, userMsg], buildContext())
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Errore: ${err.message}. Riprova.` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={onToggle}
            className="group"
            style={{
              position: 'fixed', right: '24px', bottom: '32px', zIndex: 30,
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 18px', borderRadius: '16px',
              background: 'rgba(155,95,255,0.1)',
              border: '1px solid rgba(155,95,255,0.35)',
              color: '#9B5FFF',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(155,95,255,0.15)',
            }}
          >
            <MessageSquare size={15} />
            <span>Chat AI</span>
            <ChevronRight size={13} />
            {analysisData && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#9B5FFF',
              }} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '400px',
              zIndex: 40,
              display: 'flex', flexDirection: 'column',
              background: 'rgba(13,13,24,0.97)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(155,95,255,0.1)',
                border: '1px solid rgba(155,95,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={15} color="#9B5FFF" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                  fontWeight: 700, color: '#9B5FFF',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>Chat AI</div>
                {analysisData && (
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                    color: 'rgba(255,255,255,0.3)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{analysisData.domain}</div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9B5FFF' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(155,95,255,0.5)' }}>online</span>
              </div>

              {/* X button — z-index alto, pointer-events auto */}
              <button
                onClick={onToggle}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.2s',
                  position: 'relative', zIndex: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!analysisData && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', textAlign: 'center', padding: '0 16px' }}>
                  <Bot size={32} color="rgba(155,95,255,0.3)" />
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
                    Analizza prima un URL per attivare la chat contestuale.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '10px', flexShrink: 0,
                    background: msg.role === 'user' ? 'rgba(0,229,255,0.1)' : 'rgba(155,95,255,0.1)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,255,0.3)' : 'rgba(155,95,255,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {msg.role === 'user'
                      ? <User size={12} color="#00E5FF" />
                      : <Bot  size={12} color="#9B5FFF" />
                    }
                  </div>
                  <div style={{
                    maxWidth: '78%', padding: '10px 14px', borderRadius: '14px',
                    borderTopRightRadius: msg.role === 'user' ? '4px' : '14px',
                    borderTopLeftRadius:  msg.role === 'user' ? '14px' : '4px',
                    background: msg.role === 'user' ? 'rgba(0,229,255,0.08)' : 'rgba(24,24,40,0.8)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                    color: msg.role === 'user' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.65)',
                    lineHeight: 1.7,
                  }}>
                    {msg.content.split('\n').map((line, j) => (
                      <span key={j}>
                        {line.replace(/\*\*(.*?)\*\*/g, '§$1§').split('§').map((part, k) =>
                          k % 2 === 1
                            ? <strong key={k} style={{ color: msg.role === 'user' ? '#00E5FF' : '#9B5FFF' }}>{part}</strong>
                            : part
                        )}
                        {j < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(155,95,255,0.1)', border: '1px solid rgba(155,95,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bot size={12} color="#9B5FFF" />
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: '14px', borderTopLeftRadius: '4px',
                    background: 'rgba(24,24,40,0.8)', border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', gap: '6px', alignItems: 'center',
                  }}>
                    {[0,1,2].map(i => (
                      <motion.span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(155,95,255,0.5)', display: 'block' }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            {analysisData && messages.length <= 1 && (
              <div style={{ padding: '0 16px 10px' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                  Domande rapide
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_QUESTIONS.slice(0, 3).map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                      background: 'rgba(155,95,255,0.06)', border: '1px solid rgba(155,95,255,0.2)',
                      color: 'rgba(155,95,255,0.7)', fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '9px', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,95,255,0.15)'; e.currentTarget.style.color = '#9B5FFF' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(155,95,255,0.06)'; e.currentTarget.style.color = 'rgba(155,95,255,0.7)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div style={{
              padding: '12px 16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={analysisData ? 'Fai una domanda sul report...' : 'Analizza prima un URL'}
                  disabled={!analysisData || loading}
                  rows={1}
                  style={{
                    flex: 1, minWidth: 0,
                    background: 'rgba(24,24,40,0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px', color: 'rgba(255,255,255,0.75)',
                    outline: 'none', resize: 'none',
                    lineHeight: 1.6, maxHeight: '100px',
                    opacity: (!analysisData || loading) ? 0.35 : 1,
                    cursor: (!analysisData || loading) ? 'not-allowed' : 'text',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(155,95,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || !analysisData || loading}
                  style={{
                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                    background: 'rgba(155,95,255,0.12)',
                    border: '1px solid rgba(155,95,255,0.3)',
                    color: '#9B5FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: (!input.trim() || !analysisData || loading) ? 'not-allowed' : 'pointer',
                    opacity: (!input.trim() || !analysisData || loading) ? 0.35 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(155,95,255,0.25)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(155,95,255,0.12)'}
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '8px',
                color: 'rgba(255,255,255,0.12)', textAlign: 'center', marginTop: '6px',
              }}>
                Enter per inviare · Shift+Enter per andare a capo
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
