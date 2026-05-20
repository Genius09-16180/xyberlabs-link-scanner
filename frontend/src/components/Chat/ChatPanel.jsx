// ─────────────────────────────────────────────────────────
//  components/Chat/ChatPanel.jsx
//  Chat AI contestuale al report
// ─────────────────────────────────────────────────────────
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
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  // Welcome message when report loads
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
      url:            analysisData.url,
      riskScore:      analysisData.report.riskScore,
      riskLevel:      analysisData.report.riskLevel,
      summary:        analysisData.report.summary,
      verdict:        analysisData.report.verdict,
      trackerList:    analysisData.extractedData.trackerList,
      scriptCount:    analysisData.extractedData.scriptCount,
      externalDomains:analysisData.extractedData.externalDomains,
      cspPresent:     analysisData.extractedData.cspPresent,
      hstsPresent:    analysisData.extractedData.hstsPresent,
      hasLogin:       analysisData.extractedData.hasLogin,
      hasObfuscation: analysisData.extractedData.hasObfuscation,
      cookies:        analysisData.extractedData.cookies,
      sections:       analysisData.report.sections,
    }
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading || !analysisData) return

    setInput('')
    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const allMsgs = [...messages, userMsg]
      const reply   = await sendChatMessage(allMsgs, buildContext())
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Errore nella risposta: ${err.message}. Riprova.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Toggle button — visible when panel is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={onToggle}
            className="fixed right-6 bottom-8 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-violet/10 border border-violet/30 text-violet font-mono text-xs font-bold uppercase tracking-widest hover:bg-violet/20 transition-all shadow-glow-violet group"
          >
            <MessageSquare size={15} />
            <span>Chat AI</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            {analysisData && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-violet animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-40 flex flex-col bg-bg1/95 backdrop-blur-2xl border-l border-white/8"
            style={{ boxShadow: '-20px 0 60px rgba(0,0,0,.5)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6">
              <div className="w-8 h-8 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center">
                <Bot size={15} className="text-violet" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs font-bold text-violet uppercase tracking-widest">Chat AI</div>
                {analysisData && (
                  <div className="font-mono text-[9px] text-white/30 truncate">{analysisData.domain}</div>
                )}
              </div>
              <div className="flex items-center gap-1.5 mr-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
                <span className="font-mono text-[9px] text-violet/50">online</span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {!analysisData && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <Bot size={32} className="text-violet/30" />
                  <p className="font-mono text-xs text-white/25 leading-relaxed">
                    Analizza prima un URL per attivare la chat contestuale.
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center border ${
                      msg.role === 'user'
                        ? 'bg-cyan/10 border-cyan/30'
                        : 'bg-violet/10 border-violet/30'
                    }`}>
                      {msg.role === 'user'
                        ? <User size={12} className="text-cyan" />
                        : <Bot  size={12} className="text-violet" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 font-mono text-[11px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan/10 border border-cyan/20 text-white/80 rounded-tr-sm'
                        : 'bg-bg3/80 border border-white/6 text-white/65 rounded-tl-sm'
                    }`}>
                      {/* Simple markdown-like bold parsing */}
                      {msg.content.split('\n').map((line, j) => (
                        <span key={j}>
                          {line.replace(/\*\*(.*?)\*\*/g, '§$1§').split('§').map((part, k) =>
                            k % 2 === 1
                              ? <strong key={k} className={msg.role === 'user' ? 'text-cyan' : 'text-violet'}>{part}</strong>
                              : part
                          )}
                          {j < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-violet" />
                  </div>
                  <div className="bg-bg3/80 border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      {[0,1,2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-violet/50"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            {analysisData && messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="font-mono text-[8px] text-white/20 tracking-widest uppercase mb-2">Domande rapide</div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.slice(0, 3).map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-2.5 py-1.5 rounded-lg bg-violet/5 border border-violet/20 text-violet/70 font-mono text-[9px] hover:bg-violet/15 hover:text-violet transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-5 pt-2 border-t border-white/6">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={analysisData ? 'Fai una domanda sul report...' : 'Analizza prima un URL'}
                  disabled={!analysisData || loading}
                  rows={1}
                  className="flex-1 bg-bg3/60 border border-white/8 rounded-xl px-4 py-3 font-mono text-xs text-white/70 placeholder-white/20 outline-none focus:border-violet/40 resize-none disabled:opacity-30 transition-colors max-h-28"
                  style={{ lineHeight: 1.6 }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || !analysisData || loading}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet/10 border border-violet/30 text-violet flex items-center justify-center hover:bg-violet/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
              <div className="font-mono text-[8px] text-white/15 mt-1.5 text-center">
                Enter per inviare · Shift+Enter per andare a capo
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
