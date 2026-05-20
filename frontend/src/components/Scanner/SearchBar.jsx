// ─────────────────────────────────────────────────────────
//  components/Scanner/SearchBar.jsx
//  Barra di ricerca centrale con animazione scanning
// ─────────────────────────────────────────────────────────
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Shield, AlertTriangle, X } from 'lucide-react'

export default function SearchBar({ onAnalyze, isLoading }) {
  const [url, setUrl]       = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim() || isLoading) return
    onAnalyze(url.trim())
  }

  const handleClear = () => {
    setUrl('')
    inputRef.current?.focus()
  }

  const placeholder = 'https://example.com — inserisci un URL da analizzare'

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Pre-label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mb-4"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-cyan" />
        <span className="font-mono text-[10px] text-cyan/60 tracking-[.25em] uppercase">
          XyberLabs · Link Scanner AI · ready
        </span>
      </motion.div>

      {/* Search form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`relative rounded-2xl transition-all duration-300 corner-bracket ${
            focused
              ? 'shadow-[0_0_0_1px_rgba(0,229,255,.4),0_0_40px_rgba(0,229,255,.15)]'
              : 'shadow-[0_0_0_1px_rgba(255,255,255,.08)]'
          }`}
        >
          {/* Scanning animation while loading */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              >
                <div className="scan-sweep" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background */}
          <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
            focused ? 'bg-cyan/3' : 'bg-bg2/80'
          } backdrop-blur-xl`} />

          {/* Content */}
          <div className="relative flex items-center gap-4 px-5 py-4">

            {/* Icon */}
            <div className={`flex-shrink-0 transition-colors duration-300 ${
              isLoading ? 'text-cyan animate-spin' : focused ? 'text-cyan' : 'text-white/30'
            }`}>
              {isLoading
                ? <Loader2 size={20} />
                : <Search size={20} />
              }
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 bg-transparent font-mono text-sm text-white placeholder-white/20 outline-none disabled:opacity-40 min-w-0"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />

            {/* Clear */}
            {url && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors p-1"
              >
                <X size={16} />
              </button>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={!url.trim() || isLoading}
              whileHover={!isLoading && url ? { scale: 1.03 } : {}}
              whileTap={!isLoading && url ? { scale: 0.97 } : {}}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs tracking-widest uppercase transition-all duration-300 ${
                url.trim() && !isLoading
                  ? 'bg-cyan text-black shadow-glow-sm hover:shadow-glow-cyan cursor-pointer'
                  : 'bg-white/5 text-white/25 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Shield size={13} />
                  Analyze
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.form>

      {/* Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-4 mt-3 px-1"
      >
        {[
          { icon: Shield,        text: 'Safe fetch only — nessun JS eseguito' },
          { icon: AlertTriangle, text: 'Solo analisi HTML + headers' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <Icon size={11} className="text-white/20" />
            <span className="font-mono text-[10px] text-white/20 tracking-wide">{text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
