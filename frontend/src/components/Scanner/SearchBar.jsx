// SearchBar.jsx — angoli tagliati netti, no doppio focus, no border-radius
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Shield, AlertTriangle, X } from 'lucide-react'

export default function SearchBar({ onAnalyze, isLoading }) {
  const [url, setUrl]         = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim() || isLoading) return
    onAnalyze(url.trim())
  }

  return (
    <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto' }}>

      {/* Pre-label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E5FF', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(0,229,255,.5)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          XyberLabs · Link Scanner AI · ready
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>

        {/* Corner decorations — angoli netti, senza border-radius */}
        <div style={{
          position: 'absolute', top: '-1px', left: '-1px',
          width: '16px', height: '16px', pointerEvents: 'none', zIndex: 2,
          borderTop: `2px solid ${focused ? 'rgba(0,229,255,.7)' : 'rgba(0,229,255,.3)'}`,
          borderLeft: `2px solid ${focused ? 'rgba(0,229,255,.7)' : 'rgba(0,229,255,.3)'}`,
          transition: 'border-color 0.3s',
        }} />
        <div style={{
          position: 'absolute', bottom: '-1px', right: '-1px',
          width: '16px', height: '16px', pointerEvents: 'none', zIndex: 2,
          borderBottom: `2px solid ${focused ? 'rgba(0,229,255,.7)' : 'rgba(0,229,255,.3)'}`,
          borderRight: `2px solid ${focused ? 'rgba(0,229,255,.7)' : 'rgba(0,229,255,.3)'}`,
          transition: 'border-color 0.3s',
        }} />

        {/* Scan sweep */}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
              <div className="scan-sweep" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main container — bordi netti, nessun border-radius */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 18px',
          background: focused ? 'rgba(0,229,255,.03)' : 'rgba(17,17,32,.85)',
          border: `1px solid ${focused ? 'rgba(0,229,255,.35)' : 'rgba(255,255,255,.08)'}`,
          borderRadius: 0, // ANGOLI NETTI
          backdropFilter: 'blur(20px)',
          boxShadow: focused ? '0 0 40px rgba(0,229,255,.12)' : 'none',
          transition: 'all 0.25s ease',
        }}>

          {/* Search icon */}
          <div style={{ flexShrink: 0, color: isLoading ? '#00E5FF' : focused ? '#00E5FF' : 'rgba(255,255,255,.3)', transition: 'color 0.25s' }}>
            {isLoading ? <Loader2 size={19} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={19} />}
          </div>

          {/* Input — nessun outline, nessun border proprio */}
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="https://example.com — inserisci un URL da analizzare"
            disabled={isLoading}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            style={{
              flex: 1, minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: 'rgba(255,255,255,.9)',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'text',
            }}
          />

          {/* Clear */}
          {url && !isLoading && (
            <button type="button" onClick={() => { setUrl(''); inputRef.current?.focus() }}
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.2)', padding: '4px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.2)'}
            >
              <X size={15} />
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px',
              background: url.trim() && !isLoading ? '#00E5FF' : 'rgba(255,255,255,.05)',
              border: 'none',
              borderRadius: 0, // ANGOLI NETTI
              fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: url.trim() && !isLoading ? '#07070D' : 'rgba(255,255,255,.2)',
              cursor: url.trim() && !isLoading ? 'pointer' : 'not-allowed',
              boxShadow: url.trim() && !isLoading ? '0 0 22px rgba(0,229,255,.35)' : 'none',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { if (url.trim() && !isLoading) e.currentTarget.style.boxShadow = '0 0 35px rgba(0,229,255,.55)' }}
            onMouseLeave={e => { if (url.trim() && !isLoading) e.currentTarget.style.boxShadow = '0 0 22px rgba(0,229,255,.35)' }}
          >
            {isLoading
              ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Scanning</>
              : <><Shield size={12} /> Analyze</>
            }
          </button>
        </div>
      </form>

      {/* Hints */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '10px', paddingLeft: '2px' }}>
        {[
          { icon: Shield,        text: 'Safe fetch only — nessun JS eseguito' },
          { icon: AlertTriangle, text: 'Solo analisi HTML + headers' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon size={10} color="rgba(255,255,255,.18)" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,.18)', letterSpacing: '0.05em' }}>{text}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        input::placeholder { color: rgba(255,255,255,.18); }
        input::-webkit-input-placeholder { color: rgba(255,255,255,.18); }
      `}</style>
    </div>
  )
}
