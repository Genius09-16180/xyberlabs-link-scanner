// pages/ScannerPage.jsx — Layout ampio, localStorage per board, chat fix
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, RotateCcw, Shield, AlertTriangle } from 'lucide-react'

import Navbar            from '../components/Layout/Navbar'
import Footer            from '../components/Layout/Footer'
import SearchBar         from '../components/Scanner/SearchBar'
import ScanningAnimation from '../components/Scanner/ScanningAnimation'
import ReportView        from '../components/Report/ReportView'
import ChatPanel         from '../components/Chat/ChatPanel'
import { analyzeUrl }    from '../lib/api'

// Salva i link analizzati in localStorage per la board
function saveLinkToLocalStorage(data) {
  try {
    const existing = JSON.parse(localStorage.getItem('xyber_board_links') || '[]')
    const newLink = {
      _id:          data.id || `local_${Date.now()}`,
      url:          data.url,
      domain:       data.domain,
      category:     mapRiskToCategory(data.report?.riskScore || 0),
      label:        '',
      tags:         [],
      connections:  [],
      boardPosition:{ x: 120 + Math.random() * 500, y: 100 + Math.random() * 300 },
      report:       data.report,
      extractedData:{ ...data.extractedData, statusCode: data.status, redirectChain: data.redirectChain },
      analyzedAt:   new Date().toISOString(),
    }
    // Evita duplicati per URL
    const filtered = existing.filter(l => l.url !== data.url)
    localStorage.setItem('xyber_board_links', JSON.stringify([newLink, ...filtered].slice(0, 100)))
  } catch (e) {
    console.warn('localStorage save failed:', e)
  }
}

function mapRiskToCategory(score) {
  if (score <= 2) return 'safe'
  if (score <= 4) return 'suspicious'
  if (score <= 7) return 'dangerous'
  return 'phishing'
}

function Orbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <div style={{
        position: 'absolute', width: '700px', height: '700px', top: '-150px', right: '-150px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,.06) 0%, transparent 70%)',
        animation: 'orbDrift 18s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: '600px', height: '600px', bottom: '-100px', left: '-100px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,95,255,.04) 0%, transparent 70%)',
        animation: 'orbDrift 22s ease-in-out 3s infinite reverse',
      }} />
      <style>{`
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0); }
          33%      { transform: translate(40px,-30px); }
          66%      { transform: translate(-20px,40px); }
        }
      `}</style>
    </div>
  )
}

