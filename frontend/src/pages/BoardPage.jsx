// ─────────────────────────────────────────────────────────
//  pages/BoardPage.jsx — Board interattiva dei link
// ─────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, RefreshCw, Info,
  CheckCircle2, AlertTriangle, AlertOctagon, MinusCircle, HelpCircle
} from 'lucide-react'
import Navbar    from '../components/Layout/Navbar'
import LinkBoard from '../components/Board/LinkBoard'

const LEGEND = [
  { label: 'Safe',       color: 'text-neon   border-neon/30   bg-neon/8'   },
  { label: 'Suspicious', color: 'text-gold   border-gold/30   bg-gold/8'   },
  { label: 'Dangerous',  color: 'text-orange border-orange/30 bg-orange/8' },
  { label: 'Phishing',   color: 'text-pink   border-pink/30   bg-pink/8'   },
  { label: 'Tracker',    color: 'text-violet border-violet/30 bg-violet/8' },
  { label: 'Unknown',    color: 'text-white/40 border-white/10 bg-white/3' },
]

export default function BoardPage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-shrink-0 flex items-center gap-4 px-5 py-3 border-b border-white/5 bg-bg1/80 backdrop-blur-xl mt-16 z-20"
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 border border-white/8 font-mono text-xs text-white/40 hover:text-white hover:border-white/15 transition-colors"
        >
          <ArrowLeft size={13} />
          Scanner
        </button>

        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <span className="font-mono text-xs font-bold text-white/60 uppercase tracking-widest">
            Link Board
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-2">
          {LEGEND.map(({ label, color }) => (
            <span key={label} className={`px-2 py-1 rounded-lg border font-mono text-[8px] uppercase tracking-widest ${color}`}>
              {label}
            </span>
          ))}
        </div>

        {/* Tips */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg3/40 border border-white/5">
          <Info size={11} className="text-white/20" />
          <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest hidden md:block">
            Drag · Connect · Click per editare · Delete per rimuovere
          </span>
        </div>
      </motion.div>

      {/* Board canvas — fills remaining height */}
      <div className="flex-1 relative dot-grid overflow-hidden">
        <LinkBoard />
      </div>
    </div>
  )
}
