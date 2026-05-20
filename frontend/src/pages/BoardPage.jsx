// BoardPage.jsx — border-radius ripristinati
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Info } from 'lucide-react'
import Navbar    from '../components/Layout/Navbar'
import LinkBoard from '../components/Board/LinkBoard'

const LEGEND = [
  { label: 'Safe',       color: '#00FF99' },
  { label: 'Suspicious', color: '#F5C842' },
  { label: 'Dangerous',  color: '#FF7A40' },
  { label: 'Phishing',   color: '#FF3B8B' },
  { label: 'Tracker',    color: '#9B5FFF' },
  { label: 'Unknown',    color: 'rgba(255,255,255,.3)' },
]

export default function BoardPage() {
  const navigate = useNavigate()

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#07070D' }}>
      <Navbar />

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 18px', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(13,13,24,.85)', backdropFilter: 'blur(20px)', marginTop: '64px', zIndex: 20, flexWrap: 'wrap' }}
      >
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: 'rgba(255,255,255,.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.4)' }}>
          <ArrowLeft size={12} /> Scanner
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00E5FF', display: 'inline-block' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Link Board</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {LEGEND.map(({ label, color }) => (
            <span key={label} style={{ padding: '3px 8px', border: `1px solid ${color}35`, background: `${color}0A`, borderRadius: '5px', fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '7px' }}>
          <Info size={10} color="rgba(255,255,255,.2)" />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drag · Connetti · Click per editare · Del per rimuovere</span>
        </div>
      </motion.div>

      {/* Board canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundImage: 'radial-gradient(rgba(0,229,255,.13) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <LinkBoard />
      </div>
    </div>
  )
}
