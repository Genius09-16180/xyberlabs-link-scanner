// ─────────────────────────────────────────────────────────
//  pages/ScannerPage.jsx — Pagina principale dello scanner
// ─────────────────────────────────────────────────────────
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, RotateCcw } from 'lucide-react'

import Navbar            from '../components/Layout/Navbar'
import Footer            from '../components/Layout/Footer'
import SearchBar         from '../components/Scanner/SearchBar'
import ScanningAnimation from '../components/Scanner/ScanningAnimation'
import ReportView        from '../components/Report/ReportView'
import ChatPanel         from '../components/Chat/ChatPanel'
import { analyzeUrl, saveLink } from '../lib/api'

// Background particles / orbs (pure CSS, no canvas)
function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute w-[600px] h-[600px] -top-32 -right-32 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,.07) 0%, transparent 70%)',
                 animation: 'orb-drift 18s ease-in-out infinite' }} />
      <div className="absolute w-[500px] h-[500px] -bottom-20 -left-20 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(155,95,255,.05) 0%, transparent 70%)',
                 animation: 'orb-drift 22s ease-in-out 3s infinite reverse' }} />
      <style>{`
        @keyframes orb-drift {
          0%,100% { transform: translate(0,0); }
          33%      { transform: translate(40px,-30px); }
          66%      { transform: translate(-20px,40px); }
        }
      `}</style>
    </div>
  )
}

export default function ScannerPage() {
  const [state, setState]       = useState('idle') // idle | scanning | done | error
  const [analysisData, setAnalysisData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [scanUrl, setScanUrl]   = useState('')
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
      // Auto-open chat after a short delay
      setTimeout(() => setChatOpen(true), 1200)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Errore durante l\'analisi.'
      setErrorMsg(msg)
      setState('error')
    }
  }, [])

  const handleAddToBoard = useCallback(async () => {
    if (!analysisData) return
    try {
      await saveLink({
        url:      analysisData.url,
        domain:   analysisData.domain,
        category: analysisData.report?.riskLevel === 'LOW'      ? 'safe'
                : analysisData.report?.riskLevel === 'CRITICAL'  ? 'phishing'
                : analysisData.report?.riskLevel === 'HIGH'      ? 'dangerous'
                : 'suspicious',
        report:        analysisData.report,
        extractedData: {
          ...analysisData.extractedData,
          statusCode:   analysisData.status,
          redirectChain:analysisData.redirectChain,
        },
        boardPosition: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 300 + 100,
        },
      })
      navigate('/board')
    } catch (err) {
      console.error('Add to board failed:', err)
    }
  }, [analysisData, navigate])

  const handleReset = () => {
    setState('idle')
    setAnalysisData(null)
    setErrorMsg('')
    setChatOpen(false)
    setScanUrl('')
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Orbs />
      <Navbar />

      {/* Main content */}
      <main className="flex-1 relative z-10 pt-24 pb-8">
        <div className={`max-w-5xl mx-auto px-5 transition-all duration-500 ${chatOpen ? 'pr-[420px]' : ''}`}>

          {/* ── Hero section ─────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-14 pt-10"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/8 border border-cyan/20 mb-8"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-cyan" />
                  <span className="font-mono text-[10px] text-cyan tracking-[.2em] uppercase">
                    Powered by Groq · LLaMA 3.1
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7, ease: [0.16,1,.3,1] }}
                  className="font-title font-black uppercase leading-[.88] tracking-tight mb-6"
                >
                  <span className="block text-white/30 text-xl sm:text-2xl tracking-[.1em] mb-3 font-mono font-normal">
                    XyberLabs presents
                  </span>
                  <span className="block text-4xl sm:text-6xl lg:text-7xl text-white">
                    Link
                  </span>
                  <span className="block text-4xl sm:text-6xl lg:text-7xl gradient-text-cyan text-glow-cyan">
                    Scanner AI
                  </span>
                </motion.h1>

                {/* Subhead */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="font-mono text-sm text-white/35 max-w-lg mx-auto leading-relaxed mb-12"
                >
                  Analisi di sicurezza AI su qualsiasi URL. Report dinamico, chat contestuale,
                  board interattiva. Solo HTML — nessun JS eseguito, nessuna navigazione reale.
                </motion.p>

                {/* SearchBar */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                >
                  <SearchBar onAnalyze={handleAnalyze} isLoading={false} />
                </motion.div>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap justify-center gap-2 mt-10"
                >
                  {[
                    { label: 'Report AI dinamico', color: 'cyan'   },
                    { label: 'Analisi tracker',     color: 'violet' },
                    { label: 'Header sicurezza',    color: 'pink'   },
                    { label: 'Chat contestuale',    color: 'gold'   },
                    { label: 'Board interattiva',   color: 'neon'   },
                  ].map(({ label, color }) => (
                    <span key={label}
                      className={`px-3 py-1.5 rounded-full border font-mono text-[9px] uppercase tracking-widest text-${color} border-${color}/25 bg-${color}/5`}
                    >
                      {label}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Scanning state ────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {state === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                {/* Compact searchbar at top */}
                <div className="mb-10">
                  <SearchBar onAnalyze={handleAnalyze} isLoading={true} />
                </div>
                <ScanningAnimation url={scanUrl} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error state ───────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {state === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-8"
              >
                <div className="mb-8">
                  <SearchBar onAnalyze={handleAnalyze} isLoading={false} />
                </div>
                <div className="max-w-xl mx-auto glass-card border-pink/20 bg-pink/3 p-6 corner-bracket">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink/10 border border-pink/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-pink text-lg">⚠</span>
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-pink uppercase tracking-widest mb-2">
                        Analisi fallita
                      </div>
                      <p className="font-mono text-xs text-white/50 leading-relaxed mb-4">{errorMsg}</p>
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
                      >
                        <RotateCcw size={12} />
                        Riprova
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Report state ──────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {state === 'done' && analysisData && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                {/* Compact searchbar + actions row */}
                <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <SearchBar onAnalyze={handleAnalyze} isLoading={false} />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/4 border border-white/8 font-mono text-xs text-white/40 hover:text-white hover:border-white/15 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                    <button
                      onClick={() => navigate('/board')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet/8 border border-violet/25 font-mono text-xs text-violet hover:bg-violet/18 transition-colors"
                    >
                      <LayoutDashboard size={12} />
                      Board
                    </button>
                  </div>
                </div>

                <ReportView
                  data={analysisData}
                  onAddToBoard={handleAddToBoard}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      {/* Chat panel */}
      <ChatPanel
        analysisData={analysisData}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(v => !v)}
      />
    </div>
  )
}