export default function ScannerPage() {
  const [state, setState]             = useState('idle')
  const [analysisData, setAnalysisData] = useState(null)
  const [errorMsg, setErrorMsg]       = useState('')
  const [chatOpen, setChatOpen]       = useState(false)
  const [scanUrl, setScanUrl]         = useState('')
  const navigate = useNavigate()

  const handleAnalyze = useCallback(async (url) => {
    setScanUrl(url)
    setState('scanning')
    setErrorMsg('')
    setAnalysisData(null)
    setChatOpen(false)
    try {
      const data = await analyzeUrl(url)
      setAnalysisData(data)
      setState('done')
      // Salva sempre in localStorage
      saveLinkToLocalStorage(data)
      setTimeout(() => setChatOpen(true), 1000)
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Errore durante l\'analisi.')
      setState('error')
    }
  }, [])

  const handleAddToBoard = useCallback(() => {
    if (analysisData) saveLinkToLocalStorage(analysisData)
    navigate('/board')
  }, [analysisData, navigate])

  const handleReset = () => {
    setState('idle')
    setAnalysisData(null)
    setErrorMsg('')
    setChatOpen(false)
    setScanUrl('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Orbs />
      <Navbar />

      <main style={{ flex: 1, position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '32px', transition: 'padding-right 0.35s ease' }}>
        <div style={{ maxWidth: chatOpen ? 'calc(100% - 420px)' : '1100px', margin: '0 auto', padding: '0 24px', transition: 'max-width 0.35s ease' }}>

          {/* IDLE */}
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} style={{ textAlign: 'center', paddingTop: '60px', paddingBottom: '40px' }}>
                {/* Badge */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '40px', background: 'rgba(0,229,255,.06)', border: '1px solid rgba(0,229,255,.2)', marginBottom: '36px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E5FF', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#00E5FF', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Powered by Groq · LLaMA 3.1</span>
                </motion.div>

                {/* Headline */}
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16,1,.3,1] }}
                  style={{ fontFamily: 'alfarn-2, sans-serif', fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, letterSpacing: '-0.01em', marginBottom: '24px' }}>
                  <span style={{ display: 'block', color: 'rgba(255,255,255,.25)', fontSize: 'clamp(14px,2vw,20px)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 400, letterSpacing: '0.12em', marginBottom: '12px' }}>XyberLabs presents</span>
                  <span style={{ display: 'block', color: 'white', fontSize: 'clamp(42px,8vw,80px)' }}>Link</span>
                  <span style={{ display: 'block', fontSize: 'clamp(42px,8vw,80px)', background: 'linear-gradient(90deg, #00E5FF, #00BFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 30px rgba(0,229,255,.4))' }}>Scanner AI</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'rgba(255,255,255,.35)', maxWidth: '520px', margin: '0 auto 48px', lineHeight: 1.7 }}>
                  Analisi di sicurezza AI su qualsiasi URL. Report dinamico, chat contestuale, board interattiva. Solo HTML — nessun JS eseguito.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  <SearchBar onAnalyze={handleAnalyze} isLoading={false} />
                </motion.div>

                {/* Feature pills */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                  style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '36px' }}>
                  {[
                    { label: 'Report AI dinamico', color: '#00E5FF' },
                    { label: 'Analisi tracker',    color: '#9B5FFF' },
                    { label: 'Header sicurezza',   color: '#FF3B8B' },
                    { label: 'Chat contestuale',   color: '#F5C842' },
                    { label: 'Board interattiva',  color: '#00FF99' },
                  ].map(({ label, color }) => (
                    <span key={label} style={{
                      padding: '6px 14px', borderRadius: '20px',
                      border: `1px solid ${color}30`, background: `${color}08`,
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                      color, textTransform: 'uppercase', letterSpacing: '0.12em',
                    }}>{label}</span>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCANNING */}
          <AnimatePresence mode="wait">
            {state === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: '20px', paddingBottom: '40px' }}>
                <div style={{ marginBottom: '40px' }}>
                  <SearchBar onAnalyze={handleAnalyze} isLoading={true} />
                </div>
                <ScanningAnimation url={scanUrl} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ERROR */}
          <AnimatePresence mode="wait">
            {state === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ paddingTop: '20px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <SearchBar onAnalyze={handleAnalyze} isLoading={false} />
                </div>
                <div style={{ maxWidth: '560px', margin: '0 auto', background: 'rgba(255,59,139,.04)', border: '1px solid rgba(255,59,139,.2)', borderRadius: '18px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,59,139,.1)', border: '1px solid rgba(255,59,139,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertTriangle size={18} color="#FF3B8B" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: '#FF3B8B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Analisi fallita</div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: '16px' }}>{errorMsg}</p>
                      <button onClick={handleReset} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                        background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                        color: 'rgba(255,255,255,.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                      }}>
                        <RotateCcw size={12} /> Riprova
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DONE */}
          <AnimatePresence mode="wait">
            {state === 'done' && analysisData && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: '16px' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <SearchBar onAnalyze={handleAnalyze} isLoading={false} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={handleReset} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '9px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                      color: 'rgba(255,255,255,.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                    }}>
                      <RotateCcw size={12} /> Reset
                    </button>
                    <button onClick={() => navigate('/board')} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '9px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: 'rgba(155,95,255,.08)', border: '1px solid rgba(155,95,255,.25)',
                      color: '#9B5FFF', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                    }}>
                      <LayoutDashboard size={12} /> Board
                    </button>
                  </div>
                </div>

                <ReportView data={analysisData} onAddToBoard={handleAddToBoard} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <ChatPanel analysisData={analysisData} isOpen={chatOpen} onToggle={() => setChatOpen(v => !v)} />
    </div>
  )
}
